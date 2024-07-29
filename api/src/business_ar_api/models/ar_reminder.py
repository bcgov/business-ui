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
"""This model manages an AR Reminder item."""

from .base_model import BaseModel
from .db import db
from business_ar_api.common.enum import auto
from business_ar_api.common.enum import BaseEnum


class AnnualReportReminder(BaseModel):  # pylint: disable=too-many-instance-attributes
    """Model for an AR Reminder record."""

    class Status(BaseEnum):
        """Enum of the reminder status."""

        DRAFT = auto()  # pylint: disable=invalid-name
        SENT = auto()  # pylint: disable=invalid-name

    __tablename__ = "ar_reminders"

    id = db.Column(db.Integer, primary_key=True)
    recipient = db.Column(db.String(1000), nullable=False, index=True)
    message = db.Column(db.String(8000), nullable=False)  # Email content
    sent_date = db.Column(db.DateTime(timezone=True))
    status = db.Column("status", db.String(20), default=Status.DRAFT, index=True)
    fiscal_year = db.Column(db.Integer, nullable=False)
    token = db.Column(db.String(100), nullable=False)  # Nano id

    business_id = db.Column("business_id", db.Integer, db.ForeignKey("business.id"))

    @classmethod
    def find_reminder_by_id(cls, reminder_id):
        """Find an AR reminder record that matches the id."""
        return cls.query.filter_by(id=reminder_id).first()

    @classmethod
    def find_reminder_by_token(cls, token):
        """Find an AR reminder record that matches the token."""
        return cls.query.filter_by(token=token).first()

    @classmethod
    def find_reminders_by_business_id(cls, business_id):
        """Find all AR reminders sent for specific business."""
        return (
            db.session.query(AnnualReportReminder)
            .filter(AnnualReportReminder.business_id == business_id)
            .all()
        )
