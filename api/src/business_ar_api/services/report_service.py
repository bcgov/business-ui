# Copyright © 2024 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
# the License. You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
# an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
# specific language governing permissions and limitations under the License.
"""Produces a PDF output based on templates and JSON messages."""
import base64
import json
import os
from datetime import datetime
from http import HTTPStatus
from pathlib import Path
from typing import Final

import requests
from business_ar_api.common.auth import jwt
from business_ar_api.models.filing import FilingSerializer
from business_ar_api.services import BusinessService, FilingService
from business_ar_api.utils.corps_metadata import CORPS_METADATA
from business_ar_api.utils.legislation_datetime import LegislationDatetime
from business_ar_api.utils.registrar_metadata import RegistrarInfo
from flask import current_app, jsonify

OUTPUT_DATE_FORMAT: Final = "%B %-d, %Y"
REPORTS_METADATA = {
    "annualReport": {
        "filingDescription": "Annual Report",
        "fileName": "bcAnnualReport",
    }
}


class ReportService:
    """Service to create report outputs."""

    def __init__(self):
        """Create the Report instance."""
        self._filing = None
        self._business = None
        self._filing_json = None
        self._report_key = None
        self._report_date_time = LegislationDatetime.now()

    def generate_report(self, filing_id: int, report_key: str):
        self._report_key = report_key
        self._filing = FilingService.find_filing_by_id(filing_id)
        self._business = BusinessService.find_by_internal_id(self._filing.business_id)
        business_details = BusinessService.get_business_details_from_colin(
            self._business.identifier, self._business.legal_type, self._business.id
        )
        business_json = business_details.get("business")
        self._filing_json = FilingSerializer.to_dict(self._filing)
        self._filing_json["filing"]["business"] = business_json

        headers = {
            "Authorization": "Bearer {}".format(jwt.get_token_auth_header()),
            "Content-Type": "application/json",
        }
        data = {
            "reportName": self._get_report_filename(),
            "template": "'"
            + base64.b64encode(bytes(self._get_template(), "utf-8")).decode()
            + "'",
            "templateVars": self._get_template_data(),
        }
        response = requests.post(
            url=current_app.config.get("REPORT_SVC_URL"),
            headers=headers,
            data=json.dumps(data),
        )

        if response.status_code != HTTPStatus.OK:
            return jsonify(message=str(response.content)), response.status_code

        return current_app.response_class(
            response=response.content,
            status=response.status_code,
            mimetype="application/pdf",
        )

    def _get_report_filename(self):
        filing_date = str(self._filing.filing_date)[:19]
        legal_entity_number = self._business.identifier
        description = REPORTS_METADATA[self._report_key]["filingDescription"]
        return "{}_{}_{}.pdf".format(
            legal_entity_number, filing_date, description
        ).replace(" ", "_")

    def _get_template(self):
        try:
            template_path = current_app.config.get("REPORT_TEMPLATE_PATH")
            template_code = Path(
                f"{template_path}/{self._get_template_filename()}"
            ).read_text()
            # substitute template parts
            template_code = self._substitute_template_parts(template_code)
        except Exception as err:
            current_app.logger.error(err)
            raise err
        return template_code

    def _get_template_filename(self):
        file_name = REPORTS_METADATA[self._report_key]["fileName"]
        return "{}.html".format(file_name)

    def _get_template_data(self):
        filing = self._filing_json.get("filing")
        filing["header"]["reportType"] = self._report_key
        self._set_dates(filing)
        self._set_description(filing)
        self._set_meta_info(filing)
        self._set_registrar_info(filing)
        return filing

    def _set_registrar_info(self, filing):
        filing["registrarInfo"] = {
            **RegistrarInfo.get_registrar_info(self._filing.filing_date)
        }

    def _set_description(self, filing):
        corp_metadata = [
            corp
            for corp in CORPS_METADATA
            if corp.get("corp_type_cd") == self._business.legal_type
        ]
        if corp_metadata:
            filing["entityDescription"] = corp_metadata[0].get("full_desc")
            filing["entityAct"] = corp_metadata[0].get("legislation")

    def _set_dates(self, filing):
        # Filing Date
        filing_datetime = LegislationDatetime.as_legislation_timezone(
            self._filing.filing_date
        )
        filing["filing_date_time"] = LegislationDatetime.format_as_report_string(
            filing_datetime
        )
        # For Annual Report - Set AGM date as the effective date
        agm_date_str = filing.get("annualReport", {}).get(
            "annualGeneralMeetingDate", None
        )
        if agm_date_str:
            agm_date = datetime.fromisoformat(agm_date_str)
            filing["agm_date"] = agm_date.strftime(OUTPUT_DATE_FORMAT)
            # for AR, the effective date is the AGM date
            filing["effective_date"] = agm_date.strftime(OUTPUT_DATE_FORMAT)
        else:
            filing["agm_date"] = "No AGM"

        filing["report_date_time"] = LegislationDatetime.format_as_report_string(
            self._report_date_time
        )
        recognition_date_time = LegislationDatetime.as_utc_timezone_datetime(
            filing["business"]["foundingDate"]
        )
        filing["recognition_date_time"] = LegislationDatetime.format_as_report_string(
            recognition_date_time
        )

    def _set_meta_info(self, filing):
        filing["environment"] = (
            f"{self._get_environment()} FILING #{self._filing.id}".lstrip()
        )
        # Appears in the Description section of the PDF Document Properties as Title.
        filing["meta_title"] = "{} on {}".format(
            REPORTS_METADATA[self._report_key]["filingDescription"],
            filing["filing_date_time"],
        )

        # Appears in the Description section of the PDF Document Properties as Subject.
        filing["meta_subject"] = "{} ({})".format(
            self._business.legal_name,
            self._business.identifier,
        )

    def _get_environment(self):
        namespace = os.getenv("POD_NAMESPACE", "").lower()
        if namespace.endswith("dev"):
            return "DEV"
        if namespace.endswith("test"):
            return "TEST"
        return ""

    def _substitute_template_parts(self, template_code):
        """Substitute template parts in main template.

        Template parts are marked by [[partname.html]] in templates.

        This functionality is restricted by:
        - markup must be exactly [[partname.html]] and have no extra spaces around file name
        - template parts can only be one level deep, ie: this rudimentary framework does not handle nested template
        parts. There is no recursive search and replace.

        :param template_code: string
        :return: template_code string, modified.
        """
        template_path = current_app.config.get("REPORT_TEMPLATE_PATH")
        template_parts = [
            "bc-annual-report/legalObligations",
            "common/style",
            "common/businessDetails",
            "footer",
            "logo",
            "macros",
            "certification",
        ]
        # substitute template parts - marked up by [[filename]]
        for template_part in template_parts:
            template_part_code = Path(
                f"{template_path}/template-parts/{template_part}.html"
            ).read_text()
            template_code = template_code.replace(
                "[[{}.html]]".format(template_part), template_part_code
            )

        return template_code
