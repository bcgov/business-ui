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
This module contains the services necessary for handling Filings,
including creating a filing. 
"""
from http import HTTPStatus
from datetime import datetime, timezone
from typing import List

from flask_jwt_oidc import JwtManager

from business_ar_api.exceptions import BusinessException
from business_ar_api.models import Filing as FilingModel, ColinEventId
from business_ar_api.models.filing import FilingSerializer
from business_ar_api.services import PaymentService


class FilingService:
    """
    The `FilingService` class is responsible for handling filing submissions.
    """

    @staticmethod
    def save_filing(
        filing_dict: dict,
        business_id: int,
        submitter_id: int,
        filing: FilingModel = None,
    ) -> FilingModel:
        """
        Create Filing. Returns filing model
        """
        if not filing:
            filing = FilingModel()
        filing.business_id = business_id
        filing.filing_json = filing_dict
        filing.submitter_id = submitter_id
        filing.fiscal_year = filing_dict["filing"]["header"]["filingYear"]
        filing.save()
        return filing

    @staticmethod
    def update_filing_invoice_details(
        filing_id: int, invoice_response: dict
    ) -> FilingModel:
        """
        Update filing invoice details.
        """
        filing = FilingModel.find_filing_by_id(filing_id)
        filing.invoice_id = invoice_response["id"]
        filing.payment_account = invoice_response.get("paymentAccount").get("accountId")
        filing.payment_status_code = invoice_response.get("statusCode")
        if filing.payment_status_code == "COMPLETED":
            filing.status = FilingModel.Status.PAID
            filing.payment_completion_date = datetime.fromisoformat(
                invoice_response.get("paymentDate")
            )
        elif filing.payment_status_code == "APPROVED":
            filing.payment_status_code = "COMPLETED"
            filing.status = FilingModel.Status.PAID
            filing.payment_completion_date = datetime.now(timezone.utc)
        else:
            filing.status = FilingModel.Status.PENDING
        filing.save()
        return filing

    @staticmethod
    def find_filing_by_id(filing_id: int) -> FilingModel:
        """
        Get Filing by Id.
        """
        filing = FilingModel.find_filing_by_id(filing_id)
        if not filing:
            raise BusinessException(
                error=f"Filing with id {filing_id} does not exist.",
                status_code=HTTPStatus.NOT_FOUND,
                message="Filing not found.",
            )
        return filing

    @staticmethod
    def find_filing_by_status(status: str) -> List[FilingModel]:
        """
        Get Filing by Status.
        """
        filings = FilingModel.find_filings_by_status(status)
        return filings

    @staticmethod
    def find_filings_by_business_id(business_id: int) -> List[FilingModel]:
        """
        Get Filing by business id.
        """
        filings = FilingModel.find_filings_by_business_id(business_id)
        return filings

    @staticmethod
    def serialize(filing: FilingModel) -> dict:
        """
        Returns Filing JSON.
        """
        return FilingSerializer.to_dict(filing)

    @staticmethod
    def update_payment_data(filing_id: int, user_jwt: JwtManager) -> FilingModel:
        """
        Update the filing with the payment details.
        """
        filing = FilingService.find_filing_by_id(filing_id)
        payment_details = FilingService.get_payment_data(filing_id, user_jwt)
        filing.payment_status_code = payment_details.get("statusCode")
        if filing.payment_status_code == "COMPLETED":
            filing.status = FilingModel.Status.PAID
            filing.payment_completion_date = datetime.fromisoformat(
                payment_details.get("paymentDate")
            )
        filing.save()
        return filing

    @staticmethod
    def get_payment_data(filing_id: int, user_jwt: JwtManager) -> dict:
        """
        Get the payment from sbc-pay.
        """
        filing = FilingService.find_filing_by_id(filing_id)
        if not filing:
            raise BusinessException(
                error=f"Filing with id {filing_id} does not exist.",
                status_code=HTTPStatus.BAD_REQUEST,
                message="No filing found.",
            )
        if not filing.invoice_id:
            raise BusinessException(
                error=f"Filing with id {filing_id} does not have an invoice.",
                status_code=HTTPStatus.BAD_REQUEST,
                message="No invoice for the filing.",
            )
        payment_details = PaymentService.get_payment_details_by_invoice_id(
            filing.invoice_id, user_jwt
        )
        return payment_details

    @staticmethod
    def complete_filing(filing_id: int, request_json: dict) -> FilingModel:
        """
        Add colin event ids to the filing and update the filing status to complete.
        """
        filing = FilingService.find_filing_by_id(filing_id)
        colin_ids = request_json.get("colinEventIds", [])
        for colin_id in colin_ids:
            filing.colin_event_ids.append(ColinEventId(colin_event_id=colin_id))
        filing.status = FilingModel.Status.COMPLETED
        filing.completion_date = datetime.utcnow()
        filing.save()
        return filing
