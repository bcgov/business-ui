import { test, expect } from '@playwright/test'
import { mockCommonApiCallsForFiling } from '#test-mocks'
import { DISDE } from '~~/tests/mocks'
import { navigateToDodPage } from '~~/tests/e2e/test-utils'

const identifier = 'BC1234567'

test.describe('Task Guards', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2025-12-30'))
    await mockCommonApiCallsForFiling(page, identifier, undefined, DISDE, undefined, 'STAFF')
    await navigateToDodPage(page, identifier)
  })

  // NB: the nature of this form allows submitting the default form state, no changes are required for submission
  test('should prevent save when no changes have been made', async ({ page }) => {
    await page.getByRole('button', { name: 'Save and Resume Later' }).click()
    await expect(page.getByTestId('left-buttons')).toContainText('There are no changes to save')
  })

  test('should be able to cancel when no changes have been made', async ({ page }) => {
    await page.getByRole('button', { name: 'Cancel', exact: true }).click()
    // should be redirected to dashboard page
    await expect(page).not.toHaveURL(/.*dissolution.*/)
    expect(page.getByText('Redirected to playwright mocked business dashboard')).toBeVisible()
  })

  test('should display modal on cancel when changes have been made', async ({ page }) => {
    await page.getByText('This filing is pursuant to a Plan of Arrangement', { exact: true }).click()
    await page.getByRole('button', { name: 'Cancel', exact: true }).click({ delay: 500 })

    // should have a modal asking to confirm cancelling
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expect(modal).toContainText('Unsaved changes')
    await expect(modal)
      .toContainText('You have unsaved changes. Are you sure you want to exit your filing?')
    await expect(page).not.toHaveURL(/.*business-dashboard.*/)
  })

  test('should prevent external navigation with browser popup if changes have been made', async ({ page }) => {
    await page.getByText('This filing is pursuant to a Plan of Arrangement', { exact: true }).click()

    // https://playwright.dev/docs/dialogs#beforeunload-dialog
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('beforeunload')
      await page.waitForTimeout(1000)
      await dialog.dismiss()
    })

    // Try to navigate away with unsaved changes
    await page.getByRole('link', { name: 'MCELROY ENTERPRISES LTD. -' }).click({ delay: 500 })
    // should still be on dissolution page due to browser dialog
    await expect(page).toHaveURL(/.*dissolution.*/)
  })
})
