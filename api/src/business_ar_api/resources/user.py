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
"""API endpoints for managing users."""

from http import HTTPStatus

from flask import Blueprint, request
from flask_cors import cross_origin

from business_ar_api.common.auth import jwt as _jwt
from business_ar_api.exceptions.exceptions import ExternalServiceException
from business_ar_api.exceptions.responses import error_response
from business_ar_api.services.account_service import AccountService
from business_ar_api.services.schema_service import SchemaService

bp = Blueprint("users", __name__)


@bp.route("/v1/users", methods=["POST"])
@cross_origin(origin="*")
@_jwt.requires_auth
def update_user_profile():
    """Update user profile. This will add necessary roles for the user."""
    try:
        user_details = AccountService.update_user_profile()
        return user_details, HTTPStatus.OK
    except ExternalServiceException as service_exception:
        return error_response(service_exception.message, service_exception.status_code)


@bp.route("/v1/users/tos", methods=["GET"])
@cross_origin(origin="*")
@_jwt.requires_auth
def get_user_tos():
    """Get ToS state of the user. If ToS is not accepted, return the ToS document"""
    try:
        user_tos = AccountService.get_user_tos()
        return user_tos, HTTPStatus.OK
    except ExternalServiceException as service_exception:
        return error_response(service_exception.message, service_exception.status_code)


@bp.route("/v1/users/tos", methods=["PATCH"])
@cross_origin(origin="*")
@_jwt.requires_auth
def update_user_tos():
    """Update ToS state of the user."""
    try:
        request_json = request.get_json()
        schema_name = "user-tos.json"
        schema_service = SchemaService()
        [valid, errors] = schema_service.validate(schema_name, request_json)
        if not valid:
            return error_response("Invalid request", HTTPStatus.BAD_REQUEST, errors)

        user_tos = AccountService.update_user_tos(request_json)
        return user_tos, HTTPStatus.OK
    except ExternalServiceException as service_exception:
        return error_response(service_exception.message, service_exception.status_code)
