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
"""This manages data about a business."""

from .base_model import BaseModel
from .db import db
from .filing import Filing
from .invitations import Invitations


class Business(BaseModel):
    id = db.Column(db.Integer, primary_key=True)
    legal_name = db.Column("legal_name", db.String(1000), index=True)
    legal_type = db.Column("legal_type", db.String(10))
    identifier = db.Column("identifier", db.String(10), index=True)
    tax_id = db.Column("tax_id", db.String(15), index=True)
    email = db.Column("email", db.String(1000), index=True)
    founding_date = db.Column("founding_date", db.DateTime(timezone=True))
    last_ar_reminder_year = db.Column("last_ar_reminder_year", db.Integer)
    ar_reminder_flag = db.Column("ar_reminder_flag", db.Boolean, default=True)
    state = db.Column("state", db.String(5), index=True)
    op_state = db.Column("op_state", db.String(5), index=True)
    corp_class = db.Column("corp_class", db.String(10), index=True)

    filings = db.relationship("Filing", lazy="dynamic", backref="business")
    invitations = db.relationship("Invitations", lazy="dynamic")

    @classmethod
    def find_by_identifier(cls, identifier: str):
        """Return a Business by identifier."""
        business = None
        if identifier:
            business = cls.query.filter_by(identifier=identifier).one_or_none()
        return business

    @classmethod
    def find_by_id(cls, id: int):
        """Return a Business by identifier."""
        business = None
        if id:
            business = cls.query.filter_by(id=id).one_or_none()
        return business

    def json(self):
        """Return the business json."""
        business_json = {
            "legalName": self.legal_name,
            "legalType": self.legal_type,
            "identifier": self.identifier,
            "taxId": self.tax_id,
        }

        return business_json
