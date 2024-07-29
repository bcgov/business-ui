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
"""Tests for the invitations model.

Test suite to ensure that the Invitations model routines are working as expected.
"""
from datetime import datetime
from business_ar_api.models import Business, Invitations
from tests import create_business


def test_invitation_save(session):
    """Assert that an invitation can be saved."""
    business = create_business()

    invitations = Invitations(
        recipients="test@abc.com",
        message="Test Message",
        sent_date=datetime.now(),
        token="abc",
        status="DRAFT",
        additional_message="Test",
        business_id=business.id,
    )

    invitations.save()
    assert invitations.id


def test_find_invitation_by_id(session):
    """Assert that an invitation can be retrieved using its identifier."""
    business = create_business()

    invitations = Invitations(
        recipients="test@abc.com",
        message="Test Message",
        sent_date=datetime.now(),
        token="abc",
        status="DRAFT",
        additional_message="Test",
        business_id=business.id,
    )

    invitations.save()
    assert invitations.id

    retrieved_invitations = Invitations.find_invitation_by_id(invitations.id)
    assert retrieved_invitations


def test_find_invitation_by_business_id(session):
    """Assert that an invitation can be retrieved using business id."""
    business = create_business()

    invitations = Invitations(
        recipients="test@abc.com",
        message="Test Message",
        sent_date=datetime.now(),
        token="abc",
        status="DRAFT",
        additional_message="Test",
        business_id=business.id,
    )

    invitations.save()
    assert invitations.id

    retrieved_invitations = Invitations.find_invitations_by_business_id(business.id)
    assert retrieved_invitations
    assert len(retrieved_invitations) == 1
