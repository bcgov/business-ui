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
"""Tests for the business resource.

Test suite to ensure that the Business endpoints are working as expected.
"""
import string
from datetime import datetime
from http import HTTPStatus

from nanoid import generate

from business_ar_api.models import Business, Invitations


def mock_colin_details(corp_state, legal_name, mocker):
    # Mock the colin callback
    colin_details = {"business": {"legalName": legal_name, "corpState": corp_state}}
    return mocker.patch(
        "business_ar_api.services.BusinessService.get_business_details_from_colin",
        return_value=colin_details,
    )


def test_business_look_up_by_nano_id(session, client, mocker):
    """Assert that a Business can be looked up using the nano id."""

    # Setup
    nanoid_charset = string.ascii_letters + string.digits
    nano_id = generate(nanoid_charset)

    legal_name = "Test Business 1"
    corp_state = "ACTIVE"

    # mock out the external call to COLIN
    colin_call = mock_colin_details(corp_state, legal_name, mocker)

    business = Business(
        legal_name=legal_name,
        legal_type="BC",
        identifier="BC1217715",
        tax_id="BN1234567899876",
    )
    business.save()
    assert business.id is not None

    invitations = Invitations(
        recipients="test@abc.com",
        message="Test Message",
        sent_date=datetime.now(),
        token=nano_id,
        status="SENT",
        additional_message="Test",
        business_id=business.id,
    )
    invitations.save()

    # Test
    rv = client.get(f"/v1/business/token/{invitations.token}")

    # ensure mock was called
    colin_call.assert_called_once()

    # Veriy test
    assert rv.status_code == HTTPStatus.OK
    assert rv.json == {
        "legalName": legal_name,
        "legalType": business.legal_type,
        "identifier": business.identifier,
        "status": corp_state,
        "taxId": business.tax_id,
    }


def test_business_does_not_exist(session, client):
    """Assert that error is returned."""
    business = Business(
        legal_name="Test Business 4",
        legal_type="BC",
        identifier="BC1215715",
        tax_id="BN1234567899876",
    )
    business.save()
    assert business.id is not None

    rv = client.get(f"/v1/business/token/etc123")

    assert rv.status_code == HTTPStatus.BAD_REQUEST
