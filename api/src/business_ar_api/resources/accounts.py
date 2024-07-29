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
"""API endpoints for managing accounts."""

from http import HTTPStatus

from flask import Blueprint, request
from flask_cors import cross_origin

from business_ar_api.common.auth import jwt as _jwt
from business_ar_api.enums.enum import Role
from business_ar_api.exceptions.exceptions import ExternalServiceException
from business_ar_api.exceptions.responses import error_response
from business_ar_api.services.account_service import AccountService
from business_ar_api.services.schema_service import SchemaService

bp = Blueprint("KEYS", __name__)


@bp.route("/v1/accounts", methods=["GET"])
@cross_origin(origin="*")
@_jwt.requires_auth
def search_accounts():
    """Find accounts matching the search criteria."""
    try:
        account_name = request.args.get("name", None)
        if not account_name:
            return error_response(
                "Please provide account name.", HTTPStatus.BAD_REQUEST
            )
        return AccountService.search_accounts(account_name=account_name), HTTPStatus.OK
    except ExternalServiceException as service_exception:
        return error_response(service_exception.message, service_exception.status_code)


@bp.route("/v1/user/accounts", methods=["GET"])
@cross_origin(origin="*")
@_jwt.requires_auth
def get_user_accounts():
    """Get all accounts of the user."""
    try:
        return AccountService.get_user_accounts(), HTTPStatus.OK
    except ExternalServiceException as service_exception:
        return error_response(service_exception.message, service_exception.status_code)


@bp.route("/v1/user/accounts", methods=["POST"])
@cross_origin(origin="*")
@_jwt.requires_auth
def create_user_account():
    """Create a new user account."""
    json_input = request.get_json()

    schema_name = "new-account.json"
    schema_service = SchemaService()
    [valid, errors] = schema_service.validate(schema_name, json_input)
    if not valid:
        return error_response("Invalid request", HTTPStatus.BAD_REQUEST, errors)
    try:
        account_details = AccountService.create_user_account(json_input)
        account_id = account_details.get("id")
        AccountService.create_account_contact(
            account_id, json_input.get("contactPoint")
        )
        return account_details, HTTPStatus.OK
    except ExternalServiceException as service_exception:
        return error_response(service_exception.message, service_exception.status_code)
