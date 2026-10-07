import { test, expect } from '@playwright/test'

test.describe('FormConfirmCompletingParty', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./en-CA/examples/components/Form/ConfirmCompletingParty')
    await page.waitForLoadState('networkidle')
  })

  test('Should render the confirmation checkbox with the five statutory bullets', async ({ page }) => {
    const section = page.getByTestId('confirm-completing-party-section')
    await expect(section).toBeVisible()
    await expect(
      section.getByText('The following information must be confirmed before submitting this filing.')
    ).toBeVisible()
    // the Confirm side label renders in every variant
    await expect(section.getByText('Confirm', { exact: true })).toBeVisible()
    await expect(section.getByText('confirm that the laws of the foreign jurisdiction')).toBeVisible()
    const bullets = section.locator('ul > li')
    await expect(bullets).toHaveCount(5)
    await expect(bullets.first()).toContainText('the property, rights and interest of the company')
    // no name input in the default (non-staff) variant
    await expect(section.locator('#completing-party-name-input')).toHaveCount(0)
  })

  test('Should require the checkbox on submit', async ({ page }) => {
    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(page.getByText('Check this box to continue')).toBeVisible()
  })

  test('Should submit when confirmed', async ({ page }) => {
    await page.getByTestId('confirm-completing-party-checkbox').locator('input[type="checkbox"]').check()
    await page.getByRole('button', { name: 'Submit' }).click()

    const submitted = page.getByTestId('submitted-data')
    await expect(submitted).toContainText('"confirmed": true')
  })

  test('Should require and interpolate the legal name in the staff variant', async ({ page }) => {
    await page.getByTestId('toggle-editable-name').check()

    const section = page.getByTestId('confirm-completing-party-section')
    // placeholder shown in the lead-in until a name is entered
    await expect(section.getByText('[Legal name of completing party]')).toBeVisible()

    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(page.getByText('Please enter the full legal name of the completing party')).toBeVisible()

    await section.locator('#completing-party-name-input').fill('Jane Smith')
    await expect(section.getByText('Jane Smith', { exact: false })).toBeVisible()

    await section.getByTestId('confirm-completing-party-checkbox').locator('input[type="checkbox"]').check()
    await page.getByRole('button', { name: 'Submit' }).click()

    const submitted = page.getByTestId('submitted-data')
    await expect(submitted).toContainText('"completingPartyName": "Jane Smith"')
    await expect(submitted).toContainText('"confirmed": true')
  })
})
