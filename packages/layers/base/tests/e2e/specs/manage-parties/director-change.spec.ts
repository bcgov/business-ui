import { test, expect } from '@playwright/test'

test.describe('ManageParties - director change preset', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./en-CA/examples/components/ManageParties/director-change')
    await page.waitForLoadState('networkidle')
  })

  test('Should hide the date fields when changing an existing director', async ({ page }) => {
    const manageParties = page.getByTestId('manage-parties')
    await expect(manageParties).toBeVisible()

    const rows = await manageParties.getByRole('table').locator('tbody').getByRole('row').all()
    const columns = await rows[0]!.locator('td').all()
    await columns[5]!.getByRole('button', { name: 'Change' }).click()

    const subForm = page.getByTestId('party-details-form')
    await expect(subForm).toBeVisible()
    // name + address sections editable; no role, effective date, or cessation date sections
    await expect(subForm.getByTestId('form-group-first-name')).toBeVisible()
    await expect(subForm.locator('#party-role-form')).toHaveCount(0)
    await expect(subForm.getByText('Start Date')).toHaveCount(0)
  })

  test('Should require the confirmation checkbox to change an existing director name', async ({ page }) => {
    const manageParties = page.getByTestId('manage-parties')
    const rows = await manageParties.getByRole('table').locator('tbody').getByRole('row').all()
    const columns = await rows[0]!.locator('td').all()
    await columns[5]!.getByRole('button', { name: 'Change' }).click()

    const subForm = page.getByTestId('party-details-form')
    // no checkbox until the name differs from the original
    await expect(subForm.getByTestId('name-change-confirmation')).toHaveCount(0)

    const lastName = subForm.getByTestId('form-group-last-name').locator('input')
    await lastName.fill('Newname')
    await expect(subForm.getByTestId('name-change-confirmation')).toBeVisible()

    // Done is blocked until the checkbox is checked - the schema error renders under the
    // Legal Name label column (plus an sr-only copy at the checkbox, hence .first())
    await subForm.getByRole('button', { name: 'Done' }).click()
    await expect(subForm.getByText('Confirm the legal name change to continue').first()).toBeVisible()
    await expect(subForm).toBeVisible()

    await subForm.locator('#name-change-confirm-checkbox').check()
    await expect(subForm.getByText('Confirm the legal name change to continue')).toHaveCount(0)
    await subForm.getByRole('button', { name: 'Done' }).click()
    await expect(page.getByTestId('party-details-form')).toHaveCount(0)

    // the edit landed as a name change
    const payload = page.getByTestId('relationships-payload')
    await expect(payload).toContainText('NAME_CHANGED')
    await expect(payload).toContainText('Newname')
  })

  test('Should clear the confirmation checkbox when the name is reverted', async ({ page }) => {
    const manageParties = page.getByTestId('manage-parties')
    const rows = await manageParties.getByRole('table').locator('tbody').getByRole('row').all()
    const columns = await rows[0]!.locator('td').all()
    await columns[5]!.getByRole('button', { name: 'Change' }).click()

    const subForm = page.getByTestId('party-details-form')
    const lastName = subForm.getByTestId('form-group-last-name').locator('input')

    await lastName.fill('Newname')
    await expect(subForm.getByTestId('name-change-confirmation')).toBeVisible()

    await lastName.fill('Testing')
    await expect(subForm.getByTestId('name-change-confirmation')).toHaveCount(0)
  })

  test('Should show the date field and no confirmation checkbox when adding a director', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Director' }).click()

    const subForm = page.getByTestId('party-details-form')
    await expect(subForm).toBeVisible()
    // added directors get the (required) appointment date field
    await expect(subForm.getByText('Effective Date')).toBeVisible()
    // and never the name-change confirmation
    const lastName = subForm.getByTestId('form-group-last-name').locator('input')
    await lastName.fill('Director')
    await expect(subForm.getByTestId('name-change-confirmation')).toHaveCount(0)
  })

  test('Should show the statutory director warning without blocking', async ({ page }) => {
    // the mock directors are all in QC, so the BC residency warning fires (min count of 3 is met)
    const warning = page.getByTestId('director-warning')
    await expect(warning).toBeVisible()
    await expect(warning).toContainText('resident of British Columbia')
  })

  test('Should only include changed rows in the relationships payload', async ({ page }) => {
    const payload = page.getByTestId('relationships-payload')
    await expect(payload).toHaveText('[]')

    const manageParties = page.getByTestId('manage-parties')
    const rows = await manageParties.getByRole('table').locator('tbody').getByRole('row').all()
    const columns = await rows[0]!.locator('td').all()
    // Delete sits in the row's dropdown menu (the main action is Change)
    await columns[5]!.getByRole('button', { name: 'More Actions' }).click()
    await page.getByRole('menuitem', { name: 'Delete' }).click()

    await expect(payload).toContainText('REMOVED')
    const parsed = JSON.parse((await payload.textContent()) ?? '[]')
    expect(parsed).toHaveLength(1)
    expect(parsed[0].roles[0].cessationDate).toBeTruthy()
  })
})
