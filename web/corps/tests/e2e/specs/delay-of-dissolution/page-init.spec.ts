import { test, expect } from '@playwright/test'
import { navigateToDodPage } from '../../test-utils'
import { mockCommonApiCallsForFiling } from '#test-mocks'
import { DISDE } from '~~/tests/mocks'

const identifier = 'BC1234567'

test.describe('Delay of Dissolution - Page init', () => {
  test.beforeEach(async ({ page }) => {
    await mockCommonApiCallsForFiling(page, identifier, undefined, DISDE, undefined)
    await navigateToDodPage(page, identifier)
    await page.waitForLoadState('networkidle')
  })

  test.describe('Basic initialization', () => {
    test('should display basic filing elements NON-STAFF ONLY', async ({ page }) => {
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
      expect(page.getByTestId('form-section-delay-date')).toBeVisible()
      // has folio number section
      expect(page.getByTestId('form-section-folio-number')).toBeVisible()
      // has certify section
      expect(page.getByTestId('form-section-certify')).toBeVisible()
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
