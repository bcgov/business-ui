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
"""Tests for the ColinEventId model.

Test suite to ensure that the ColinEventId model routines are working as expected.
"""
from business_ar_api.models import ColinEventId
from tests import create_business, create_filing


def test_colin_event_save(session):
    """Assert that a colin event can be saved."""
    business = create_business()
    filing = create_filing(business)
    colin_event_id = ColinEventId(colin_event_id=1, filing_id=filing.id)
    colin_event_id.save()


def test_colin_event_find_by_id(session):
    """Assert that a colin event can be retrieved using its id."""
    business = create_business()
    filing = create_filing(business)

    colin_event_id = ColinEventId(colin_event_id=2, filing_id=filing.id)
    colin_event_id.save()
    res = ColinEventId.get_by_colin_id(colin_event_id.colin_event_id)
    assert res


def test_colin_event_find_by_filing_id(session):
    """Assert that a colin event can be retrieved using its filing id."""
    business = create_business()
    filing = create_filing(business)

    colin_event_id = ColinEventId(colin_event_id=3, filing_id=filing.id)
    colin_event_id.save()
    res = ColinEventId.get_by_filing_id(filing.id)
    assert res
    assert len(res) == 1
