import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { pickJurisdiction } from '#business/tests/e2e/test-utils'

async function navigateToManageYourCompanyPage(page: Page) {
  await page.goto('./en-CA/examples/components/Manage/YourCompany')
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('heading', { name: 'Your Company' })).toBeVisible()
}

// Name anchored at the start - other rows ("Name in previous Jurisdiction", "Identifying
// Number (Previous Jurisdiction)") substring-match, and a badge suffix appears once corrected.
function getFieldRow(page: Page, rowLabel: string) {
  return page.getByRole('group', { name: new RegExp(`^${rowLabel}`) })
}

test.describe('ManageYourCompany - jurisdiction', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToManageYourCompanyPage(page)
  })

  test('renders the seeded new and previous jurisdiction rows', async ({ page }) => {
    const newRow = getFieldRow(page, 'New Jurisdiction')
    const previousRow = getFieldRow(page, 'Previous Jurisdiction')

    await expect(newRow).toContainText('Alberta, Canada')
    await expect(previousRow).toContainText('United States')
  })

  test('corrects the new jurisdiction and shows the corrected badge', async ({ page }) => {
    const newRow = getFieldRow(page, 'New Jurisdiction')
    await newRow.getByRole('button', { name: 'Correct' }).click()

    const combobox = newRow.getByRole('combobox', { name: 'Select New Jurisdiction' })
    await pickJurisdiction(page, combobox, 'Manitoba, Canada')
    await newRow.getByRole('button', { name: 'Done' }).click()

    await expect(newRow).toContainText('Manitoba, Canada')
    await expect(newRow).toContainText('CORRECTED')
  })

  test('undoes a new jurisdiction correction', async ({ page }) => {
    const newRow = getFieldRow(page, 'New Jurisdiction')
    await newRow.getByRole('button', { name: 'Correct' }).click()

    const combobox = newRow.getByRole('combobox', { name: 'Select New Jurisdiction' })
    await pickJurisdiction(page, combobox, 'Manitoba, Canada')
    await newRow.getByRole('button', { name: 'Done' }).click()
    await expect(newRow).toContainText('CORRECTED')

    await newRow.getByRole('button', { name: 'Undo' }).click()

    await expect(newRow).toContainText('Alberta, Canada')
    await expect(newRow).not.toContainText('CORRECTED')
  })

  test('corrects the previous jurisdiction and shows the corrected badge', async ({ page }) => {
    const previousRow = getFieldRow(page, 'Previous Jurisdiction')
    await previousRow.getByRole('button', { name: 'Correct' }).click()

    const combobox = previousRow.getByRole('combobox', { name: 'Select Previous Jurisdiction' })
    await pickJurisdiction(page, combobox, 'Australia')
    await previousRow.getByRole('button', { name: 'Done' }).click()

    await expect(previousRow).toContainText('Australia')
    await expect(previousRow).toContainText('CORRECTED')
  })

  // Both rows start seeded with a selection and the combobox can't clear one back to empty,
  // so the required-jurisdiction error path isn't reachable here.
})
