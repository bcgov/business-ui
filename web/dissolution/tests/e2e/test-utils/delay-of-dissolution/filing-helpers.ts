import type { Page } from '@playwright/test'

import { getBusinessMock, getBusinessSettingsMock } from '#testMocks/business'
import { getPermissionsMock } from '#testMocks/business-permissions'
import { getLdarklyFlagsMock } from '#testMocks/ldarkly'
import { DISDE } from '../../../mocks'

export const mockApiCallsForFiling = async (
  page: Page,
  identifier = 'BC1234567'
) => {
  page.route('https://app.launchdarkly.com/sdk/evalx/**/context', async (route) => {
    await route.fulfill({ json: getLdarklyFlagsMock() })
  })
  page.route(`**/api/v2/businesses/${identifier}`, async (route) => {
    await route.fulfill({ json: getBusinessMock(
      [
        { key: 'identifier', value: identifier },
        {
          key: 'allowedActions',
          value: {
            // @ts-expect-error - override type mismatch
            filing: {
              filingTypes: [
                {
                  displayName: 'Delay of Dissolution',
                  feeCode: 'DISDE',
                  name: 'dissolution',
                  type: 'delay'
                }
              ]
            }
          }
        }
      ]
    ) })
  })
  page.route(`**/api/v1/entities/${identifier}`, async (route) => {
    await route.fulfill({ json: getBusinessSettingsMock() })
  })
  page.route('**/api/v2/permissions', async (route) => {
    await route.fulfill({ json: getPermissionsMock() })
  })
  page.route('**/api/v2/permissions', async (route) => {
    await route.fulfill({ json: getPermissionsMock() })
  })
  page.route('**/api/v1/fees/**', async (route) => {
    await route.fulfill({ json: DISDE })
  })
}
