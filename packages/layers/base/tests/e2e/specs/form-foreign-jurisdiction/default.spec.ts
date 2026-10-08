import { test, expect } from '@playwright/test'
import { pickJurisdiction } from '#business/tests/e2e/test-utils'

test.describe('FormForeignJurisdiction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./en-CA/examples/components/Form/ForeignJurisdiction')
    await page.waitForLoadState('networkidle')
  })

  test('Should render the single combined jurisdiction menu', async ({ page }) => {
    const section = page.getByTestId('foreign-jurisdiction-section')
    await expect(section).toBeVisible()
    await expect(section.getByRole('combobox', { name: 'Select New Jurisdiction' })).toBeVisible()
    await expect(section.getByTestId('jurisdiction-country')).toHaveCount(0)
    await expect(section.getByTestId('jurisdiction-region')).toHaveCount(0)
  })

  test('Should list Canadian provinces (minus BC) plus Federal, then international countries', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Select New Jurisdiction' })
    await input.click()
    const optionsList = page.getByRole('listbox')
    await expect(optionsList).toBeVisible()

    await expect(optionsList.getByText('British Columbia, Canada', { exact: true })).toHaveCount(0)
    await expect(optionsList.getByText('Federal', { exact: true })).toBeVisible()
    await expect(optionsList.getByText('United States', { exact: true })).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(optionsList).not.toBeVisible()
  })

  test('Should require a jurisdiction on submit', async ({ page }) => {
    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(page.getByText('Jurisdiction is required').first()).toBeVisible()
  })

  test('Should submit a Canadian province jurisdiction', async ({ page }) => {
    const combobox = page.getByRole('combobox', { name: 'Select New Jurisdiction' })
    await pickJurisdiction(page, combobox, 'Alberta, Canada')
    await page.getByRole('button', { name: 'Submit' }).click()

    const submitted = page.getByTestId('submitted-data')
    await expect(submitted).toContainText('"country": "CA"')
    await expect(submitted).toContainText('"region": "AB"')
  })

  test('Should submit a United States jurisdiction', async ({ page }) => {
    const combobox = page.getByRole('combobox', { name: 'Select New Jurisdiction' })
    await pickJurisdiction(page, combobox, 'United States')
    await page.getByRole('button', { name: 'Submit' }).click()

    const submitted = page.getByTestId('submitted-data')
    await expect(submitted).toContainText('"country": "US"')
    await expect(submitted).toContainText('"region": null')
  })

  test('Should replace a prior selection when a new jurisdiction is picked', async ({ page }) => {
    const combobox = page.getByRole('combobox', { name: 'Select New Jurisdiction' })
    await pickJurisdiction(page, combobox, 'Alberta, Canada')
    await pickJurisdiction(page, combobox, 'Australia')
    await page.getByRole('button', { name: 'Submit' }).click()

    const submitted = page.getByTestId('submitted-data')
    await expect(submitted).toContainText('"country": "AU"')
    await expect(submitted).toContainText('"region": null')
  })
})
