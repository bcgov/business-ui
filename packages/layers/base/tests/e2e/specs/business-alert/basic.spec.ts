import { test, expect } from '@playwright/test'

import { ApiWarningType } from '#business/app/enums/api-warning-type'
import { mockApiCallsForAlerts } from '#test-mocks/mock-helpers'

test.describe('Business Alerts Tests - Basic', () => {
  test.beforeEach(async ({ page }) => {
    const identifier = 'BC1234567'
    const isFutureLiquidationDueDateTest
      = test.info().title === 'Good standing alert is hidden when next liquidation due date is in the future'
    const noDissolutionAlertWhenLiquidation
      = test.info().title === 'Dissolution alert is not shown when business is in liquidation'
    const liquidationAlertTest = isFutureLiquidationDueDateTest || noDissolutionAlertWhenLiquidation
    const dissolutionInProgressWarning: BusinessWarning = {
      code: 'DISSOLUTION_IN_PROGRESS',
      data: {
        overdueTransition: true,
        targetDissolutionDate: '2028-06-16',
        userDelays: 0
      },
      message: 'Business is in the process of involuntary dissolution.',
      warningType: ApiWarningType.INVOLUNTARY_DISSOLUTION
    }
    const createLiquidationWarning = (nextLiquidationReportMinDate: string): BusinessWarning => ({
      code: 'LIQUIDATION_IN_PROGRESS',
      data: {
        nextLiquidationReportMinDate: nextLiquidationReportMinDate
      },
      message: 'This business is in the process of Liquidation.',
      warningType: ApiWarningType.LIQUIDATION
    })

    const liquidationWarnings = noDissolutionAlertWhenLiquidation
      ? [dissolutionInProgressWarning, createLiquidationWarning('2020-01-01T00:00:00.000+00:00')]
      : isFutureLiquidationDueDateTest
        ? [createLiquidationWarning('2099-01-01T00:00:00.000+00:00')]
        : [createLiquidationWarning('2020-01-01T00:00:00.000+00:00')]

    await mockApiCallsForAlerts(
      page,
      identifier,
      liquidationAlertTest ? liquidationWarnings : [])
    await page.goto('./examples/components/BusinessAlerts')
    await page.waitForLoadState('networkidle')
    // skip input for first test
    if (test.info().title !== 'BusinessAlerts test component displays as expected') {
      const input = page.getByTestId('identifier-input')
      input.fill(identifier)
      const loadBusiness = page.getByRole('button', { name: 'Load Business Alerts' })
      await loadBusiness.click()
      await page.waitForLoadState('networkidle')
    }
  })
  test('BusinessAlerts test component displays as expected', async ({ page }) => {
    await expect(page.getByText('BusinessAlerts').first()).toBeVisible()
    await expect(page.getByRole(
      'heading',
      { name: 'Example (login and API integration setup required)' }
    )).toBeVisible()
    await expect(page.getByRole('button', { name: 'Load Business Alerts' })).toBeVisible()
  })

  test('Loading the business alerts works as expected', async ({ page }) => {
    const alerts = page.getByTestId('business-alerts')
    await expect(alerts).toBeVisible()
    await expect(alerts.getByRole('heading')).toHaveText('Alerts (3)')
    await expect(alerts.getByRole('button', { name: 'This business is frozen' })).toBeVisible()
    await expect(alerts.getByRole('button', { name: 'This business is not in good standing' })).toBeVisible()
    await expect(alerts.getByRole(
      'button', { name: 'Urgent - this business is in the process of being dissolved' })).toBeVisible()
  })

  test('Good standing alert is hidden when next liquidation due date is in the future', async ({ page }) => {
    const alerts = page.getByTestId('business-alerts')
    await expect(alerts).toBeVisible()
    await expect(alerts.getByRole('heading')).toHaveText('Alerts (2)')
    await expect(alerts.getByRole('button', { name: 'This business is frozen' })).toBeVisible()
    await expect(alerts.getByRole(
      'button', { name: 'This Company is in the process of liquidation' })).toBeVisible()
    await expect(alerts.getByRole('button', { name: 'This business is not in good standing' })).toHaveCount(0)
  })

  test('Dissolution alert is not shown when business is in liquidation', async ({ page }) => {
    const alerts = page.getByTestId('business-alerts')
    await expect(alerts).toBeVisible()
    await expect(alerts.getByRole(
      'button', { name: 'This Company is in the process of liquidation' })).toBeVisible()
    await expect(alerts.getByRole('button', { name: 'This business is not in good standing' })).toBeVisible()
    await expect(alerts.getByRole(
      'button', { name: 'Urgent - this business is in the process of being dissolved' })).toHaveCount(0)
  })
})
