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
        expect(page.getByRole('heading', { name: 'Delay of Dissolution or Cancellation' }))
          .toBeVisible({ timeout: 10000 })
        // has auth header
        expect(page.getByTestId('connect-header-wrapper')).toBeVisible()
        // has breadcrumb
        expect(page.getByTestId('connect-breadcrumb-wrapper')).toBeVisible()
        expect(page.getByTestId('connect-breadcrumb-wrapper').getByText(
          'Delay of Dissolution or Cancellation')).toBeVisible()
        // has tombstone
        expect(page.getByTestId('connect-tombstone-wrapper')).toBeVisible()
        expect(page.getByTestId('connect-tombstone-wrapper')
          .getByText('MCELROY ENTERPRISES LTD. - QA_IMPORT_TEST')
        ).toBeVisible()
        // has dissolution heading
        expect(page.getByRole('heading', { name: 'Delay of Dissolution or Cancellation' })).toBeVisible()
        // has delay date section
        const delayDateSection = page.getByTestId('form-section-delay-date')
        const dateSelectionRadio = delayDateSection.getByRole('radio', { name: 'Select a date' })
        const dateSelectionInput = delayDateSection.getByTestId('delay-date-input')
        expect(delayDateSection).toBeVisible()
        if (isStaff) {
          expect(dateSelectionRadio).toBeVisible()
          expect(dateSelectionInput).toBeVisible()
        } else {
          expect(dateSelectionRadio).not.toBeVisible()
          expect(dateSelectionInput).not.toBeVisible()
        }
        expect(delayDateSection.getByTestId('expected-dissolution-date-info')).toContainText('October 4, 2026')
        // has folio number section
        expect(page.getByTestId('form-section-folio-number')).toBeVisible()
        // certify section
        if (isStaff) {
          expect(page.getByTestId('form-section-certify')).not.toBeVisible()
        } else {
          expect(page.getByTestId('form-section-certify')).toBeVisible()
        }
        // has fee summary
        expect(page.getByTestId('fee-widget')).toBeVisible()
        // has fee summary text
        expect(page.getByTestId('fee-widget').getByText('Delay of Dissolution')).toBeVisible()
        expect(page.getByTestId('fee-widget').getByText('No Fee')).toBeVisible()
        // has buttons
        expect(page.getByTestId('connect-button-control-wrapper')).toBeVisible()
        // has footer
        expect(page.getByTestId('connect-main-footer')).toBeVisible()
      })
    })
  })
})
