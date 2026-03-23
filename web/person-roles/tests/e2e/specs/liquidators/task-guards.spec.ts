import { test, expect } from '@playwright/test'
import { navigateToManageLiquidatorsPage } from '../../test-utils'
import { LiquidateType } from '#business/app/enums/liquidate-type'
import { getPartiesMock, getBusinessAddressesMock, mockCommonApiCallsForFiling } from '#test-mocks'

const identifier = 'BC1234567'

test.describe('Task Guards', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2025-12-30'))

    await mockCommonApiCallsForFiling(
      page,
      identifier,
      getPartiesMock([
        { index: 0, key: 'roleType', value: 'Liquidator' },
        { index: 1, key: 'roleType', value: 'Liquidator' },
        { index: 2, key: 'roleType', value: 'Liquidator' }
      ]),
      undefined,
      getBusinessAddressesMock()
    )

    await navigateToManageLiquidatorsPage(page, LiquidateType.ADDRESS)
  })

  test('should prevent save/submit when no changes have been made to liquidators or offices', async ({ page }) => {
    // select no fee to satisfy formState validation
    const staffNoFeeRadio = page.getByRole('radio', { name: 'No Fee' })
    expect(staffNoFeeRadio).toBeVisible()
    await staffNoFeeRadio.click()

    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(page.getByTestId('right-buttons')).toContainText('There are no changes to submit')

    await page.getByRole('button', { name: 'Save and Resume Later' }).click()
    await expect(page.getByTestId('left-buttons')).toContainText('There are no changes to save')
  })

  test('should prevent save/submit when liquidator or office sub form open', async ({ page }) => {
    // select no fee to satisfy formState validation
    const staffNoFeeRadio = page.getByRole('radio', { name: 'No Fee' })
    expect(staffNoFeeRadio).toBeVisible()
    await staffNoFeeRadio.click()

    const liqSection = page.getByTestId('liquidator-info-section')
    const officeSection = page.getByTestId('records-office-section')
    const submitBtn = page.getByRole('button', { name: 'Submit' })
    const saveBtn = page.getByRole('button', { name: 'Save and Resume Later' })
    const liqSubForm = page.getByRole('group', { name: 'Editing TESTER TESTING' })
    const officeSubForm = page.getByRole('group', { name: 'Editing Liquidation Records Office' })
    const taskMessage = 'Finish this task before making other changes.'

    // open liquidator sub form
    await liqSection.getByRole('button', { name: 'Change' }).first().click()
    // try to submit
    await submitBtn.click()
    // assert task message
    await expect(liqSubForm).toContainText(taskMessage)
    // close sub form
    await liqSubForm.getByRole('button', { name: 'Cancel' }).first().click()
    // reopen sub form
    await liqSection.getByRole('button', { name: 'Change' }).first().click()
    // try to save
    await saveBtn.click()
    // assert task message
    await expect(liqSubForm).toContainText(taskMessage)
    // close sub form
    await liqSubForm.getByRole('button', { name: 'Cancel' }).first().click()

    // open office sub form
    await officeSection.getByRole('button', { name: 'Change' }).first().click()
    // try to submit
    await submitBtn.click()
    // assert task message
    await expect(officeSubForm).toContainText(taskMessage)
    // close sub form
    await officeSubForm.getByRole('button', { name: 'Cancel' }).first().click()
    // reopen office sub form
    await officeSection.getByRole('button', { name: 'Change' }).first().click()
    // try to save
    await saveBtn.click()
    // assert task message
    await expect(officeSubForm).toContainText(taskMessage)
    // close sub form
    await officeSubForm.getByRole('button', { name: 'Cancel' }).first().click()
  })

  test('should be able to cancel when no changes have been made', async ({ page }) => {
    await page.getByRole('button', { name: 'Cancel', exact: true }).click()
    // should be redirected to dashboard page
    await expect(page).not.toHaveURL(/.*manage-liquidators.*/)
    expect(page.getByText('Redirected to playwright mocked business dashboard')).toBeVisible()
  })

  test('should display modal on cancel when changes have been made', async ({ page }) => {
    await expect(page.getByTestId('liquidator-info-section')).toContainText('TESTER TESTING')

    const staffNoFeeRadio = page.getByRole('radio', { name: 'No Fee' })
    expect(staffNoFeeRadio).toBeVisible()
    await staffNoFeeRadio.click()
    await expect(staffNoFeeRadio).toBeChecked()

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
    await expect(page.getByTestId('liquidator-info-section')).toContainText('TESTER TESTING')

    const staffNoFeeRadio = page.getByRole('radio', { name: 'No Fee' })
    expect(staffNoFeeRadio).toBeVisible()
    await staffNoFeeRadio.click()
    await expect(staffNoFeeRadio).toBeChecked()

    // https://playwright.dev/docs/dialogs#beforeunload-dialog
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('beforeunload')
      await page.waitForTimeout(1000)
      await dialog.dismiss()
    })

    // Try to navigate away with unsaved changes
    await page.getByRole('link', { name: 'MCELROY ENTERPRISES LTD. -' }).click({ delay: 500 })
    // should still be on manage-liquidators page due to browser dialog
    await expect(page).toHaveURL(/.*manage-liquidators.*/)
  })
})
