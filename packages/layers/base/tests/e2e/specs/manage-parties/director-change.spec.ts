import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

function getFirstRow(page: Page) {
  return page.getByTestId('manage-parties').getByRole('table').locator('tbody').getByRole('row').first()
}

// opens the first director's edit form from the row dropdown ("Change Address" / "Change Legal Name")
async function openEditOption(page: Page, option: 'Change address' | 'Change legal name') {
  await getFirstRow(page).getByRole('button', { name: 'More Actions' }).click()
  await page.getByRole('menuitem', { name: option }).click()
  const subForm = page.getByTestId('party-details-form')
  await expect(subForm).toBeVisible()
  return subForm
}

test.describe('ManageParties - director change preset', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./en-CA/examples/components/Manage/Parties/director-change')
    await page.waitForLoadState('networkidle')
  })

  test('Should lay the table out as the director change design does', async ({ page }) => {
    const manageParties = page.getByTestId('manage-parties')
    await expect(manageParties).toBeVisible()

    // delivery before mailing, and the ISO appointment date alone under "Appointed/Elected"
    const headers = (await manageParties.getByRole('columnheader').allTextContents()).map(h => h.trim())
    expect(headers.indexOf('Delivery Address')).toBeLessThan(headers.indexOf('Mailing Address'))
    expect(headers).toContain('Appointed/Elected')
    const firstRow = getFirstRow(page)
    await expect(firstRow).toContainText('2023-08-16')
    await expect(firstRow).not.toContainText('to current')

    // directors are ceased from the row's main button; the edits sit in the dropdown, each on its own
    await expect(firstRow.getByRole('button', { name: 'Cease' })).toBeVisible()
    await firstRow.getByRole('button', { name: 'More Actions' }).click()
    await expect(page.getByRole('menuitem', { name: 'Change address', exact: true })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Change legal name', exact: true })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Delete' })).toHaveCount(0)
    await page.keyboard.press('Escape')

    // the Appoint button sits alone above the table; the "Directors" heading is for screen readers only
    const headerActions = page.getByTestId('manage-parties-header-actions')
    await expect(headerActions.getByRole('button', { name: 'Appoint New Director' })).toBeVisible()
    await expect(manageParties.getByRole('heading', { name: 'Directors' })).toHaveClass(/sr-only/)
  })

  test('Should only open the address when changing an existing director address', async ({ page }) => {
    const subForm = await openEditOption(page, 'Change address')

    await expect(subForm.getByText('Delivery Address').first()).toBeVisible()
    // no name, role, effective date or cessation date sections
    await expect(subForm.getByTestId('form-group-first-name')).toHaveCount(0)
    await expect(subForm.locator('#party-role-form')).toHaveCount(0)
    await expect(subForm.getByText('Start Date')).toHaveCount(0)
    // the director's name stays in the first column while the form is open in the row
    await expect(page.getByTestId('inline-edit-subject')).toHaveText('TESTER TESTING')
  })

  test('Should only open the legal name, inline without a header card, when changing it', async ({ page }) => {
    const subForm = await openEditOption(page, 'Change legal name')

    await expect(subForm.getByTestId('form-group-first-name')).toBeVisible()
    await expect(subForm.getByText('Delivery Address')).toHaveCount(0)
    // the "Legal Name" legend is for screen readers only, so the fields start where the row's columns do
    await expect(subForm.locator('legend span', { hasText: 'Legal Name' }).first()).toHaveClass(/sr-only/)
    // inline edit: the "Changing ..." header is screen-reader only, no Delete button, Reset starts disabled
    await expect(subForm.locator('legend', { hasText: 'Changing TESTER TESTING' })).toHaveClass(/sr-only/)
    await expect(subForm.getByRole('button', { name: 'Delete' })).toHaveCount(0)
    await expect(subForm.getByRole('button', { name: 'Reset' })).toBeDisabled()
  })

  test('Should require the confirmation checkbox to change an existing director name', async ({ page }) => {
    const subForm = await openEditOption(page, 'Change legal name')
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

    // the id lands on the hidden input - target the checkbox by its accessible label instead
    await subForm.getByRole('checkbox', { name: /confirm this person legally changed their name/ }).check()
    await expect(subForm.getByText('Confirm the legal name change to continue')).toHaveCount(0)
    await subForm.getByRole('button', { name: 'Done' }).click()
    await expect(page.getByTestId('party-details-form')).toHaveCount(0)

    // the edit landed as a name change, shown with the former name under the new one
    const payload = page.getByTestId('relationships-payload')
    await expect(payload).toContainText('NAME_CHANGED')
    await expect(payload).toContainText('Newname')
    await expect(getFirstRow(page)).toContainText('(Formerly TESTER TESTING)')
  })

  test('Should reset the name to what the edit opened with', async ({ page }) => {
    const subForm = await openEditOption(page, 'Change legal name')
    const lastName = subForm.getByTestId('form-group-last-name').locator('input')
    const reset = subForm.getByRole('button', { name: 'Reset' })

    await lastName.fill('Newname')
    await expect(subForm.getByTestId('name-change-confirmation')).toBeVisible()
    await expect(reset).toBeEnabled()

    await reset.click()
    await expect(lastName).toHaveValue('Testing')
    await expect(subForm.getByTestId('name-change-confirmation')).toHaveCount(0)
    await expect(reset).toBeDisabled()
  })

  test('Should reset a re-opened name edit to the name on record, like the Vue 2 page', async ({ page }) => {
    let subForm = await openEditOption(page, 'Change legal name')
    await subForm.getByTestId('form-group-last-name').locator('input').fill('Newname')
    await subForm.getByRole('checkbox', { name: /confirm this person legally changed their name/ }).check()
    await subForm.getByRole('button', { name: 'Done' }).click()
    await expect(getFirstRow(page)).toContainText('NAME CHANGED')

    // Undo is now the main button, so the edit comes from the dropdown
    subForm = await openEditOption(page, 'Change legal name')
    const reset = subForm.getByRole('button', { name: 'Reset' })
    await expect(reset).toBeEnabled()
    await reset.click()
    await expect(subForm.getByTestId('form-group-last-name').locator('input')).toHaveValue('Testing')
    await expect(reset).toBeDisabled()
    await subForm.getByRole('button', { name: 'Done' }).click()

    // back to the name on record, so the row is no longer a change
    await expect(getFirstRow(page)).not.toContainText('NAME CHANGED')
    await expect(page.getByTestId('relationships-payload')).toHaveText('[]')
  })

  test('Should clear the confirmation checkbox when the name is reverted', async ({ page }) => {
    const subForm = await openEditOption(page, 'Change legal name')
    const lastName = subForm.getByTestId('form-group-last-name').locator('input')

    await lastName.fill('Newname')
    await expect(subForm.getByTestId('name-change-confirmation')).toBeVisible()

    await lastName.fill('Testing')
    await expect(subForm.getByTestId('name-change-confirmation')).toHaveCount(0)
  })

  test('Should show the date field and no confirmation checkbox when appointing a director', async ({ page }) => {
    await page.getByRole('button', { name: 'Appoint New Director' }).click()

    const subForm = page.getByTestId('party-details-form')
    await expect(subForm).toBeVisible()
    // appointed directors get the (required) appointment date field
    await expect(subForm.getByText('Effective Date').first()).toBeVisible()
    // and never the name-change confirmation
    const lastName = subForm.getByTestId('form-group-last-name').locator('input')
    await lastName.fill('Director')
    await expect(subForm.getByTestId('name-change-confirmation')).toHaveCount(0)
  })

  test('Should show the minimum director count warning without blocking', async ({ page }) => {
    // the 3 mock directors include a BC resident and are all Canadian, so with the min
    // count (3) met, no warning renders initially
    await expect(page.getByTestId('director-warning')).toHaveCount(0)

    // Cease is the row's main action
    await getFirstRow(page).getByRole('button', { name: 'Cease' }).click()

    // only 2 active directors remain - the min-count (3) warning fires reactively
    const warning = page.getByTestId('director-warning')
    await expect(warning).toBeVisible()
    await expect(warning).toContainText('at least 3 directors')

    // the warning is informational only - it does not block further edits
    await expect(page.getByRole('button', { name: 'Appoint New Director' })).toBeEnabled()
  })

  test('Should only include changed rows in the relationships payload', async ({ page }) => {
    const payload = page.getByTestId('relationships-payload')
    await expect(payload).toHaveText('[]')

    await getFirstRow(page).getByRole('button', { name: 'Cease' }).click()

    await expect(payload).toContainText('REMOVED')
    const parsed = JSON.parse((await payload.textContent()) ?? '[]')
    expect(parsed).toHaveLength(1)
    expect(parsed[0].roles[0].cessationDate).toBeTruthy()
  })
})
