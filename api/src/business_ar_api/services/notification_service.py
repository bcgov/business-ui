# Copyright © 2024 Province of British Columbia
#
# Licensed under the BSD 3 Clause License, (the "License");
# you may not use this file except in compliance with the License.
# The template for the license can be found here
#    https://opensource.org/license/bsd-3-clause/
#
# Redistribution and use in source and binary forms,
# with or without modification, are permitted provided that the
# following conditions are met:
#
# 1. Redistributions of source code must retain the above copyright notice,
#    this list of conditions and the following disclaimer.
#
# 2. Redistributions in binary form must reproduce the above copyright notice,
#    this list of conditions and the following disclaimer in the documentation
#    and/or other materials provided with the distribution.
#
# 3. Neither the name of the copyright holder nor the names of its contributors
#    may be used to endorse or promote products derived from this software
#    without specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS”
# AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
# THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
# ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
# LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
# CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
# SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
# INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
# CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
# ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
# POSSIBILITY OF SUCH DAMAGE.
"""
This module contains the services necessary for handling notifications.
"""
import base64
import re
from datetime import datetime
from http import HTTPStatus
from pathlib import Path

import requests
from business_ar_api.exceptions import BusinessException
from business_ar_api.models import Business as BusinessModel
from business_ar_api.models import Filing as FilingModel
from business_ar_api.services import (
    AccountService,
    BusinessService,
    FilingService,
    InvitationService,
)
from business_ar_api.services.report_service import ReportService
from business_ar_api.utils.legislation_datetime import LegislationDatetime
from flask import current_app
from jinja2 import Template


class NotificationService:
    """
    The `NotificationService` class is responsible for handling filing notifications.
    """

    @staticmethod
    def send_filing_complete_email(filing_id: int):
        client_id = current_app.config.get("AUTH_SVC_CLIENT_ID")
        client_secret = current_app.config.get("AUTH_SVC_CLIENT_SECRET")
        token = AccountService.get_service_client_token(client_id, client_secret)
        email_msg = NotificationService._compose_email(filing_id, token)
        NotificationService._send_email(email_msg, token)

    @staticmethod
    def _compose_email(filing_id: int, token: str):
        filing = FilingService.find_filing_by_id(filing_id)
        business = BusinessService.find_by_internal_id(filing.business_id)
        filing_json = FilingService.serialize(filing)
        filing_data = filing_json["filing"]["annualReport"]
        filing_header = filing_json["filing"]["header"]

        template = Path(
            f'{current_app.config.get("EMAIL_TEMPLATE_PATH")}/BC-AR-PAID.html'
        ).read_text()
        filled_template = NotificationService._substitute_template_parts(template)
        jinja_template = Template(filled_template, autoescape=True)
        filing_date_time = NotificationService._get_tmz_date_time_string(
            filing.filing_date
        )

        html_out = jinja_template.render(
            business=business.json(),
            filing=filing_data,
            header=filing_header,
            filing_date_time=filing_date_time,
        )
        # get attachments
        pdfs = NotificationService._get_pdfs(token, business, filing)

        # get recipients
        account_id = filing.payment_account
        contact_details = AccountService.get_account_contact(account_id)

        recipients_list = []
        for contact in contact_details.get("contacts"):
            if email := contact.get("email"):
                recipients_list.append(email)
        if not recipients_list:
            active_invitations = InvitationService.find_active_invitation_by_business(
                business.id
            )
            if active_invitations:
                recipients_list.append(active_invitations[0].recipients)
        if recipients_list:
            recipients = ",".join(recipients_list)
        else:
            return {}

        subject = f"{business.legal_name} - Confirmation of Annual Report"
        return {
            "recipients": recipients,
            "requestBy": "BCRegistries@gov.bc.ca",
            "content": {"subject": subject, "body": f"{html_out}", "attachments": pdfs},
        }

    @staticmethod
    def _get_pdfs(token: str, business: BusinessModel, filing: FilingModel) -> list:
        """Get the outputs for the filing."""
        pdfs = []
        attach_order = 1
        headers = {"Accept": "application/pdf", "Authorization": f"Bearer {token}"}
        if filing.status == FilingModel.Status.COMPLETED.value:
            # add receipt pdf
            url = f'{current_app.config.get("PAY_API_URL")}/payment-requests/{filing.invoice_id}/receipts'
            payload = {
                "corpName": business.legal_name,
                "filingDateTime": filing.filing_date.isoformat(),
                "effectiveDateTime": "",
                "filingIdentifier": str(filing.id),
            }
            if business.tax_id:
                payload["businessNumber"] = business.tax_id
            receipt = requests.post(
                url,
                json=payload,
                headers=headers,
            )
            if receipt.status_code != HTTPStatus.CREATED:
                current_app.logger.error(
                    "Failed to get receipt pdf for filing: %s", filing.id
                )
            else:
                receipt_encoded = base64.b64encode(receipt.content)
                pdfs.append(
                    {
                        "fileName": "Receipt.pdf",
                        "fileBytes": receipt_encoded.decode("utf-8"),
                        "fileUrl": "",
                        "attachOrder": str(attach_order),
                    }
                )
                attach_order += 1
            report_service = ReportService()
            filing_type = "annualReport"
            filing_pdf = report_service.generate_report(filing.id, filing_type)
            filing_pdf_encoded = base64.b64encode(filing_pdf.get_data())
            file_name = filing_type[0].upper() + " ".join(
                re.findall("[a-zA-Z][^A-Z]*", filing_type[1:])
            )
            if (
                ar_date := filing.filing_json["filing"]
                .get(filing_type, {})
                .get("annualReportDate")
            ):
                file_name = f"{ar_date[:4]} {file_name}"

            pdfs.append(
                {
                    "fileName": f"{file_name}.pdf",
                    "fileBytes": filing_pdf_encoded.decode("utf-8"),
                    "fileUrl": "",
                    "attachOrder": str(attach_order),
                }
            )
            attach_order += 1
        return pdfs

    @staticmethod
    def _substitute_template_parts(template_code: str) -> str:
        """Substitute template parts in main template.

        Template parts are marked by [[partname.html]] in templates.

        This functionality is restricted by:
        - markup must be exactly [[partname.html]] and have no extra spaces around file name
        - template parts can only be one level deep, ie: this rudimentary framework does not handle nested template
        parts. There is no recursive search and replace.
        """
        template_parts = [
            "business-dashboard-link",
            "business-info",
            "footer",
            "header",
            "logo",
            "pdf-notice",
            "style",
            "divider",
            "20px",
            "whitespace-16px",
        ]

        # substitute template parts - marked up by [[filename]]
        for template_part in template_parts:
            template_part_code = Path(
                f'{current_app.config.get("EMAIL_TEMPLATE_PATH")}/common/{template_part}.html'
            ).read_text()
            template_code = template_code.replace(
                "[[{}.html]]".format(template_part), template_part_code
            )

        return template_code

    @staticmethod
    def _send_email(email: dict, token: str):
        """Send the email."""
        if (
            not email
            or "recipients" not in email
            or "content" not in email
            or "body" not in email["content"]
        ):
            raise BusinessException(
                "Unsuccessful sending email - required email object(s) is empty."
            )

        if (
            not email["recipients"]
            or not email["content"]
            or not email["content"]["body"]
        ):
            raise BusinessException(
                "Unsuccessful sending email - required email object(s) is missing. "
            )

        resp = requests.post(
            f'{current_app.config.get("NOTIFY_API_URL")}',
            json=email,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}",
            },
        )
        if resp.status_code != HTTPStatus.OK:
            raise BusinessException(
                "Unsuccessful response when sending email.", "", resp.status_code
            )

    @staticmethod
    def _get_tmz_date_time_string(filing_date):
        filing_date = datetime.fromisoformat(filing_date.isoformat())
        leg_tmz_filing_date = LegislationDatetime.as_legislation_timezone(filing_date)
        hour = leg_tmz_filing_date.strftime("%I").lstrip("0")
        am_pm = leg_tmz_filing_date.strftime("%p").lower()
        leg_tmz_filing_date = leg_tmz_filing_date.strftime(
            f"%B %d, %Y at {hour}:%M {am_pm} Pacific time"
        )
        return leg_tmz_filing_date
