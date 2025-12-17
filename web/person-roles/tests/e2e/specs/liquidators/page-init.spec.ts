import { test, expect } from '@playwright/test'
import { mockCommonApiCallsForFiling, getPartiesMock } from '#test-mocks'
import { navigateToManageLiquidatorsPage } from '../../test-utils'

const identifier = 'BC1234567'

// TODO: fix tests once liquidators updated to initialize properly
test.describe.skip('Manage Liquidators - Page init', () => {
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
    await navigateToManageLiquidatorsPage(page)
    await page.waitForLoadState('networkidle')
  })

  test.describe('Basic initialization', () => {
    test('should display basic filing elements', async ({ page }) => {
      // has auth header
      expect(page.getByTestId('connect-header-wrapper')).toBeVisible()
      // has breadcrumb
      expect(page.getByTestId('connect-breadcrumb-wrapper')).toBeVisible()
      // TODO: uncomment once liquidators updated to initialize properly
      // expect(page.getByTestId('connect-breadcrumb-wrapper').getByText('Manage Liquidators')).toBeVisible()
      // has tombstone
      expect(page.getByTestId('connect-tombstone-wrapper')).toBeVisible()
      expect(page.getByTestId('connect-tombstone-wrapper')
        .getByText('MCELROY ENTERPRISES LTD. - QA_IMPORT_TEST')
      ).toBeVisible()
      // has manage liquidator title
      // TODO: uncomment once liquidators updated to initialize properly
      // expect(page.getByRole('heading', { name: 'Manage Liquidators' })).toBeVisible()
      // has fee summary
      expect(page.getByTestId('fee-widget')).toBeVisible()
      // has buttons
      expect(page.getByTestId('connect-button-control-wrapper')).toBeVisible()
      // has footer
      expect(page.getByTestId('connect-main-footer')).toBeVisible()
    })
  })
})
