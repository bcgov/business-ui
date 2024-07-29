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
"""Tests for the filing model.

Test suite to ensure that the Filing model routines are working as expected.
"""
from business_ar_api.models import Filing
from tests import create_business, create_filing


def test_filing_save(session):
    """Assert that a filing can be saved."""
    business = create_business()
    create_filing(business)


def test_filing_find_by_id(session):
    """Assert that a filing can be retrieved using its id."""
    business = create_business()
    filing = create_filing(business)

    filing = Filing.find_filing_by_id(filing.id)
    assert filing


def test_filing_find_by_business_id(session):
    """Assert that a filing can be retrieved using its id."""
    business = create_business()
    create_filing(business)

    filings = Filing.find_filings_by_business_id(business.id)
    assert filings
    assert len(filings) == 1


def test_filing_find_by_status(session):
    """Assert that a filing can be retrieved using status."""
    filing_status = "PENDING"
    business = create_business()
    filing = create_filing(business)
    filing.status = filing_status
    filing.save

    filings = Filing.find_filings_by_status(filing_status)
    assert filings
    assert len(filings) == 1
