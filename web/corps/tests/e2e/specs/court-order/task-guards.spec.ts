import { test, expect } from '@playwright/test'
import { gotoCourtOrderPage } from '../../test-utils'

const identifier = 'BC1234567'
const filingId = '999002'
const poaCheckboxText = 'This filing is pursuant to a Plan of Arrangement'

test.describe('Court Order - Task Guards', () => {
  test.beforeEach(async ({ page }) => {
    await gotoCourtOrderPage(page, identifier, filingId)
  })

  // NB: the resumed draft is the baseline - the page always resumes a pre-created draft, so
  // 'no changes' means the form state still matches what was loaded from the draft
  test('should prevent save when no changes have been made', async ({ page }) => {
    await page.getByRole('button', { name: 'Save and Resume Later' }).click()
    await expect(page.getByTestId('right-buttons')).toContainText('There are no changes to save')
  })

  // the box only reveals the upload - it is never saved with the filing
  test('should not count checking the add supporting documents box as a change', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Add supporting documents' }).check()
    await page.getByRole('button', { name: 'Save and Resume Later' }).click({ delay: 500 })
    await expect(page.getByTestId('right-buttons')).toContainText('There are no changes to save')
  })

  test('should be able to cancel when no changes have been made', async ({ page }) => {
    await page.getByRole('button', { name: 'Cancel', exact: true }).click()
    // should be redirected to dashboard page
    await expect(page).not.toHaveURL(/.*court-order.*/)
    await expect(page.getByText('Redirected to playwright mocked business dashboard')).toBeVisible()
  })

  test('should display modal on cancel when changes have been made', async ({ page }) => {
    await page.getByText(poaCheckboxText, { exact: true }).click()
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
    await page.getByText(poaCheckboxText, { exact: true }).click()

    // https://playwright.dev/docs/dialogs#beforeunload-dialog
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('beforeunload')
      await page.waitForTimeout(1000)
      await dialog.dismiss()
    })

    // Try to navigate away with unsaved changes
    await page.getByRole('link', { name: 'MCELROY ENTERPRISES LTD. -' }).click({ delay: 500 })
    // should still be on court order page due to browser dialog
    await expect(page).toHaveURL(/.*court-order.*/)
  })
})
