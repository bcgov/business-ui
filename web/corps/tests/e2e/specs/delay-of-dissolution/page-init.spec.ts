import { test, expect } from '@playwright/test'
import { navigateToDodPage } from '../../test-utils'
import { mockCommonApiCallsForFiling } from '#test-mocks'
import { DISDE } from '~~/tests/mocks'

const identifier = 'BC1234567'

test.describe('Delay of Dissolution - Page init', () => {
  test.describe('Basic initialization', () => {
    const testCases = [
      {
        testName: 'Non-staff',
        isStaff: false
      },
      {
        testName: 'Staff-default',
        isStaff: true
      }
    ]
    testCases.forEach(({ testName, isStaff }) => {
      test(testName, async ({ page }) => {
        mockCommonApiCallsForFiling(page, identifier, undefined, DISDE, undefined, isStaff ? 'STAFF' : 'PREMIUM')
        await navigateToDodPage(page, identifier)
        await page.waitForLoadState('networkidle')
        await expect(page.getByRole('heading', { name: 'Delay of Dissolution or Cancellation' }))
          .toBeVisible({ timeout: 10000 })
        // has auth header
        await expect(page.getByTestId('connect-header-wrapper')).toBeVisible()
        // has breadcrumb
        await expect(page.getByTestId('connect-breadcrumb-wrapper')).toBeVisible()
        await expect(page.getByTestId('connect-breadcrumb-wrapper').getByText(
          'Delay of Dissolution or Cancellation')).toBeVisible()
        // has tombstone
        await expect(page.getByTestId('connect-tombstone-wrapper')).toBeVisible()
        await expect(page.getByTestId('connect-tombstone-wrapper')
          .getByText('MCELROY ENTERPRISES LTD. - QA_IMPORT_TEST')
        ).toBeVisible()
        // has dissolution heading
        await expect(page.getByRole('heading', { name: 'Delay of Dissolution or Cancellation' })).toBeVisible()
        // has delay date section
        const delayDateSection = page.getByTestId('form-section-delay-date')
        const dateSelectionRadio = delayDateSection.getByRole('radio', { name: 'Select a date' })
        const dateSelectionInput = delayDateSection.getByTestId('delay-date-input')
        const dateSelectionInfo = delayDateSection.getByTestId('expected-dissolution-date-info')
        await expect(delayDateSection).toBeVisible()
        if (isStaff) {
          await expect(dateSelectionRadio).toBeVisible()
          await expect(dateSelectionInput).toBeVisible()
          await expect(dateSelectionInfo).toBeVisible()
          await expect(dateSelectionInfo).toContainText('October 4, 2026')
        } else {
          await expect(dateSelectionRadio).not.toBeVisible()
          await expect(dateSelectionInput).not.toBeVisible()
          await expect(dateSelectionInfo).not.toBeVisible()
        }
        // has folio number section
        await expect(page.getByTestId('form-section-folio-number')).toBeVisible()
        // certify section
        if (isStaff) {
          await expect(page.getByTestId('form-section-certify')).not.toBeVisible()
        } else {
          await expect(page.getByTestId('form-section-certify')).toBeVisible()
        }
        // has fee summary
        await expect(page.getByTestId('fee-widget')).toBeVisible()
        // has fee summary text
        await expect(page.getByTestId('fee-widget').getByText('Delay of Dissolution')).toBeVisible()
        await expect(page.getByTestId('fee-widget').getByText('No Fee')).toBeVisible()
        // has buttons
        await expect(page.getByTestId('connect-button-control-wrapper')).toBeVisible()
        // has footer
        await expect(page.getByTestId('connect-main-footer')).toBeVisible()
      })
    })
  })
})
