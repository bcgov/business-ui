# Copyright © 2024 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""This model manages an AR Invitation item."""
from datetime import timezone
from sqlalchemy import func

from .base_model import BaseModel
from .db import db
from business_ar_api.common.enum import auto
from business_ar_api.common.enum import BaseEnum
from business_ar_api.utils.legislation_datetime import LegislationDatetime


class Invitations(BaseModel):  # pylint: disable=too-many-instance-attributes
    """Model for an AR Invitation record."""

    class Status(BaseEnum):
        """Enum of the invitation status."""

        DRAFT = auto()  # pylint: disable=invalid-name
        SENT = auto()  # pylint: disable=invalid-name
        EXPIRED = auto()  # pylint: disable=invalid-name
        DELETED = auto()  # pylint: disable=invalid-name
        COMPLETED = auto()  # pylint: disable=invalid-name

    __tablename__ = "invitations"

    id = db.Column(db.Integer, primary_key=True)
    recipients = db.Column(
        db.String(1000), nullable=False, index=True
    )  # Comma separated value of recipient emails
    message = db.Column(db.String(8000), nullable=False)  # Email content
    sent_date = db.Column(db.DateTime(timezone=True), server_default=func.now())
    expiration_date = db.Column(db.DateTime(timezone=True), nullable=True)
    token = db.Column(db.String(100), nullable=False)  # Nano id
    status = db.Column("status", db.String(20), default=Status.DRAFT, index=True)
    additional_message = db.Column(db.String(4000), nullable=True)

    business_id = db.Column("business_id", db.Integer, db.ForeignKey("business.id"))

    @classmethod
    def find_invitation_by_id(cls, invitation_id):
        """Find an AR invitation record that matches the id."""
        return cls.query.filter_by(id=invitation_id).first()

    @classmethod
    def find_invitations_by_business_id(cls, business_id, status=None):
        """Find all AR invitations sent for specific entity filtered by status."""
        results = db.session.query(Invitations).filter(
            Invitations.business_id == business_id
        )
        return (
            results.filter(Invitations.status == status).all()
            if status
            else results.all()
        )

    @classmethod
    def find_invitation_by_token(cls, token):
        """Find an AR invitation record that matches the token."""
        return cls.query.filter_by(token=token).first()

    def json(self):
        """Return the invitation json."""
        invitation_json = {
            "invitationId": self.id,
            "recipients": self.recipients,
            "status": self.status,
            "sentDate": (
                LegislationDatetime.as_legislation_timezone_from_date(self.sent_date)
                .astimezone(timezone.utc)
                .isoformat()
                if self.sent_date
                else None
            ),
            "message": self.message,
        }

        return invitation_json
