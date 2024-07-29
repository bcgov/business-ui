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
"""Filing Model."""
from __future__ import annotations

import copy
from flask import current_app, url_for
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import backref
from typing import List

from business_ar_api.common.enum import auto
from business_ar_api.common.enum import BaseEnum
from business_ar_api.models.base_model import BaseModel
from business_ar_api.models.colin_event_id import ColinEventId
from .db import db


class Filing(BaseModel):
    """Stores the AR filing."""

    class Status(BaseEnum):
        """Enum of the filing status."""

        COMPLETED = auto()  # pylint: disable=invalid-name
        DRAFT = auto()  # pylint: disable=invalid-name
        ERROR = auto()  # pylint: disable=invalid-name
        PAID = auto()  # pylint: disable=invalid-name
        PENDING = auto()  # pylint: disable=invalid-name

    __tablename__ = "filing"

    id = db.Column(db.Integer, primary_key=True)
    fiscal_year = db.Column(db.Integer, nullable=False)
    filing_json = db.Column("filing_json", JSONB)
    filing_date = db.Column(
        "filing_date", db.DateTime(timezone=True), server_default=func.now()
    )  # pylint:disable=not-callable
    completion_date = db.Column("completion_date", db.DateTime(timezone=True))
    status = db.Column("status", db.String(20), default=Status.DRAFT)

    # maps to invoice id created by the pay-api (used for getting receipt)
    invoice_id = db.Column(db.Integer, nullable=True)
    payment_status_code = db.Column("payment_status_code", db.String(50))
    payment_completion_date = db.Column(
        "payment_completion_date", db.DateTime(timezone=True)
    )
    payment_account = db.Column("payment_account", db.String(30))

    # Relationships
    business_id = db.Column("business_id", db.Integer, db.ForeignKey("business.id"))
    submitter_id = db.Column("submitter_id", db.Integer, db.ForeignKey("users.id"))

    submitter = db.relationship(
        "User",
        backref=backref("filing_submitter", uselist=False),
        foreign_keys=[submitter_id],
    )

    colin_event_ids = db.relationship("ColinEventId", lazy="select")

    @property
    def is_locked(self):
        if self.status in [Filing.Status.PAID, Filing.Status.COMPLETED]:
            return True
        return False

    @property
    def has_invoice(self):
        if self.invoice_id:
            return True
        return False

    @classmethod
    def find_filing_by_id(cls, filing_id: int) -> Filing | None:
        """Return the filing by id."""
        return cls.query.filter_by(id=filing_id).one_or_none()

    @classmethod
    def find_filings_by_business_id(cls, id: int) -> list[Filing]:
        """Return filings by business_identifier."""
        return cls.query.filter_by(business_id=id).all()

    @classmethod
    def find_filings_by_status(cls, status: str) -> list[Filing]:
        """Return filings by status."""
        return cls.query.filter_by(status=status).all()

    @classmethod
    def find_business_filings_by_status(
        cls, business_id: int, status: List
    ) -> list[Filing]:
        """Return filings by business id and status."""
        query = (
            db.session.query(Filing)
            .filter(Filing.business_id == business_id)
            .filter(Filing.status.in_(status))
            .order_by(Filing.filing_date.desc())
        )
        return query.all()

    @classmethod
    def get_filing_by_payment_token(cls, payment_token: str) -> Filing:
        """Return filings by payment token."""
        return cls.query.filter_by(invoice_id=payment_token).one_or_none()

    def get_documents(self):
        reports = [{"type": "annualReport", "name": "Annual Report"}]
        api_url = f"{current_app.config.get('BUSINESS_AR_API_BASE_URL')}"
        identifier = self.business.identifier
        doc_url = url_for(
            "DOCUMENTS.get_document",
            **{"identifier": identifier, "filing_id": self.id, "document_type": None},
        )
        documents = []
        if self.status in [Filing.Status.PAID, Filing.Status.COMPLETED]:
            documents.append({"name": "Receipt", "url": f"{api_url}{doc_url}/receipt"})
        if self.status == Filing.Status.COMPLETED:
            for report in reports:
                documents.append(
                    {
                        "name": report.get("name"),
                        "url": f"{api_url}{doc_url}/{report.get('type')}",
                    }
                )
        return documents


class FilingSerializer:
    """Serializer for filings. Can convert to dict, string from filing model."""

    @staticmethod
    def to_str(filing: Filing):
        """Return string representation of filing model."""
        return str(FilingSerializer.to_dict(filing))

    @staticmethod
    def to_dict(filing: Filing) -> dict:
        """Return the filing object as a dict."""
        filing_dict = copy.deepcopy(filing.filing_json)
        filing_dict["filing"]["header"]["id"] = filing.id
        filing_dict["filing"]["header"]["name"] = "annualReport"
        filing_dict["filing"]["header"]["filingYear"] = filing.fiscal_year
        filing_dict["filing"]["header"]["paymentToken"] = filing.invoice_id
        filing_dict["filing"]["header"]["paymentStatus"] = filing.payment_status_code
        filing_dict["filing"]["header"]["status"] = filing.status
        filing_dict["filing"]["header"][
            "filingDateTime"
        ] = filing.filing_date.isoformat()
        filing_dict["filing"]["header"]["date"] = filing.filing_date.strftime(
            "%Y-%m-%d"
        )
        filing_dict["filing"]["header"]["completionDate"] = (
            filing.completion_date.isoformat() if filing.completion_date else None
        )
        if filing.submitter_id:
            filing_dict["filing"]["header"]["submitter"] = filing.submitter.username
            filing_dict["filing"]["header"]["certifiedBy"] = filing.submitter.username
            certified_by_display_name = ""
            if filing.submitter.firstname:
                certified_by_display_name = (
                    f"{certified_by_display_name}{filing.submitter.firstname} "
                )
            if filing.submitter.lastname:
                certified_by_display_name = (
                    f"{certified_by_display_name}{filing.submitter.lastname}"
                )
            filing_dict["filing"]["header"][
                "certifiedByDisplayName"
            ] = certified_by_display_name

        if filing.payment_account:
            filing_dict["filing"]["header"]["paymentAccount"] = filing.payment_account

        # add colin_event_ids
        filing_dict["filing"]["header"]["colinIds"] = ColinEventId.get_by_filing_id(
            filing.id
        )

        documents = filing.get_documents()
        filing_dict["filing"]["documents"] = documents

        return filing_dict
