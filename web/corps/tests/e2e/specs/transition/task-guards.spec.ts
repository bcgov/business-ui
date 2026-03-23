import { test, expect } from '@playwright/test'
import { navigateToTransitionPage } from '../../test-utils'
import {
  mockCommonApiCallsForFiling,
  getBusinessAddressesMock,
  getPartiesMock
} from '#test-mocks'
import { TRANP } from '~~/tests/mocks'

const identifier = 'BC1234567'

test.describe('Task Guards', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2025-12-30'))

    await mockCommonApiCallsForFiling(
      page,
      identifier,
      getPartiesMock([
        { index: 0, key: 'roleType', value: 'Director' },
        { index: 1, key: 'roleType', value: 'Director' },
        { index: 2, key: 'roleType', value: 'Director' }
      ]),
      TRANP,
      getBusinessAddressesMock(),
      'STAFF',
      { shareClasses: [] }
    )
    await navigateToTransitionPage(page, identifier)
    await page.waitForLoadState('networkidle')
  })

  test('should prevent save when no changes have been made', async ({ page }) => {
    await page.getByRole('button', { name: 'Save and Resume Later' }).click()
    await expect(page.getByTestId('right-buttons')).toContainText('There are no changes to save.')
  })

  test('should prevent save/review and confirm when share class sub form open', async ({ page }) => {
    // confirm directors and offices to satisfy step 1 form validation
    await page.getByRole('checkbox', {
      name: 'I confirm that the office address information listed for this business is correct.'
    }).check()
    await page.getByRole('checkbox', {
      name: 'I confirm that the director information listed for this business is correct.'
    }).check()

    const subForm = page.getByTestId('add-share-class-form')
    const addClassBtn = page.getByRole('button', { name: 'Add Share Class' })
    const saveBtn = page.getByRole('button', { name: 'Save and Resume Later' })
    const reviewButton = page.getByRole('button', { name: 'Review and Confirm' })
    const taskMessage = 'Finish this task before making other changes.'

    // try to save with sub form open
    await addClassBtn.click()
    await expect(subForm).toBeVisible()
    await saveBtn.click()
    await expect(subForm).toContainText(taskMessage)
    await subForm.getByRole('button', { name: 'Cancel' }).click()
    await expect(subForm).not.toBeVisible()

    // try to go to review page with sub form open
    await addClassBtn.click()
    await expect(subForm).toBeVisible()
    await reviewButton.click()
    await expect(subForm).toContainText(taskMessage)
    await subForm.getByRole('button', { name: 'Cancel' }).click()
    await expect(subForm).not.toBeVisible()
  })

  test('should prevent review and confirm with empty share structure', async ({ page }) => {
    // confirm directors and offices to satisfy step 1 form validation
    await page.getByRole('checkbox', {
      name: 'I confirm that the office address information listed for this business is correct.'
    }).check()
    await page.getByRole('checkbox', {
      name: 'I confirm that the director information listed for this business is correct.'
    }).check()

    const reviewButton = page.getByRole('button', { name: 'Review and Confirm' })

    // try to go to review with empty share structure
    await reviewButton.click()
    await expect(page.getByTestId('share-structure-section'))
      .toContainText('Your share structure must contain at least one share class.')
  })

  test('should be able to cancel when no changes have been made', async ({ page }) => {
    await page.getByRole('button', { name: 'Cancel', exact: true }).click()
    // should be redirected to dashboard page
    await expect(page).not.toHaveURL(/.*transition.*/)
    expect(page.getByText('Redirected to playwright mocked business dashboard')).toBeVisible()
  })

  test('should be able to navigate away when no changes have been made', async ({ page }) => {
    await expect(page.getByTestId('office-addresses-section')).toContainText('Registered Office')

    // navigate away with making no changes
    await page.getByRole('link', { name: 'MCELROY ENTERPRISES LTD. -' }).click({ delay: 500 })

    // should be redirected to dashboard page
    await expect(page).not.toHaveURL(/.*transition.*/)
    expect(page.getByText('Redirected to playwright mocked business dashboard')).toBeVisible()
  })

  test('should display modal on cancel when changes have been made', async ({ page }) => {
    const subForm = page.getByTestId('add-share-class-form')
    const addClassBtn = page.getByRole('button', { name: 'Add Share Class' })

    // fill minimum share class info
    await addClassBtn.click()
    await expect(subForm).toBeVisible()
    await subForm.getByTestId('share-class-name-input').fill('Test1')
    await subForm.getByRole('radio', { name: 'No Maximum' }).click()
    await subForm.getByRole('radio', { name: 'No Par Value' }).click()
    await subForm.getByRole('button', { name: 'Done' }).click()
    await expect(subForm).not.toBeVisible()

    await page.getByRole('button', { name: 'Cancel', exact: true }).click({ delay: 500 })

    // should have a modal asking to confirm cancelling
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expect(modal).toContainText('Unsaved changes')
    await expect(modal)
      .toContainText('You have unsaved changes. Are you sure you want to exit your filing?')
    await expect(page).not.toHaveURL(/.*business-dashboard.*/)
  })

  test('should prevent navigation with browser popup if changes have been made', async ({ page }) => {
    const subForm = page.getByTestId('add-share-class-form')
    const addClassBtn = page.getByRole('button', { name: 'Add Share Class' })

    // fill minimum share class info
    await addClassBtn.click()
    await expect(subForm).toBeVisible()
    await subForm.getByTestId('share-class-name-input').fill('Test1')
    await subForm.getByRole('radio', { name: 'No Maximum' }).click()
    await subForm.getByRole('radio', { name: 'No Par Value' }).click()
    await subForm.getByRole('button', { name: 'Done' }).click()
    await expect(subForm).not.toBeVisible()

    // https://playwright.dev/docs/dialogs#beforeunload-dialog
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('beforeunload')
      await page.waitForTimeout(1000)
      await dialog.dismiss()
    })

    // Try to navigate away with unsaved changes
    await page.getByRole('link', { name: 'MCELROY ENTERPRISES LTD. -' }).click({ delay: 500 })
    // should still be on transition page due to browser dialog
    await expect(page).toHaveURL(/.*transition.*/)
  })
})
