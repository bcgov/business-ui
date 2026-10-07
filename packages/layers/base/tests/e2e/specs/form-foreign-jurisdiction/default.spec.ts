import { test, expect } from '@playwright/test'

async function pickMenuOption(page: import('@playwright/test').Page, menuTestId: string, optionText: string) {
  await page.getByTestId(menuTestId).click()
  const optionsList = page.getByRole('listbox') // listbox is a teleport on the page body
  await expect(optionsList).toBeVisible()
  await page.keyboard.type(optionText)
  await page.keyboard.press('Enter')
  await expect(optionsList).not.toBeVisible()
}

test.describe('FormForeignJurisdiction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./en-CA/examples/components/Form/ForeignJurisdiction')
    await page.waitForLoadState('networkidle')
  })

  test('Should render country select only until CA/US is chosen', async ({ page }) => {
    const section = page.getByTestId('foreign-jurisdiction-section')
    await expect(section).toBeVisible()
    await expect(section.getByTestId('jurisdiction-country')).toBeVisible()
    await expect(section.getByTestId('jurisdiction-region')).toHaveCount(0)
  })

  test('Should require a country on submit', async ({ page }) => {
    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(page.getByText('Jurisdiction Country is required')).toBeVisible()
  })

  test('Should require a region for Canada and exclude BC from the options', async ({ page }) => {
    await pickMenuOption(page, 'jurisdiction-country', 'Canada')

    const section = page.getByTestId('foreign-jurisdiction-section')
    await expect(section.getByTestId('jurisdiction-region')).toBeVisible()

    // region options exclude British Columbia but include Federal
    await section.getByTestId('jurisdiction-region').click()
    const optionsList = page.getByRole('listbox')
    await expect(optionsList).toBeVisible()
    await expect(optionsList.getByText('Federal', { exact: true })).toBeVisible()
    await expect(optionsList.getByText('British Columbia', { exact: true })).toHaveCount(0)
    await page.keyboard.press('Escape')

    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(page.getByText('Jurisdiction Region is required')).toBeVisible()
  })

  test('Should submit a Canadian province jurisdiction', async ({ page }) => {
    await pickMenuOption(page, 'jurisdiction-country', 'Canada')
    await pickMenuOption(page, 'jurisdiction-region', 'Alberta')
    await page.getByRole('button', { name: 'Submit' }).click()

    const submitted = page.getByTestId('submitted-data')
    await expect(submitted).toContainText('"country": "CA"')
    await expect(submitted).toContainText('"region": "AB"')
  })

  test('Should submit a US state jurisdiction', async ({ page }) => {
    await pickMenuOption(page, 'jurisdiction-country', 'United States')
    await pickMenuOption(page, 'jurisdiction-region', 'Washington')
    await page.getByRole('button', { name: 'Submit' }).click()

    const submitted = page.getByTestId('submitted-data')
    await expect(submitted).toContainText('"country": "US"')
    await expect(submitted).toContainText('"region": "WA"')
  })

  test('Should clear the region when the country changes', async ({ page }) => {
    await pickMenuOption(page, 'jurisdiction-country', 'Canada')
    await pickMenuOption(page, 'jurisdiction-region', 'Alberta')

    await pickMenuOption(page, 'jurisdiction-country', 'Australia')
    const section = page.getByTestId('foreign-jurisdiction-section')
    await expect(section.getByTestId('jurisdiction-region')).toHaveCount(0)

    await page.getByRole('button', { name: 'Submit' }).click()
    const submitted = page.getByTestId('submitted-data')
    await expect(submitted).toContainText('"country": "AU"')
    await expect(submitted).toContainText('"region": ""')
  })
})
