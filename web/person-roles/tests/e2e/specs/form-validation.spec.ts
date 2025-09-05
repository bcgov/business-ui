import { test, expect } from '@playwright/test'
import type { Locator } from '@playwright/test'
// import { scanA11y } from '../test-utils/a11y'
import { NOCOI, businessBC1234567, tasksBC1234567, authInfoBC1234567, partiesBC1234567 } from '~~/tests/mocks'

// TODO: fix a11y checks
// await scanA11y(page, ['#connect-system-banner', '#business-filing-tombstone'])

test.describe('Form Validation', () => {
  test.use({ storageState: 'tests/e2e/.auth/bcsc-user.json' })

  const identifier = 'BC1234567'
  let form: Locator

  test.beforeEach(async ({ page }) => {
    // mock all api calls
    await page.route(`*/**/entities/${identifier}`, async (route) => {
      await route.fulfill({ json: authInfoBC1234567 })
    })
    await page.route(`*/**/businesses/${identifier}`, async (route) => {
      await route.fulfill({ json: businessBC1234567 })
    })
    await page.route(`*/**/businesses/${identifier}/tasks`, async (route) => {
      await route.fulfill({ json: tasksBC1234567 })
    })
    await page.route(`*/**/businesses/${identifier}/parties?classType=officer`, async (route) => {
      await route.fulfill({ json: partiesBC1234567 })
    })
    await page.route('*/**/fees/**/NOCOI', async (route) => {
      await route.fulfill({ json: NOCOI })
    })

    // go to officer change page
    await page.goto('./en-CA/officer-change/BC1234567')
    await page.waitForLoadState('networkidle')

    // wait for page to be visible
    await expect(page.getByText('Officer Change').first()).toBeVisible()
  })

  test.describe('Add Officer Form', () => {
    test.beforeEach(async ({ page }) => {
      // form should be hidden by default
      await expect(page.getByTestId('officer-form')).not.toBeVisible()
      // open form
      await page.getByRole('button', { name: 'Add Officer' }).click()
      form = page.getByTestId('officer-form')

      await expect(form).toBeVisible()
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
