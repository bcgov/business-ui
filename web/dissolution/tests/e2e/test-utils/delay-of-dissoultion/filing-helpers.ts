import type { Page } from '@playwright/test'

import { getBusinessMock, getBusinessSettingsMock } from '#testMocks/business'
import { getPermissionsMock } from '#testMocks/business-permissions'
import { getLdarklyFlagsMock } from '#testMocks/ldarkly'

export const mockApiCallsForFiling = async (
  page: Page,
  identifier = 'BC1234567'
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
}
