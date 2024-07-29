# Copyright © 2024 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the 'License');
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an 'AS IS' BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""API endpoints for reports."""
from flask import Blueprint, current_app
from flask_cors import cross_origin
from http import HTTPStatus

from business_ar_api.common.auth import jwt as _jwt
from business_ar_api.exceptions.responses import error_response
from business_ar_api.services import BusinessService
from business_ar_api.services import FilingService
from business_ar_api.services import ReportService

bp = Blueprint(
    "reports",
    __name__,
    url_prefix=f"/v1/business/<string:identifier>/filings/<int:filing_id>/reports",
)


@bp.route("/<string:report_type>", methods=["GET"])
@cross_origin(origin="*")
@_jwt.requires_auth
def get_filing_report(identifier: str, filing_id: int, report_type: str):
    """Get the filing report."""
    try:
        business = BusinessService.find_by_business_identifier(identifier)
        if not business:
            return error_response(f"No matching business.", HTTPStatus.NOT_FOUND)
        filing = FilingService.find_filing_by_id(filing_id)
        if not filing:
            return error_response(f"No matching filing.", HTTPStatus.NOT_FOUND)
        report_service = ReportService()
        return report_service.generate_report(filing_id, report_type)
    except Exception as exception:
        current_app.logger.error("Exception while generating report", exception)
        return error_response(exception.message, exception.status_code)
