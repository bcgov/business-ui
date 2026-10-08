import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { pickJurisdiction } from '#business/tests/e2e/test-utils'

async function navigateToManageAmalgamationCorrectPage(page: Page) {
  await page.goto('./en-CA/examples/components/ManageAmalgamation/Correct')
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('heading', { name: 'Amalgamation' })).toBeVisible()
  // the page seeds table rows from the mock after a simulated 1500ms load delay
  await expect(page.getByText('ALBANIA CORP').first()).toBeVisible({ timeout: 15000 })
}

// Scoped by identifier, not legal name - an expanded row's "Correcting <legal name>" header
// lives in a sibling <tr> and would also match a legal-name text filter.
function getRowByIdentifier(page: Page, identifier: string) {
  return page.getByRole('table').locator('tbody').getByRole('row').filter({
    has: page.locator('td:first-child', { hasText: identifier })
  })
}

test.describe('ManageAmalgamation Correct - jurisdiction', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToManageAmalgamationCorrectPage(page)
  })

  test('opens an ex-BC row edit form with the home jurisdiction combobox', async ({ page }) => {
    const row = getRowByIdentifier(page, 'AL12345')
    await row.getByRole('button', { name: 'Correct' }).click()

    const form = page.getByTestId('correct-amalgamation-correct-form')
    await expect(form).toBeVisible()
    await expect(form.getByRole('combobox', { name: 'Select Home Jurisdiction' })).toBeVisible()
  })

  test('changes the jurisdiction and shows the corrected badge', async ({ page }) => {
    const row = getRowByIdentifier(page, 'AL12345')
    await row.getByRole('button', { name: 'Correct' }).click()

    const form = page.getByTestId('correct-amalgamation-correct-form')
    const combobox = form.getByRole('combobox', { name: 'Select Home Jurisdiction' })
    await pickJurisdiction(page, combobox, 'Manitoba, Canada')
    await form.getByRole('button', { name: 'Done' }).click()

    await expect(form).not.toBeVisible()
    await expect(row.getByRole('cell').nth(2)).toContainText('Manitoba, Canada')
    await expect(row.getByRole('cell').first()).toContainText('CORRECTED')
  })

  // Add isn't allowed in this playground variant (allowedActions defaults to CHANGE only),
  // and the combined combobox can't clear an existing selection, so the required-jurisdiction
  // error path isn't reachable here.
})
