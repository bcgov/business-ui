import { test, expect } from '@playwright/test'
import { setupOfficerChangePage } from '../test-utils'

test.describe('Form Validation', () => {
  test.use({ storageState: 'tests/e2e/.auth/bcsc-user.json' })

  test.beforeEach(async ({ page }) => {
    await setupOfficerChangePage(page)
  })

  test.describe('Add Officer Form', () => {
    test.beforeEach(async ({ page }) => {
      // form should be hidden by default
      await expect(page.getByTestId('officer-form')).not.toBeVisible()
      // open form
      await page.getByRole('button', { name: 'Add Officer' }).click()
      await expect(page.getByTestId('officer-form')).toBeVisible()
    })

    test('should display required field errors on submit', async ({ page }) => {
      await page.getByRole('button', { name: 'Done' }).click()
      await expect(page.getByTestId('form-group-last-name')).toContainText('This field is required')
      await expect(page.getByTestId('delivery-address-field-street')).toContainText('This field is required')
      await expect(page.locator('fieldset').filter({ hasText: 'Roles' })).toContainText('Choose at least one role')
    })

    test('should display a max length error', async ({ page }) => {
      const lastNameInput = page.getByLabel('Last Name')
      await lastNameInput.fill('a'.repeat(31))
      await page.getByRole('button', { name: 'Done' }).click()
      await expect(page.getByTestId('form-group-last-name')).toContainText('Maximum 30 characters')
    })

    test('should update required fields when the country changes', async ({ page }) => {
      const regionGroup = page.getByTestId('delivery-address-field-region')

      await page.getByRole('button', { name: 'Done' }).click()
      await expect(regionGroup).toContainText('This field is required')

      await page.getByTestId('delivery-address-input-country').click()
      await page.getByRole('option', { name: 'Albania' }).first().click()

      await page.getByRole('button', { name: 'Done' }).click()

      await expect(regionGroup).not.toContainText('This field is required')
    })
  })

  test.describe('Folio Form', () => {
    test.beforeEach(async ({ page }) => {
      await expect(page.getByTestId('folio-form')).toBeVisible()
    })

    test('should display a max length error', async ({ page }) => {
      const folioInput = page.getByLabel('Folio or Reference Number (Optional)')
      await folioInput.fill('a'.repeat(51))
      // click outside to trigger validation
      await page.getByText('Folio or Reference Number').first().click()
      await expect(page.getByTestId('form-field-folio-number')).toContainText('Maximum 50 characters')
    })
  })
})
