import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

test.describe('ManageCourtOrders', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./en-CA/examples/components/Manage/CourtOrders')
    await page.waitForLoadState('networkidle')
    // the example page loads its mock data after a delay
    await expect(firstRow(page).getByRole('button', { name: 'Change' })).toBeVisible()
  })

  function firstRow(page: Page) {
    return page.getByRole('table').locator('tbody').getByRole('row').first()
  }

  async function openFirstRowEdit(page: Page) {
    await firstRow(page).getByRole('button', { name: 'Change' }).click()
    const subForm = page.getByTestId('change-court-order-poa-form')
    await expect(subForm).toBeVisible()
    return subForm
  }

  test('Should not mark a row as changed when done without any edits', async ({ page }) => {
    const subForm = await openFirstRowEdit(page)
    await subForm.getByRole('button', { name: 'Done' }).click()

    await expect(subForm).toBeHidden()
    await expect(firstRow(page).getByText('CHANGED', { exact: true })).toBeHidden()
  })

  test('Should mark a row as changed after an edit and restore it on undo', async ({ page }) => {
    const original = await firstRow(page).textContent()
    const subForm = await openFirstRowEdit(page)
    await subForm.getByTestId('court-order-number-input').fill('CHANGED123')
    await subForm.getByRole('button', { name: 'Done' }).click()

    await expect(subForm).toBeHidden()
    await expect(firstRow(page)).toContainText('CHANGED123')
    await expect(firstRow(page).getByText('CHANGED', { exact: true })).toBeVisible()

    await firstRow(page).getByRole('button', { name: 'Undo' }).click()
    await expect(firstRow(page).getByText('CHANGED', { exact: true })).toBeHidden()
    await expect(firstRow(page)).toHaveText(original!)
  })

  test('Should keep a row\'s original values when editing it again after an undo', async ({ page }) => {
    const subForm = await openFirstRowEdit(page)
    await subForm.getByTestId('court-order-number-input').fill('CHANGED123')
    await subForm.getByRole('button', { name: 'Done' }).click()
    await firstRow(page).getByRole('button', { name: 'Undo' }).click()

    const reopened = await openFirstRowEdit(page)
    await reopened.getByRole('button', { name: 'Done' }).click()

    await expect(reopened).toBeHidden()
    await expect(firstRow(page).getByText('CHANGED', { exact: true })).toBeHidden()
  })

  test('Should add a new court order', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Court Order' }).click()
    const subForm = page.getByTestId('add-court-order-poa-form')
    await expect(subForm).toBeVisible()

    await subForm.getByTestId('court-order-number-input').fill('NEW12345')
    await subForm.getByRole('button', { name: 'Done' }).click()

    await expect(subForm).toBeHidden()
    const addedRow = page.getByRole('row').filter({ hasText: 'NEW12345' })
    await expect(addedRow.getByText('ADDED', { exact: true })).toBeVisible()
  })

  test('Should show a validation error and keep the form open', async ({ page }) => {
    const subForm = await openFirstRowEdit(page)
    await subForm.getByTestId('court-order-number-input').fill('123')
    await subForm.getByRole('button', { name: 'Done' }).click()

    await expect(subForm.getByText('Minimum 5 characters')).toBeVisible()
    await expect(subForm).toBeVisible()
  })

  test('Should prompt to finish the open form before starting another action', async ({ page }) => {
    const subForm = await openFirstRowEdit(page)

    await page.getByRole('button', { name: 'Add Court Order' }).click()

    await expect(subForm.getByText('Finish this task before making other changes')).toBeVisible()
    await expect(page.getByTestId('add-court-order-poa-form')).toBeHidden()
  })
})
