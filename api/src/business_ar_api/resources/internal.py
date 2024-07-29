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
This module defines internal endpoints.

It provides endpoints to create and retrieve filing objects.

"""
from http import HTTPStatus

from business_ar_api.common.auth import jwt
from business_ar_api.enums.enum import Role
from business_ar_api.exceptions import AuthException, error_response, exception_response
from business_ar_api.services import (
    AccountService,
    BusinessService,
    FilingService,
    NotificationService,
)
from flask import Blueprint, current_app, jsonify, request
from flask_cors import cross_origin

bp = Blueprint("internal", __name__, url_prefix=f"/v1/internal")


@bp.route("/filings/<string:status>", methods=["GET"])
@cross_origin(origin="*")
@jwt.has_one_of_roles([Role.SYSTEM.value])
def get_filings_by_status(status):
    """Get the filings with the specified status."""
    try:

        filings = FilingService.find_filing_by_status(status.upper())
        filings_res = []
        for filing in filings:
            filing_json = FilingService.serialize(filing)
            business = BusinessService.find_by_internal_id(filing.business_id)
            filing_json["filing"]["business"] = (
                BusinessService.get_business_details_from_colin(
                    business.identifier, business.legal_type, business.id
                ).get("business", {})
            )
            filings_res.append(filing_json)
        return jsonify(filings=filings_res), HTTPStatus.OK
    except AuthException as aex:
        return exception_response(aex)
    except Exception as exception:  # noqa: B902
        return exception_response(exception)


@bp.route("/filings/<int:filing_id>", methods=["PATCH"])
@cross_origin(origin="*")
@jwt.has_one_of_roles([Role.SYSTEM.value])
def complete_filing(filing_id):
    """
    Complete the filing by saving the Colin Ids against the filing and updating the filing status.

    Returns:
        A tuple containing the response JSON and the HTTP status code.
    """
    try:
        if not filing_id:
            return error_response(
                f"Please provide the filing id.", HTTPStatus.BAD_REQUEST
            )
        json_input = request.get_json()

        filing = FilingService.find_filing_by_id(filing_id)
        if not filing:
            return error_response(f"No matching filing.", HTTPStatus.NOT_FOUND)

        # complete filing
        filing = FilingService.complete_filing(filing_id, json_input)

        return jsonify(FilingService.serialize(filing)), HTTPStatus.OK

    except AuthException as authException:
        return exception_response(authException)
    except Exception as exception:
        return exception_response(exception)


@bp.route("/filings/<int:filing_id>/notify", methods=["POST"])
@cross_origin(origin="*")
@jwt.has_one_of_roles([Role.SYSTEM.value])
def send_notifications(filing_id):
    """
    Send notifications about a filing.

    Returns:
        A tuple containing the response JSON and the HTTP status code.
    """
    try:
        if not filing_id:
            return error_response(
                f"Please provide the filing id.", HTTPStatus.BAD_REQUEST
            )

        filing = FilingService.find_filing_by_id(filing_id)
        if not filing:
            return error_response(f"No matching filing.", HTTPStatus.NOT_FOUND)

        NotificationService.send_filing_complete_email(filing_id)
        return {}, HTTPStatus.OK
    except AuthException as authException:
        current_app.logger.error("Error in send_notifications", authException)
        return exception_response(authException)
    except Exception as exception:
        current_app.logger.error("Error in send_notifications", exception)
        return exception_response(exception)
