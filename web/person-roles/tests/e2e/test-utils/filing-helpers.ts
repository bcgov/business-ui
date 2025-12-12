import type { Page } from '@playwright/test'

import { getBusinessMock, getBusinessSettingsMock } from '#testMocks/business'
import { getPermissionsMock } from '#testMocks/business-permissions'
import { getPartiesMock } from '#testMocks/parties'
import { getLdarklyFlagsMock } from '#testMocks/ldarkly'

export const mockApiCallsForFiling = async (
  page: Page,
  identifier = 'BC1234567',
  roleType: RoleType | string
) => {
  page.route('https://app.launchdarkly.com/sdk/evalx/**/context', async (route) => {
    await route.fulfill({ json: getLdarklyFlagsMock() })
  })
  page.route(`**/api/v2/businesses/${identifier}`, async (route) => {
    await route.fulfill({ json: getBusinessMock([{ key: 'identifier', value: identifier }]) })
  })
  page.route(`**/api/v1/entities/${identifier}`, async (route) => {
    await route.fulfill({ json: getBusinessSettingsMock() })
  })
  page.route('**/api/v2/permissions', async (route) => {
    await route.fulfill({ json: getPermissionsMock() })
  })
  // FUTURE: make this configurable for other filings
  page.route(`**/api/v2/businesses/${identifier}/parties?role=${roleType}`, async (route) => {
    // FUTURE: update roles of parties to match the configurables
    await route.fulfill({ json: getPartiesMock([
      { index: 0, key: 'roleType', value: roleType },
      { index: 1, key: 'roleType', value: roleType },
      { index: 2, key: 'roleType', value: roleType }
    ]) })
  })
}
