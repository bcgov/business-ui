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
"""Methods common for multiple test cases.
"""
from datetime import datetime
from business_ar_api.models import Business, Filing


FILING_JSON = {
    "filing": {
        "header": {"filingYear": 2021},
        "annualReport": {
            "annualGeneralMeetingDate": "2021-01-01",
            "annualReportDate": "2021-12-31",
            "votedForNoAGM": False,
        },
    }
}


def create_business():
    business = Business(
        legal_name="Test Business 60",
        legal_type="BC",
        identifier="BC1214453",
        tax_id="BN1234567899875",
    )
    business.save()
    assert business.id is not None
    return business


def create_filing(business):
    filing = Filing(
        fiscal_year=2020,
        filing_json=FILING_JSON,
        filing_date=datetime.now(),
        completion_date=datetime.now(),
        status="DRAFT",
        invoice_id=123,
        payment_status_code="CREATED",
        payment_account="123",
        business_id=business.id,
    )
    filing.save()
    assert filing.id
    return filing
