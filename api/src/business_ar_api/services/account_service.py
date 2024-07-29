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
"""Manages Auth service interactions."""
from http import HTTPStatus

import requests
from business_ar_api.common.auth import jwt
from business_ar_api.enums.enum import AuthHeaderType, ContentType, Role
from business_ar_api.exceptions.exceptions import (
    AuthException,
    BusinessException,
    ExternalServiceException,
)
from business_ar_api.services.rest_service import RestService
from business_ar_api.utils.user_context import UserContext, user_context
from flask import current_app
from requests.exceptions import HTTPError


class AccountService:

    @classmethod
    def get_service_client_token(cls, client_id, client_secret):
        token_url = current_app.config.get("AUTH_SVC_URL")
        timeout = int(current_app.config.get("AUTH_SVC_TIMEOUT", 20))

        data = "grant_type=client_credentials"

        # get service account token
        res = requests.post(
            url=token_url,
            data=data,
            headers={"content-type": ContentType.FORM_URL_ENCODED.value},
            auth=(client_id, client_secret),
            timeout=timeout,
        )

        try:
            return res.json().get("access_token")
        except Exception:
            return None

    @classmethod
    @user_context
    def get_user_accounts(cls, **kwargs):
        user: UserContext = kwargs["user_context"]
        endpoint = f"{current_app.config.get('AUTH_API_URL')}/users/orgs"
        user_account_details = RestService.get(
            endpoint=endpoint, token=user.bearer_token
        ).json()
        return user_account_details

    @classmethod
    @user_context
    def get_user_tos(cls, **kwargs):
        user: UserContext = kwargs["user_context"]
        endpoint = f"{current_app.config.get('AUTH_API_URL')}/users/@me"
        user_details = RestService.get(
            endpoint=endpoint, token=user.bearer_token
        ).json()
        res = user_details.get("userTerms")
        if not res.get("isTermsOfUseAccepted"):
            tos_document_response = RestService.get(
                endpoint=f"{current_app.config.get('AUTH_API_URL')}/documents/termsofuse",
                token=user.bearer_token,
            ).json()
            res["termsOfUseCurrentVersion"] = tos_document_response.get("versionId")
            res["termsOfUse"] = tos_document_response.get("content")
        return res

    @classmethod
    @user_context
    def update_user_tos(cls, request_json: dict, **kwargs):
        user: UserContext = kwargs["user_context"]
        endpoint = f"{current_app.config.get('AUTH_API_URL')}/users/@me"

        user_details = RestService.patch(
            endpoint=endpoint, token=user.bearer_token, data=request_json
        ).json()
        res = user_details.get("userTerms")
        return res

    @classmethod
    @user_context
    def create_user_account(cls, account_details: dict, **kwargs):
        user: UserContext = kwargs["user_context"]
        endpoint = f"{current_app.config.get('AUTH_API_URL')}/orgs"
        create_account_payload = {
            "accessType": "REGULAR",
            "typeCode": "BASIC",
            "productSubscriptions": [{"productCode": "BUSINESS"}],
            "paymentInfo": {"paymentMethod": "DIRECT_PAY"},
        }
        create_account_payload["name"] = account_details.get("name")
        new_user_account_details = RestService.post(
            data=create_account_payload,
            endpoint=endpoint,
            token=user.bearer_token,
            generate_token=False,
        ).json()
        return new_user_account_details

    @classmethod
    @user_context
    def create_account_contact(cls, account_id: int, contact_details: dict, **kwargs):
        user: UserContext = kwargs["user_context"]
        endpoint = (
            f"{current_app.config.get('AUTH_API_URL')}/orgs/{account_id}/contacts"
        )
        create_account_contact_payload = {
            "email": contact_details.get("email"),
            "phone": contact_details.get("phone"),
        }
        if extension := contact_details.get("extension"):
            create_account_contact_payload["phoneExtension"] = str(extension)

        contact_details = RestService.post(
            data=create_account_contact_payload,
            endpoint=endpoint,
            token=user.bearer_token,
            generate_token=False,
        ).json()
        return contact_details

    @classmethod
    @user_context
    def get_account_contact(cls, account_id: int, **kwargs):
        user: UserContext = kwargs["user_context"]
        endpoint = (
            f"{current_app.config.get('AUTH_API_URL')}/orgs/{account_id}/contacts"
        )
        contact_details = RestService.get(
            endpoint=endpoint,
            token=user.bearer_token,
        ).json()
        return contact_details

    @classmethod
    def search_accounts(cls, account_name: str, **kwargs):
        client_id = current_app.config.get("AUTH_SVC_CLIENT_ID")
        client_secret = current_app.config.get("AUTH_SVC_CLIENT_SECRET")

        token = AccountService.get_service_client_token(client_id, client_secret)
        endpoint = (
            f"{current_app.config.get('AUTH_API_URL')}/orgs?name={account_name.strip()}"
        )
        accounts = RestService.get(endpoint=endpoint, token=token).json()
        return accounts

    @classmethod
    def create_entity(cls, entity_json: dict):
        endpoint = f"{current_app.config.get('AUTH_API_URL')}/entities"
        client_id = current_app.config.get("AUTH_SVC_CLIENT_ID")
        client_secret = current_app.config.get("AUTH_SVC_CLIENT_SECRET")

        token = AccountService.get_service_client_token(client_id, client_secret)

        if not token:
            raise BusinessException(code="ERR-001")

        new_entity_details = RestService.post(
            data=entity_json,
            endpoint=endpoint,
            token=token,
        ).json()
        return new_entity_details

    @classmethod
    def find_or_create_entity(cls, entity_json: dict):
        endpoint = f"{current_app.config.get('AUTH_API_URL')}/entities"
        client_id = current_app.config.get("AUTH_SVC_CLIENT_ID")
        client_secret = current_app.config.get("AUTH_SVC_CLIENT_SECRET")

        token = AccountService.get_service_client_token(client_id, client_secret)

        if not token:
            raise BusinessException(code="ERR-001")
        try:
            entity = RestService.get(
                endpoint=f"{endpoint}/{entity_json.get('businessIdentifier')}",
                token=token,
            ).json()
            return entity
        except HTTPError as exception:
            if exception.response.status_code == HTTPStatus.NOT_FOUND:
                current_app.logger.info(
                    f"Creating entity {entity_json.get('businessIdentifier')} in Auth"
                )
                new_entity_details = RestService.post(
                    data=entity_json,
                    endpoint=endpoint,
                    token=token,
                ).json()
                return new_entity_details

    @classmethod
    @user_context
    def update_user_profile(cls, **kwargs):
        user: UserContext = kwargs["user_context"]
        endpoint = f"{current_app.config.get('AUTH_API_URL')}/users"
        try:
            response = RestService.post(
                endpoint=endpoint, token=user.bearer_token
            ).json()
            return response
        except HTTPError as exception:
            current_app.logger.error("Error while creating user roles", exception)
            raise ExternalServiceException(
                error="Error while creating user roles",
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            )

    @classmethod
    @user_context
    def affiliate_entity_to_account(
        cls, account_id: int, business_identifier: str, **kwargs
    ):
        user: UserContext = kwargs["user_context"]
        endpoint = (
            f"{current_app.config.get('AUTH_API_URL')}/orgs/{account_id}/affiliations"
        )
        affiliation_payload = {
            "businessIdentifier": business_identifier,
            "passCode": "",
        }
        new_entity_details = RestService.post(
            data=affiliation_payload, endpoint=endpoint, token=user.bearer_token
        ).json()
        return new_entity_details

    @classmethod
    @user_context
    def get_account_affiliations(cls, account_id: int, **kwargs):
        user: UserContext = kwargs["user_context"]
        endpoint = (
            f"{current_app.config.get('AUTH_API_URL')}/orgs/{account_id}/affiliations"
        )
        affiliations = RestService.get(
            endpoint=endpoint, token=user.bearer_token
        ).json()
        return affiliations

    @classmethod
    @user_context
    def is_authorized(cls, business_identifier: str, **kwargs) -> bool:
        """Authorize the user for access to the service."""
        try:
            # if this is a staff person, they are allowed to access the resource
            if jwt.validate_roles([Role.STAFF]):
                return True

            timeout = int(current_app.config.get("AUTH_SVC_TIMEOUT", 20))
            api_url = current_app.config.get("AUTH_API_URL")
            user: UserContext = kwargs["user_context"]
            auth_token = user.bearer_token
            # make api call
            headers = {"Authorization": AuthHeaderType.BEARER.value.format(auth_token)}
            auth_url = f"{api_url}/entities/{business_identifier}/authorizations"

            resp = requests.get(url=auth_url, headers=headers, timeout=timeout)

            if resp.status_code >= HTTPStatus.INTERNAL_SERVER_ERROR:
                error = f"{resp.status_code} - {str(resp.json())}"
                current_app.logger.debug("Invalid response from auth-api: %s", error)
                raise ExternalServiceException(
                    error=error, status_code=HTTPStatus.SERVICE_UNAVAILABLE
                )

            if resp.status_code != HTTPStatus.OK or "edit" not in resp.json().get(
                "roles", []
            ):
                error = f"Unauthorized access to business: {business_identifier}"
                current_app.logger.debug(error)
                raise AuthException(error=error, status_code=HTTPStatus.FORBIDDEN)

            return True
        except AuthException as e:
            raise e
        except ExternalServiceException as exc:
            raise exc
        except (
            requests.exceptions.ConnectionError,
            requests.exceptions.Timeout,
        ) as err:
            current_app.logger.debug("Auth connection failure:", repr(err))
            raise ExternalServiceException(
                error=repr(err), status_code=HTTPStatus.SERVICE_UNAVAILABLE
            ) from err
        except Exception as err:
            current_app.logger.debug("Generic Auth verification failure:", repr(err))
            raise ExternalServiceException(
                error=repr(err), status_code=HTTPStatus.SERVICE_UNAVAILABLE
            ) from err
