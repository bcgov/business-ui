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
"""Manages filing type codes and payment service interactions."""
from copy import deepcopy
from http import HTTPStatus

import requests
from flask import current_app
from flask_jwt_oidc import JwtManager

from business_ar_api.exceptions import ExternalServiceException
from business_ar_api.models import Filing as FilingModel
from business_ar_api.services import AccountService
from business_ar_api.services import BusinessService
from business_ar_api.services.rest_service import RestService


class PaymentService:
    """
    A class that provides utility functions for connecting with the BC Registries pay-api.
    """

    def create_invoice(
        account_id: str, user_jwt: JwtManager, business_details: dict
    ) -> requests.Response:
        """Create the invoice via the pay-api."""
        SVC_URL = current_app.config.get("PAY_API_URL")
        SVC_TIMEOUT = current_app.config.get("PAYMENT_SVC_TIMEOUT", 20)
        CREATE_INVOICE_PAYLOAD = {
            "filingInfo": {"filingTypes": [{"filingTypeCode": "BCANN"}]},
            "businessInfo": {},
        }
        payload = deepcopy(CREATE_INVOICE_PAYLOAD)

        # update payload details
        if identifier := business_details.get("identifier", None):
            label_name = "Incorporation Number"
            payload["details"] = [{"label": f"{label_name}: ", "value": identifier}]
            payload["businessInfo"]["businessIdentifier"] = identifier
            payload["businessInfo"]["corpType"] = business_details.get(
                "legalType", None
            )

        try:
            # make api call
            token = user_jwt.get_token_auth_header()
            headers = {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json",
                "Account-Id": account_id,
            }
            resp = requests.post(
                url=SVC_URL + "/payment-requests",
                json=payload,
                headers=headers,
                timeout=SVC_TIMEOUT,
            )

            if resp.status_code not in [HTTPStatus.OK, HTTPStatus.CREATED] or not (
                resp.json()
            ).get("id", None):
                error = f"{resp.status_code} - {str(resp.json())}"
                current_app.logger.debug("Invalid response from pay-api: %s", error)
                raise ExternalServiceException(
                    error=error, status_code=HTTPStatus.PAYMENT_REQUIRED
                )

            return resp

        except ExternalServiceException as exc:
            raise exc
        except (
            requests.exceptions.ConnectionError,
            requests.exceptions.Timeout,
        ) as err:
            current_app.logger.debug("Pay-api connection failure:", repr(err))
            raise ExternalServiceException(
                error=repr(err), status_code=HTTPStatus.PAYMENT_REQUIRED
            ) from err
        except Exception as err:
            current_app.logger.debug(
                "Pay-api integration (create invoice) failure:", repr(err)
            )
            raise ExternalServiceException(
                error=repr(err), status_code=HTTPStatus.PAYMENT_REQUIRED
            ) from err

    @staticmethod
    def get_payment_details_by_invoice_id(invoice_id: int, user_jwt: JwtManager):
        endpoint = (
            f"{current_app.config.get('PAY_API_URL')}/payment-requests/{invoice_id}"
        )
        token = user_jwt.get_token_auth_header()
        payment_details = RestService.get(endpoint=endpoint, token=token).json()
        return payment_details

    @staticmethod
    def get_payment_receipt(filing_id: int):
        filing = FilingModel.find_filing_by_id(filing_id)
        if filing.status not in [FilingModel.Status.PAID, FilingModel.Status.COMPLETED]:
            return "Filing not in Paid or Completed State", HTTPStatus.BAD_REQUEST
        business = BusinessService.find_by_internal_id(filing.business_id)

        client_id = current_app.config.get("AUTH_SVC_CLIENT_ID")
        client_secret = current_app.config.get("AUTH_SVC_CLIENT_SECRET")
        token = AccountService.get_service_client_token(client_id, client_secret)
        url = f'{current_app.config.get("PAY_API_URL")}/payment-requests/{filing.invoice_id}/receipts'
        headers = {"Accept": "application/pdf", "Authorization": f"Bearer {token}"}
        payload = {
            "corpName": business.legal_name,
            "filingDateTime": filing.filing_date.isoformat(),
            "effectiveDateTime": "",
            "filingIdentifier": str(filing.id),
        }
        response = requests.post(
            url,
            json=payload,
            headers=headers,
        )
        if response.status_code != HTTPStatus.CREATED:
            current_app.logger.error(
                "Failed to get receipt pdf for filing: %s", filing_id
            )

        return current_app.response_class(
            response=response.content,
            status=response.status_code,
            mimetype="application/pdf",
        )
