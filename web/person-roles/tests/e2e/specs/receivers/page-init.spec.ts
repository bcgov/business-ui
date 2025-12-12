import { test, expect } from '@playwright/test'
import { ReceiverType } from '#business/app/enums/receiver-type'
import { mockApiCallsForFiling, navigateToManageReceiversPage } from '../../test-utils'

const identifier = 'BC1234567'

test.describe('Manage Receivers - Page init', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiCallsForFiling(page, identifier, 'Receiver')
    await navigateToManageReceiversPage(page, ReceiverType.APPOINT)
    await page.waitForLoadState('networkidle')
  })

  test.describe('Basic initialization', () => {
    test('should display basic filing elements', async ({ page }) => {
      // has auth header
      expect(page.getByTestId('connect-header-wrapper')).toBeVisible()
      // has breadcrumb
      expect(page.getByTestId('connect-breadcrumb-wrapper')).toBeVisible()
      expect(page.getByTestId('connect-breadcrumb-wrapper').getByText(
        'Appoint Receivers or Receiver Managers')).toBeVisible()
      // has tombstone
      expect(page.getByTestId('connect-tombstone-wrapper')).toBeVisible()
      expect(page.getByTestId('connect-tombstone-wrapper')
        .getByText('MCELROY ENTERPRISES LTD. - QA_IMPORT_TEST')
      ).toBeVisible()
      // has manage receiver title
      expect(page.getByRole('heading', { name: 'Appoint Receivers or Receiver Managers' })).toBeVisible()
      // has existing receivers in receiver table (should have 3)
      const existingReceivers = await page.getByRole('table').locator('tbody').getByRole('row').all()
      expect(existingReceivers.length).toBe(3)
      // has fee summary
      expect(page.getByTestId('fee-widget')).toBeVisible()
      // has buttons
      expect(page.getByTestId('connect-button-control-wrapper')).toBeVisible()
      // has footer
      expect(page.getByTestId('connect-main-footer')).toBeVisible()
    })
  })
})
