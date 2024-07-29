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
"""Tests for the business model.

Test suite to ensure that the Business model routines are working as expected.
"""

from business_ar_api.models import Business


def test_business_save(session):
    """Assert that a Business can be stored in the database."""
    business = Business(
        legal_name="Test Business 1",
        legal_type="BC",
        identifier="BC1217753",
        tax_id="BN1234567899876",
    )
    business.save()
    assert business.id is not None


def test_find_by_identifier(session):
    """Assert that a business can be retrieved using its identifier."""
    business = Business(
        legal_name="Test Business 1",
        legal_type="BC",
        identifier="BC1417754",
        tax_id="BN1234567899876",
    )
    business.save()
    assert business.id is not None
    retrieved_business = Business.find_by_identifier(business.identifier)
    assert retrieved_business.id == business.id


def test_business_json(session):
    """Assert that a business json has all required properties."""
    business = Business(
        legal_name="Test Business 1",
        legal_type="BC",
        identifier="BC1217756",
        tax_id="BN1234567899876",
    )
    business.save()
    business_json = {
        "legalName": business.legal_name,
        "legalType": business.legal_type,
        "identifier": business.identifier,
        "taxId": business.tax_id,
    }
    assert business_json == business.json()
