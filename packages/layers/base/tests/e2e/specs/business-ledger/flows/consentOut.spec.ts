import { test, expect } from '@playwright/test'

import { FilingType } from '../../../../../app/enums/filing-type'
import { mockApiCallsForLedger } from '../../../../mocks/mock-helpers'

test.describe('Business Ledger Tests (consent out)', () => {
  test.beforeEach(async ({ page }) => {
    const identifier = 'BC1234567'
    await mockApiCallsForLedger(
      page,
      identifier,
      [
        { type: FilingType.CONSENT_AMALGAMATION_OUT },
        { type: FilingType.CONSENT_CONTINUATION_OUT }
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
        '6-Month Consent to Amalgamate Out',
        '6-Month Consent to Continue Out'
      ],
      subtitle: [
        'FILED AND PAID (filed by Tester Testing on Mar 20, 2025) EFFECTIVE as of Mar 20, 2025',
        'FILED AND PAID (filed by Tester Testing on Mar 6, 2025) EFFECTIVE as of Mar 6, 2025'
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

  // FUTURE: add in test for non expired
  test('Expanding the ledger items displays as expected (expired)', async ({ page }) => {
    const businessLedger = page.getByTestId('business-ledger')
    await expect(businessLedger).toBeVisible()
    const ledgerItems = await businessLedger.getByTestId('business-ledger-item').all()
    expect(ledgerItems.length).toBe(2)
    const expectedDisplay = [
      // eslint-disable-next-line max-len
      'This consent is expired. Please resubmit the amalgamate out application for authorization to become a foreign corporation.Court Order Number: TT0010045',
      // eslint-disable-next-line max-len
      'This consent is expired. Please resubmit the continue out application for authorization to become a foreign corporation.'
    ]
    for (let i = 0; i < ledgerItems.length; i++) {
      const item = ledgerItems[i]!
      const ledgerItemBody = item.getByTestId('business-ledger-item-body')
      await expect(ledgerItemBody).not.toBeVisible()
      // expand
      const headerDocumentsBtn = item.getByTestId('business-ledger-item-header')
        .getByTestId('business-ledger-item-header-dropdown-btn')
      await headerDocumentsBtn.click()
      await page.waitForLoadState('networkidle')
      // verify
      await expect(ledgerItemBody).toBeVisible()
      const bodyText = ledgerItemBody.getByTestId('business-ledger-item-body-text')
      await expect(bodyText).toBeVisible()
      await expect(bodyText).toHaveText(expectedDisplay[i]!)
    }
  })
})
