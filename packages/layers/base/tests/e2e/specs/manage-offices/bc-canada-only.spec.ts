import { test, expect } from '@playwright/test'

test.describe('ManageOffices - bcCanadaOnly', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./en-CA/examples/components/ManageOffices/bc-canada-only')
    await page.waitForLoadState('networkidle')
  })

  async function openFirstOfficeEdit(page: import('@playwright/test').Page) {
    const table = page.getByRole('table')
    const rows = await table.locator('tbody').getByRole('row').all()
    await rows[0]!.getByRole('button', { name: 'Change' }).click()
    const subForm = page.getByTestId('office-address-form')
    await expect(subForm).toBeVisible()
    return subForm
  }

  test('Should keep the region input editable and show an inline error for a non-BC region', async ({ page }) => {
    const subForm = await openFirstOfficeEdit(page)

    // region stays an editable input - change it to Alberta
    const regionSelect = subForm.getByTestId('mailing-address-input-region')
    await expect(regionSelect).toBeEnabled()
    await regionSelect.click()
    const optionsList = page.getByRole('listbox')
    await expect(optionsList).toBeVisible()
    await page.keyboard.type('Alberta')
    await page.keyboard.press('Enter')

    await subForm.getByRole('button', { name: 'Done' }).click()

    await expect(subForm.getByText('Address must be in British Columbia')).toBeVisible()
    // the form stays open (done blocked by validation)
    await expect(page.getByTestId('office-address-form')).toBeVisible()
  })

  test('Should accept a BC, Canada address', async ({ page }) => {
    const subForm = await openFirstOfficeEdit(page)

    const streetInput = subForm.getByTestId('mailing-address-input-street')
    await streetInput.fill('456 New St')
    await subForm.getByRole('button', { name: 'Done' }).click()

    await expect(page.getByTestId('office-address-form')).toHaveCount(0)
    await expect(page.getByTestId('offices-payload')).toContainText('456 New St')
  })
})
