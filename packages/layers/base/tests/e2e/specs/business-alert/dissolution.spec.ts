import type { Page } from '@playwright/test'
import { test, expect } from '@playwright/test'

import type { BusinessWarning } from '#business/app/interfaces/business-warning'
import { ApiWarningCode } from '#business/app/enums/api-warning-code'
import { ApiWarningType } from '#business/app/enums/api-warning-type'
import { mockApiCallsForAlerts } from '#test-mocks/mock-helpers'

async function setupPage(page: Page, warnings: BusinessWarning[]) {
  const identifier = 'BC1234567'
  await mockApiCallsForAlerts(page, identifier, warnings)
  await page.goto('./examples/components/BusinessAlerts')
  await page.waitForLoadState('networkidle')
  const input = page.getByTestId('identifier-input')
  input.fill(identifier)
  const loadBusiness = page.getByRole('button', { name: 'Load Business Alerts' })
  await loadBusiness.click()
  await page.waitForLoadState('networkidle')
}

test.describe('Business Alerts Tests - Dissolution', () => {
  const testCases = [
    {
      testName: '0 delays - ars',
      targetDissolutionDate: '2027-06-03',
      userDelays: 0,
      expectedDate: 'June 3, 2027',
      // eslint-disable-next-line max-len
      expectedExtraText: 'You can request up to two 6-month delays to postpone dissolution. If a business requires more time and has valid reasons for a longer delay, they may place a request by emailing BCRegistries@gov.bc.ca',
      overdueARs: true,
      overdueTransition: false
    },
    {
      testName: '1 delay - transition',
      targetDissolutionDate: '2026-03-21',
      userDelays: 1,
      expectedDate: 'March 21, 2026',
      // eslint-disable-next-line max-len
      expectedExtraText: 'You can request up to two 6-month delays to postpone dissolution. If a business requires more time and has valid reasons for a longer delay, they may place a request by emailing BCRegistries@gov.bc.ca',
      overdueARs: false,
      overdueTransition: true
    },
    {
      testName: '2 delays - ars',
      targetDissolutionDate: '2028-11-13',
      userDelays: 2,
      expectedDate: 'November 13, 2028',
      // eslint-disable-next-line max-len
      expectedExtraText: 'Businesses are only allowed to request up to two 6 month delays. If a business requires more time and has valid reasons for a longer delay, they may place a request by emailing BCRegistries@gov.bc.ca',
      overdueARs: true,
      overdueTransition: false
    }
  ]
  testCases.forEach(({
    testName,
    targetDissolutionDate,
    userDelays,
    expectedDate,
    expectedExtraText,
    overdueARs,
    overdueTransition
  }) => {
    test(testName, async ({ page }) => {
      await setupPage(page, [{
        code: ApiWarningCode.DISSOLUTION_IN_PROGRESS,
        data: {
          overdueARs,
          overdueTransition,
          stage_1_date: '2025-04-11T00:34:28.974191+00:00',
          targetDissolutionDate,
          targetStage2Date: '2026-03-05',
          userDelays
        },
        message: 'Business is in the process of involuntary dissolution.',
        warningType: ApiWarningType.INVOLUNTARY_DISSOLUTION
      }])

      const alerts = page.getByTestId('business-alerts')
      await expect(alerts).toBeVisible()
      const dissolutionAlertBtn = alerts.getByRole(
        'button', { name: 'Urgent - this business is in the process of being dissolved' })
      await expect(dissolutionAlertBtn).toBeVisible()
      await dissolutionAlertBtn.click()
      const content = alerts.getByTestId('business-alerts-dissolution-content')
      await expect(content).toBeVisible()
      const contentText = content.getByTestId('business-alerts-content-text')
      const contentExtraText = content.getByTestId('business-alerts-content-extra-text')
      await expect(contentText).toBeVisible()
      await expect(contentText).toContainText(expectedDate)
      if (overdueTransition) {
        await expect(contentText).toContainText('an overdue post restoration transition application')
      } else {
        await expect(contentText).toContainText('overdue annual reports')
      }
      await expect(contentExtraText).toHaveText(expectedExtraText)
    })
  })
})
