import { test, expect } from '@playwright/test'
import { setupChangeOfDirectorsPage, navigateToChangeOfDirectorsPage } from '../../test-utils'
import { OTCDR } from '~~/tests/mocks'

const identifier = 'BC1234567'

test.describe('Change of Directors - Task Guards', () => {
  test.beforeEach(async ({ page }) => {
    await setupChangeOfDirectorsPage(page, identifier, OTCDR, 'PREMIUM')
    await navigateToChangeOfDirectorsPage(page, identifier)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })
  })

  test('should prevent submit when no director changes have been made', async ({ page }) => {
    await page.getByTestId('cod-date-input').fill('2026-02-15')
    await page.getByRole('checkbox', { name: /i certify/i }).check()
    await page.getByRole('button', { name: 'Submit' }).click()

    // Submit is blocked — no director changes made
    await expect(page.getByTestId('right-buttons')).toContainText('There are no changes to submit')
  })

  test('should prevent save when no changes have been made', async ({ page }) => {
    await page.getByRole('button', { name: 'Save and Resume Later' }).click()
    await expect(page.getByTestId('left-buttons')).toContainText('There are no changes to save')
  })

  test('should be able to cancel when no changes have been made', async ({ page }) => {
    await page.getByRole('button', { name: 'Cancel', exact: true }).click()
    await expect(page).not.toHaveURL(/.*change-of-directors.*/)
    expect(page.getByText('Redirected to playwright mocked business dashboard')).toBeVisible()
  })

  test('should display modal on cancel when changes have been made', async ({ page }) => {
    await page.getByTestId('cod-date-input').fill('2026-02-15')
    await page.getByRole('button', { name: 'Cancel', exact: true }).click({ delay: 500 })

    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expect(modal).toContainText('Unsaved changes')
    await expect(modal).toContainText('You have unsaved changes. Are you sure you want to exit your filing?')
    await expect(page).not.toHaveURL(/.*business-dashboard.*/)
  })

  test('should prevent external navigation with browser popup if changes have been made', async ({ page }) => {
    await page.getByTestId('cod-date-input').fill('2026-02-15')

    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('beforeunload')
      await page.waitForTimeout(1000)
      await dialog.dismiss()
    })

    await page.getByRole('link', { name: 'MCELROY ENTERPRISES LTD. -' }).click({ delay: 500 })
    await expect(page).toHaveURL(/.*change-of-directors.*/)
  })
})
