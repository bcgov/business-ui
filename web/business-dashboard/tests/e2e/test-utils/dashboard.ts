import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { getBusinessMock, getPermissionsMock, mockApiCallsForSetAccount, mockLdarkly } from '#test-mocks'
import type { BusinessOverride } from '#test-mocks'

export const DEFAULT_IDENTIFIER = 'BC1234567'
export const DEFAULT_BUSINESS_NAME = 'TEST DASHBOARD LTD.'

export interface DashboardSetup {
  accountType?: 'PREMIUM' | 'SBC_STAFF' | 'STAFF'
  businessOverrides?: BusinessOverride[]
  identifier?: string
  /** false: mocks only, the test navigates itself */
  navigate?: boolean
}

export async function navigateToDashboard(page: Page, identifier = DEFAULT_IDENTIFIER) {
  await page.goto(`./en-CA/${identifier}`)
  await expect(page.getByTestId('business-dashboard')).toBeVisible()
}

/** Mocks the api calls the dashboard makes on load, then opens it. */
export async function setupDashboard(page: Page, setup: DashboardSetup = {}) {
  const { accountType = 'PREMIUM', businessOverrides = [], identifier = DEFAULT_IDENTIFIER, navigate = true } = setup

  await mockLdarkly(page)
  await mockApiCallsForSetAccount(page, accountType)
  await page.route('**/api/v2/permissions', async (route) => {
    await route.fulfill({ json: getPermissionsMock() })
  })
  await page.route(`**/api/v2/businesses/${identifier}?slim=true`, async (route) => {
    await route.fulfill({
      json: getBusinessMock([
        { key: 'identifier', value: identifier },
        { key: 'legalName', value: DEFAULT_BUSINESS_NAME },
        ...businessOverrides
      ], true)
    })
  })

  if (navigate) {
    await navigateToDashboard(page, identifier)
  }
}
