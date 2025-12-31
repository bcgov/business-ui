import { test, expect } from '@playwright/test'
import { LiquidateType } from '#business/app/enums/liquidate-type'
import { mockCommonApiCallsForFiling, getPartiesMock } from '#test-mocks'
import { navigateToManageLiquidatorsPage } from '../../test-utils'

const identifier = 'BC1234567'

const testCases = [
  {
    type: LiquidateType.INTENT,
    h1: 'Intent to Liquidate'
  },
  {
    type: LiquidateType.APPOINT,
    h1: 'Appoint Liquidators'
  },
  {
    type: LiquidateType.CEASE,
    h1: 'Cease Liquidators'
  },
  {
    type: LiquidateType.ADDRESS,
    h1: 'Change Addresses of Liquidators'
  }
]

test.describe('Manage Liquidators - Page init', () => {
  test.beforeEach(async ({ page }) => {
    await mockCommonApiCallsForFiling(
      page,
      identifier,
      getPartiesMock([
        { index: 0, key: 'roleType', value: 'Liquidator' },
        { index: 1, key: 'roleType', value: 'Liquidator' },
        { index: 2, key: 'roleType', value: 'Liquidator' }
      ]),
      undefined
    )
  })

  testCases.forEach(({ type, h1 }) => {
    test(`Basic initialization - ${type}`, async ({ page }) => {
      await navigateToManageLiquidatorsPage(page, type)
      await page.waitForLoadState('networkidle')

      // has auth header
      expect(page.getByTestId('connect-header-wrapper')).toBeVisible()
      // has breadcrumb
      expect(page.getByTestId('connect-breadcrumb-wrapper')).toBeVisible()
      expect(page.getByTestId('connect-breadcrumb-wrapper').getByText(h1)).toBeVisible()
      // has tombstone
      expect(page.getByTestId('connect-tombstone-wrapper')).toBeVisible()
      expect(page.getByTestId('connect-tombstone-wrapper')
        .getByText('MCELROY ENTERPRISES LTD. - QA_IMPORT_TEST')
      ).toBeVisible()
      // has correct h1
      expect(page.getByRole('heading', { name: h1 })).toBeVisible()
      // has fee summary
      expect(page.getByTestId('fee-widget')).toBeVisible()
      // has buttons
      expect(page.getByTestId('connect-button-control-wrapper')).toBeVisible()
      // has footer
      expect(page.getByTestId('connect-main-footer')).toBeVisible()
      // has form elemenets
      expect(page.getByTestId('liquidator-info-section')).toBeVisible()
      expect(page.getByTestId('court-order-section')).toBeVisible()
      expect(page.getByTestId('document-id-section')).toBeVisible()
      expect(page.getByTestId('staff-payment-section')).toBeVisible()
      if (type === LiquidateType.INTENT) {
        expect(page.getByTestId('records-office-section')).toBeVisible()
      } else {
        expect(page.getByTestId('records-office-section')).not.toBeVisible()
      }
    })
  })
})
