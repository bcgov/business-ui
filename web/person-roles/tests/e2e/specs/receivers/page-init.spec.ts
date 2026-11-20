import { test, expect } from '@playwright/test'
import { ReceiverType } from '#business/app/enums/receiver-type'
import { mockCommonApiCallsForFiling, getPartiesMock } from '#test-mocks'
import { navigateToManageReceiversPage } from '../../test-utils'

const identifier = 'BC1234567'

test.describe('Manage Receivers - Page init', () => {
  test.beforeEach(async ({ page }) => {
    await mockCommonApiCallsForFiling(
      page,
      identifier,
      getPartiesMock([
        { index: 0, key: 'roleType', value: 'Receiver' },
        { index: 1, key: 'roleType', value: 'Receiver' },
        { index: 2, key: 'roleType', value: 'Receiver' }
      ]),
      undefined,
      undefined
    )
    await navigateToManageReceiversPage(page, ReceiverType.APPOINT)
    await page.waitForLoadState('networkidle')
  })

  test.describe('Basic initialization', () => {
    test('should display basic filing elements', async ({ page }) => {
      // has auth header
      await expect(page.getByTestId('connect-header-wrapper')).toBeVisible()
      // has breadcrumb
      await expect(page.getByTestId('connect-breadcrumb-wrapper')).toBeVisible()
      await expect(page.getByTestId('connect-breadcrumb-wrapper').getByText(
        'Appoint Receivers or Receiver Managers')).toBeVisible()
      // has tombstone
      await expect(page.getByTestId('connect-tombstone-wrapper')).toBeVisible()
      await expect(page.getByTestId('connect-tombstone-wrapper')
        .getByText('MCELROY ENTERPRISES LTD. - QA_IMPORT_TEST')
      ).toBeVisible()
      // has manage receiver title
      await expect(page.getByRole('heading', { name: 'Appoint Receivers or Receiver Managers' })).toBeVisible()
      // has existing receivers in receiver table (should have 3)
      const existingReceivers = await page.getByRole('table').locator('tbody').getByRole('row').all()
      expect(existingReceivers.length).toBe(3)
      // has fee summary
      await expect(page.getByTestId('fee-widget')).toBeVisible()
      // has buttons
      await expect(page.getByTestId('connect-button-control-wrapper')).toBeVisible()
      // has footer
      await expect(page.getByTestId('connect-main-footer')).toBeVisible()
    })
  })
})
