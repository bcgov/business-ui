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
"""API endpoints for managing invitation."""

from http import HTTPStatus
from flask import Blueprint, current_app, jsonify, request
from flask_cors import cross_origin

from business_ar_api.common.auth import jwt as _jwt
from business_ar_api.enums.enum import Role
from business_ar_api.exceptions.exceptions import (
    BusinessException,
    ExternalServiceException,
)
from business_ar_api.models.dataclass import InvitationSearch
from business_ar_api.services import AccountService, BusinessService, InvitationService


bp = Blueprint("invitation", __name__, url_prefix=f"/v1/invitations")


@bp.route("/", methods=["GET"])
@cross_origin(origin="*")
@_jwt.has_one_of_roles([Role.SYSTEM.value, Role.STAFF.value])
def get_invitations():
    """Get invitations."""
    try:
        search_text = request.args.get("text", None)
        status = request.args.get("status", None)
        page = request.args.get("page", 1)
        limit = request.args.get("limit", 50)
        search_criteria = InvitationSearch(
            search_text=search_text, status=status, page=int(page), limit=int(limit)
        )
        data = InvitationService.search_invitations(search_criteria=search_criteria)
        response, status = data, HTTPStatus.OK
    except BusinessException as exception:
        response, status = {
            "code": exception.code,
            "message": exception.message,
        }, exception.status_code
    return response, status


@bp.route("/<int:invitation_id>", methods=["DELETE"])
@cross_origin(origin="*")
@_jwt.has_one_of_roles([Role.SYSTEM.value, Role.STAFF.value])
def expire_invitation(invitation_id):
    """Expires an invitation."""
    try:
        InvitationService.expire_invitation(invitation_id=invitation_id)
        response, status = {}, HTTPStatus.OK
    except BusinessException as exception:
        response, status = {
            "code": exception.code,
            "message": exception.message,
        }, exception.status_code
    return response, status
