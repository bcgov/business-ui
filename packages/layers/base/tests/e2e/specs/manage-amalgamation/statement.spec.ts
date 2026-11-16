import { test, expect } from '@playwright/test'

test.describe('ManageAmalgamation Correct - statement and task guards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./en-CA/examples/components/Manage/Amalgamation/Correct')
    await page.waitForLoadState('networkidle')
    // the page seeds table rows from the mock after a simulated 1500ms load delay
    await expect(page.getByText('ALBANIA CORP').first()).toBeVisible({ timeout: 15000 })
  })

  test('marks the statement as corrected and restores it on undo', async ({ page }) => {
    const section = page.getByTestId('manage-amalgamation')
    const form = page.getByTestId('correct-amalgamation-correct-statement-form')
    const statementText = section.getByText(/^With(out)? Court Approval$/).last()
    const original = await statementText.textContent()

    await section.getByRole('button', { name: 'Correct' }).last().click()
    await expect(form).toBeVisible()
    const other = original === 'With Court Approval' ? 'Without Court Approval' : 'With Court Approval'
    await form.getByText(other, { exact: true }).click()
    await form.getByRole('button', { name: 'Done' }).click()

    await expect(form).toBeHidden()
    await expect(section.getByText(other, { exact: true })).toBeVisible()
    await expect(section.getByText('CORRECTED', { exact: true })).toBeVisible()

    await section.getByRole('button', { name: 'Undo' }).click()
    await expect(section.getByText(original!, { exact: true })).toBeVisible()
    await expect(section.getByText('CORRECTED', { exact: true })).toBeHidden()
  })

  test('shows the task guard alert on the open row when the statement action is prevented', async ({ page }) => {
    const section = page.getByTestId('manage-amalgamation')
    await section.getByRole('button', { name: 'Correct' }).first().click()
    const form = page.getByTestId('correct-amalgamation-correct-form')
    await expect(form).toBeVisible()

    await section.getByRole('button', { name: 'Correct' }).last().click()

    await expect(form.getByText('Finish this task before making other changes.')).toBeVisible()
    await expect(page.getByTestId('correct-amalgamation-correct-statement-form')).toBeHidden()
  })
})
