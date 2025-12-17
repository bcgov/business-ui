import { test, expect } from '@playwright/test'

import { FilingType } from '../../../../../app/enums/filing-type'
import { mockApiCallsForLedger } from '../../../../mocks/mock-helpers'

test.describe('Business Ledger Tests (pending)', () => {
  test.beforeEach(async ({ page }) => {
    const identifier = 'BC1234567'
    await mockApiCallsForLedger(
      page,
      identifier,
      [
        { type: FilingType.ANNUAL_REPORT, overrides: [{ key: 'status', value: 'PAID' }] },
        { type: FilingType.CHANGE_OF_OFFICERS, overrides: [{ key: 'status', value: 'PAID' }] }
      ]
    )
    await page.goto('./examples/components/BusinessLedger')
    await page.waitForLoadState('networkidle')
    const input = page.getByTestId('identifier-input')
    input.fill(identifier)
    const loadLedgerBtn = page.getByRole('button', { name: 'Load Business Ledger' })
    await loadLedgerBtn.click()
    await page.waitForLoadState('networkidle')
  })

  test('Loading the ledger works displays these items as expected', async ({ page }) => {
    const businessLedger = page.getByTestId('business-ledger')
    await expect(businessLedger).toBeVisible()
    const ledgerItems = await businessLedger.getByTestId('business-ledger-item').all()
    expect(ledgerItems.length).toBe(2)
    const expectedDisplay = {
      title: [
        'Annual Report (2024)',
        'Officer Change'
      ],
      subtitle: [
        'FILED AND PENDING (filed by Tester Testing on Mar 18, 2024) EFFECTIVE as of Feb 7, 2024',
        'PENDING  (submitted by Testing Tester on Sep 29, 2025) EFFECTIVE as of Sep 29, 2025'
      ]
    }
    for (let i = 0; i < ledgerItems.length; i++) {
      const item = ledgerItems[i]!
      const header = item.getByTestId('business-ledger-item-header')
      const headerTitle = header.getByTestId('business-ledger-item-header-title')
      const headerSubtitle = header.getByTestId('business-ledger-item-header-subtitle')
      // Header
      await expect(header).toBeVisible()
      // title
      await expect(headerTitle).toBeVisible()
      await expect(headerTitle).toHaveText(expectedDisplay.title[i]!)
      // subtitle
      await expect(headerSubtitle).toBeVisible()
      await expect(headerSubtitle).toHaveText(expectedDisplay.subtitle[i]!)
    }
  })

  test('Expanding the ledger items displays as expected', async ({ page }) => {
    const businessLedger = page.getByTestId('business-ledger')
    await expect(businessLedger).toBeVisible()
    const ledgerItems = await businessLedger.getByTestId('business-ledger-item').all()
    expect(ledgerItems.length).toBe(2)
    const expectedDisplay = {
      bodyTitle: [
        'Filing Pending',
        null
      ],
      bodyText1: [
        // eslint-disable-next-line max-len
        'This Annual Report (2024) is paid, but the filing has not been completed by the Business Registry yet. Some filings may take longer than expected.',
        'Your submission is still being processed.'
      ],
      bodyText2: [
        // eslint-disable-next-line max-len
        'Refresh this screen in a few minutes or you can come back later to check on the progress. If this issue persists, please contact us.',
        'Some submissions may take longer than usual to complete. If this issue continues, please contact us.'
      ]
    }
    for (let i = 0; i < ledgerItems.length; i++) {
      const item = ledgerItems[i]!
      const ledgerItemBody = item.getByTestId('business-ledger-item-body')
      await expect(ledgerItemBody).not.toBeVisible()
      // expand
      const headerDocumentsBtn = item.getByTestId('business-ledger-item-header')
        .getByTestId('business-ledger-item-header-dropdown-btn').getByRole('button')
      await headerDocumentsBtn.click()
      await page.waitForLoadState('networkidle')
      // verify
      await expect(ledgerItemBody).toBeVisible()
      const bodyText = ledgerItemBody.getByTestId('business-ledger-item-body-text')
      await expect(bodyText).toBeVisible()
      await expect(bodyText.getByTestId('business-help-contact')).toBeVisible()
      if (expectedDisplay.bodyTitle[i]!) {
        await expect(bodyText.getByText(expectedDisplay.bodyTitle[i]!)).toBeVisible()
      }
      await expect(bodyText.getByText(expectedDisplay.bodyText1[i]!)).toBeVisible()
      await expect(bodyText.getByText(expectedDisplay.bodyText2[i]!)).toBeVisible()
      await expect(bodyText.getByText(
        // eslint-disable-next-line max-len
        'BC Registries Contact InformationMonday to Friday, 8:30am - 4:30pm Pacific Time Toll Free: 1-877-370-1033 Victoria Office: 1-250-370-1033 Email: BCRegistries@gov.bc.ca'
      )).toBeVisible()
    }
  })
})
