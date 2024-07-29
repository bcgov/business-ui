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
"""API endpoints for managing business."""

from http import HTTPStatus

from business_ar_api.common.auth import jwt as _jwt
from business_ar_api.enums.enum import Role
from business_ar_api.exceptions.exceptions import (
    BusinessException,
    ExternalServiceException,
)
from business_ar_api.exceptions.responses import error_response
from business_ar_api.models import AnnualReportReminder as AnnualReportReminderModel
from business_ar_api.models import Business as BusinessModel
from business_ar_api.models import Invitations as InvitationsModel
from business_ar_api.services import (
    AccountService,
    AnnualReportReminderService,
    BusinessService,
    InvitationService,
)
from flask import Blueprint, current_app, jsonify, request
from flask_cors import cross_origin

bp = Blueprint("business_keys", __name__, url_prefix=f"/v1/business")


@bp.route("/token/<string:token>", methods=["GET"])
@cross_origin(origin="*")
def get_business_details_using_token(token):
    """Get business details using nano id."""
    if not token:
        return error_response("Please provide token.", HTTPStatus.BAD_REQUEST)
    business_id = None

    invitation = InvitationService.find_invitation_by_token(token)
    if invitation and invitation.status == InvitationsModel.Status.SENT:
        business_id = invitation.business_id
    else:
        reminder: AnnualReportReminderModel = (
            AnnualReportReminderService.find_ar_reminder_by_token(token)
        )
        if reminder and reminder.status == AnnualReportReminderModel.Status.SENT:
            business_id = reminder.business_id

    if business_id:
        business: BusinessModel = BusinessModel.find_by_id(business_id)
        if not business:
            return error_response(f"No matching business.", HTTPStatus.NOT_FOUND)
        business_json = business.json()
        business_details_from_colin = BusinessService.get_business_details_from_colin(
            business.identifier, business.legal_type, business.id
        )
        business_json["legalName"] = business_details_from_colin.get("business").get(
            "legalName"
        )
        business_json["status"] = business_details_from_colin.get("business").get(
            "corpState"
        )
        return business_json, HTTPStatus.OK
    else:
        return error_response("Invalid token.", HTTPStatus.BAD_REQUEST)


@bp.route("/<string:identifier>", methods=["GET"])
@cross_origin(origin="*")
@_jwt.requires_auth
def get_business_details(identifier):
    """Get business details from colin"""
    if not identifier:
        return error_response(
            "Please provide business identifier.", HTTPStatus.BAD_REQUEST
        )

    business: BusinessModel = BusinessService.find_by_business_identifier(identifier)
    if not business:
        return error_response(f"No matching business.", HTTPStatus.NOT_FOUND)

    try:
        business_details = BusinessService.get_business_details_from_colin(
            business.identifier, business.legal_type, business.id
        )
    except Exception as exception:
        current_app.logger.error(
            "Error while fetching business details from Colin.", exception
        )
        return error_response(
            f"Error while fetching business details from Colin.",
            HTTPStatus.INTERNAL_SERVER_ERROR,
        )

    # If the call fails do not populate office details in the response.
    try:
        business_office_details = (
            BusinessService.get_business_office_details_from_colin(
                business.identifier, business.legal_type
            )
        )
        business_details["offices"] = business_office_details
    except Exception as exception:
        current_app.logger.error(
            "Error while fetching business office from Colin.", exception
        )

    # If the call fails do not populate party details in the response.
    try:
        business_party_details = BusinessService.get_business_party_details_from_colin(
            business.identifier, business.legal_type
        )
        business_details["parties"] = business_party_details.get("directors", [])
    except Exception as exception:
        current_app.logger.error(
            "Error while fetching business parties from Colin.", exception
        )

    return business_details, HTTPStatus.OK


@bp.route("/auth", methods=["POST"])
@cross_origin(origin="*")
@_jwt.has_one_of_roles([Role.STAFF_MANAGE_ACCOUNTS.value, Role.ACCOUNT_HOLDER.value])
def create_business_in_auth():
    """Create Business in sbc-auth."""

    json_input = request.get_json()
    business_identifier = json_input.get("businessIdentifier")

    if not business_identifier:
        return error_response(
            "Please provide business identifier", HTTPStatus.BAD_REQUEST
        )

    business: BusinessModel = BusinessModel.find_by_identifier(business_identifier)
    if not business:
        return error_response(f"{business_identifier} not found", HTTPStatus.NOT_FOUND)

    entity_json = {
        "businessIdentifier": business.identifier,
        "name": business.legal_name,
        "corpTypeCode": business.legal_type,
    }

    try:
        return AccountService.create_entity(entity_json), HTTPStatus.CREATED
    except ExternalServiceException as service_exception:
        return error_response(service_exception.message, service_exception.status_code)


@bp.route("/<string:identifier>/tasks", methods=["GET"])
@cross_origin(origin="*")
@_jwt.requires_auth
def get_tasks(identifier):
    """Returns the next pending task for a business."""
    try:
        tasks = BusinessService.get_business_pending_tasks(identifier)
        return jsonify(tasks=tasks), HTTPStatus.OK
    except BusinessException as businessExcpetion:
        return error_response(businessExcpetion.error, businessExcpetion.status_code)
    except Exception as exception:
        current_app.logger.error(
            "Error occured while retrieving pending tasks", exception
        )
        return error_response(
            "Error occured while retrieving pending tasks",
            HTTPStatus.INTERNAL_SERVER_ERROR,
        )
