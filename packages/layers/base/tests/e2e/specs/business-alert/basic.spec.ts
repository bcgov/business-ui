import { test, expect } from '@playwright/test'

import { mockApiCallsForAlerts } from '#test-mocks/mock-helpers'

test.describe('Business Alerts Tests - Basic', () => {
  test.beforeEach(async ({ page }) => {
    const identifier = 'BC1234567'
    await mockApiCallsForAlerts(page, identifier)
    await page.goto('./examples/components/BusinessAlerts')
    await page.waitForLoadState('networkidle')
    // skip input for first test
    if (test.info().title !== 'BusinessLedger test component displays as expected') {
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
})
