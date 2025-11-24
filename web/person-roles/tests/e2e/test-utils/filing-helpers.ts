import type { Page } from '@playwright/test'

import { getBusinessMock, getBusinessSettingsMock } from '#testMocks/business'
import { getPartiesMock } from '#testMocks/parties'
import { getLdarklyFlagsMock } from '#testMocks/ldarkly'

export const mockApiCallsForFiling = async (
  page: Page,
  identifier = 'BC1234567'
) => {
  page.route('https://app.launchdarkly.com/sdk/evalx/**/context', async (route) => {
    await route.fulfill({ json: getLdarklyFlagsMock() })
  })
  page.route(`**/api/v2/businesses/${identifier}`, async (route) => {
    await route.fulfill({ json: getBusinessMock() })
  })
  page.route(`**/api/v1/entities/${identifier}`, async (route) => {
    await route.fulfill({ json: getBusinessSettingsMock() })
  })
  // FUTURE: make this configurable for other filings
  page.route(`**/api/v2/businesses/${identifier}/parties?role=Receiver`, async (route) => {
    // FUTURE: update roles of parties to match the configurables
    await route.fulfill({ json: getPartiesMock() })
  })
}
