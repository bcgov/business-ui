import { test, expect } from '@playwright/test'
import { LiquidateType } from '#business/app/enums/liquidate-type'
import { mockCommonApiCallsForFiling, getPartiesMock, getBusinessAddressesMock } from '#test-mocks'
import { navigateToManageLiquidatorsPage } from '../../test-utils'

const identifier = 'BC1234567'

const testCases = [
  {
    testName: 'intent',
    type: LiquidateType.INTENT,
    h1: 'Intent to Liquidate',
    inLiquidation: false
  },
  {
    testName: 'appoint - not in liquidation',
    type: LiquidateType.APPOINT,
    h1: 'Appoint Liquidators',
    inLiquidation: false
  },
  {
    testName: 'appoint - already in liquidation',
    type: LiquidateType.APPOINT,
    h1: 'Appoint Liquidators',
    inLiquidation: true
  },
  {
    testName: 'cease',
    type: LiquidateType.CEASE,
    h1: 'Cease Liquidators',
    inLiquidation: true
  },
  {
    testName: 'address',
    type: LiquidateType.ADDRESS,
    h1: 'Change Addresses of Liquidators',
    inLiquidation: true
  },
  {
    testName: 'report',
    type: LiquidateType.REPORT,
    h1: 'Liquidation Report',
    inLiquidation: true
  }
]

testCases.forEach(({ testName, type, h1, inLiquidation }) => {
  test.describe(`Manage Liquidators - Page init ${testName}`, () => {
    test.beforeEach(async ({ page }) => {
      const partiesMock = inLiquidation
        ? getPartiesMock([
          { index: 0, key: 'roleType', value: 'Liquidator' },
          { index: 1, key: 'roleType', value: 'Liquidator' },
          { index: 2, key: 'roleType', value: 'Liquidator' }])
        : { parties: [] }

      const officesMock = getBusinessAddressesMock()
      if (!inLiquidation) {
        delete officesMock['liquidationRecordsOffice']
      }

      await mockCommonApiCallsForFiling(
        page,
        identifier,
        partiesMock,
        undefined,
        officesMock,
        undefined,
        undefined,
        [{ key: 'inLiquidation', value: inLiquidation }]
      )
    })

    test('Basic initialization', async ({ page }) => {
      await navigateToManageLiquidatorsPage(page, type)
      await page.waitForLoadState('networkidle')

      // has auth header
      await expect(page.getByTestId('connect-header-wrapper')).toBeVisible()
      // has breadcrumb
      await expect(page.getByTestId('connect-breadcrumb-wrapper')).toBeVisible()
      await expect(page.getByTestId('connect-breadcrumb-wrapper').getByText(h1)).toBeVisible()
      // has tombstone
      await expect(page.getByTestId('connect-tombstone-wrapper')).toBeVisible()
      await expect(page.getByTestId('connect-tombstone-wrapper')
        .getByText('MCELROY ENTERPRISES LTD. - QA_IMPORT_TEST')
      ).toBeVisible()
      // has correct h1
      await expect(page.getByRole('heading', { name: h1 })).toBeVisible()
      // has fee summary
      await expect(page.getByTestId('fee-widget')).toBeVisible()
      // has buttons
      const buttonControl = page.getByTestId('connect-button-control-wrapper')
      await expect(buttonControl).toBeVisible()
      if (type === LiquidateType.REPORT) { // liq report has no save draft button
        await expect(buttonControl.getByRole('button')).toHaveCount(2)
        await expect(buttonControl).not.toContainText('Save and Resume Later')
      } else {
        await expect(buttonControl.getByRole('button')).toHaveCount(3)
        await expect(buttonControl).toContainText('Save and Resume Later')
      }
      // has footer
      await expect(page.getByTestId('connect-main-footer')).toBeVisible()
      // has form elemenets
      await expect(page.getByTestId('liquidator-info-section')).toBeVisible()

      if (type !== LiquidateType.REPORT) {
        await expect(page.getByTestId('court-order-section')).toBeVisible()
      }

      await expect(page.getByTestId('staff-payment-section')).toBeVisible()

      if (
        type === LiquidateType.INTENT
        || type === LiquidateType.ADDRESS
        || type === LiquidateType.REPORT
        || (type === LiquidateType.APPOINT && !inLiquidation)
      ) {
        await expect(page.getByTestId('records-office-section')).toBeVisible()
      } else {
        await expect(page.getByTestId('records-office-section')).not.toBeVisible()
      }

      // only report should have confirm checkboxes for records office and liquidators sections
      if (type === LiquidateType.REPORT) {
        await expect(page.getByTestId('records-office-section').getByRole('checkbox').first()).toBeVisible()
        await expect(page.getByTestId('liquidator-info-section').getByRole('checkbox').first()).toBeVisible()
      } else {
        await expect(page.getByTestId('records-office-section').getByRole('checkbox')).not.toBeVisible()
        await expect(page.getByTestId('liquidator-info-section').getByRole('checkbox')).not.toBeVisible()
      }
    })
  })
})
