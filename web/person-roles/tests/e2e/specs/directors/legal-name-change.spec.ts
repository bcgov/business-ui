import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { NOCOI, tasksBC1234567, partiesDirectorsBC1234567 } from '~~/tests/mocks'
import { mockCommonApiCallsForFiling } from '#test-mocks'

const identifier = 'BC1234567'

async function setupDirectorChangePage(page: Page) {
  await mockCommonApiCallsForFiling(page, identifier, partiesDirectorsBC1234567, NOCOI, undefined)
  await page.route(`*/**/businesses/${identifier}/tasks`, async (route) => {
    await route.fulfill({ json: tasksBC1234567 })
  })
  await page.goto(`./en-CA/manage-directors/${identifier}`)
  await expect(page.getByRole('heading', { name: 'Director Change' }).first()).toBeVisible()
  await page.waitForLoadState('networkidle')
}

function getFirstRow(page: Page) {
  return page.getByTestId('manage-directors').getByRole('table').locator('tbody').getByRole('row').first()
}

async function openEditOption(page: Page, option: 'Change address' | 'Change legal name') {
  await getFirstRow(page).getByRole('button', { name: 'More Actions' }).click()
  await page.getByRole('menuitem', { name: option }).click()
  const subForm = page.getByTestId('party-details-form')
  await expect(subForm).toBeVisible()
  return subForm
}

test.describe('Director Change - legal name change', () => {
  test.beforeEach(async ({ page }) => {
    await setupDirectorChangePage(page)
    await expect(getFirstRow(page)).toContainText('VIVIAN SMITH')
  })

  test('requires the confirmation checkbox before a changed name is accepted', async ({ page }) => {
    const subForm = await openEditOption(page, 'Change legal name')
    await expect(subForm.getByTestId('name-change-confirmation')).toHaveCount(0)

    await subForm.getByTestId('form-group-last-name').locator('input').fill('Watson')
    const confirmation = subForm.getByTestId('name-change-confirmation')
    await expect(confirmation).toBeVisible()
    await expect(confirmation.getByRole('link', { name: /Register Correction Form/ })).toBeVisible()

    await subForm.getByRole('button', { name: 'Done' }).click()
    await expect(subForm.getByText('Confirm the legal name change to continue').first()).toBeVisible()
    await expect(subForm).toBeVisible()

    await subForm.getByRole('checkbox', { name: /confirm this person legally changed their name/ }).check()
    await subForm.getByRole('button', { name: 'Done' }).click()
    await expect(subForm).not.toBeVisible()
    await expect(getFirstRow(page)).toContainText('VIVIAN WATSON')
    await expect(getFirstRow(page)).toContainText('NAME CHANGED')
  })

  test('blocks submitting while a director sub form is open', async ({ page }) => {
    const subForm = await openEditOption(page, 'Change address')
    // the page form validates before the submit guard runs, so satisfy the authorization first
    await page.getByRole('checkbox', { name: /I confirm that the information provided is correct/ }).check()

    await page.getByRole('button', { name: 'Submit' }).click()

    await expect(subForm).toContainText('Finish this task before making other changes.')
    await expect(subForm).toBeVisible()
  })

  test('blocks saving a draft while a director sub form is open', async ({ page }) => {
    const subForm = await openEditOption(page, 'Change address')

    await page.getByRole('button', { name: 'Save and Resume Later', exact: true }).click()

    await expect(subForm).toContainText('Finish this task before making other changes.')
    await expect(subForm).toBeVisible()
  })
})
