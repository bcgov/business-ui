import { test, expect } from '@playwright/test'

import { FilingType } from '../../../../../app/enums/filing-type'
import { mockApiCallsForLedger } from '../../../../mocks/mock-helpers'

test.describe('Business Ledger Tests (general filing)', () => {
  test.beforeEach(async ({ page }) => {
    const identifier = 'BC1234567'
    await mockApiCallsForLedger(
      page,
      identifier,
      [
        { type: FilingType.ANNUAL_REPORT },
        { type: FilingType.CHANGE_OF_ADDRESS },
        { type: FilingType.CHANGE_OF_DIRECTORS }
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
    expect(ledgerItems.length).toBe(3)
    const expectedDisplay = {
      title: [
        'Annual Report (2024)',
        'Address Change',
        'Director Change'
      ],
      subtitle: [
        'FILED AND PAID (filed by Tester Testing on Mar 18, 2024) EFFECTIVE as of Feb 7, 2024',
        'FILED AND PAID (filed by Tester Testing on Oct 10, 2025) EFFECTIVE as of Oct 11, 2025',
        'FILED AND PAID (filed by Tester Testing on Oct 21, 2021) EFFECTIVE as of Oct 21, 2021'
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
    expect(ledgerItems.length).toBe(3)
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
      // No Text
      await expect(ledgerItemBody.getByTestId('business-ledger-item-body-text')).not.toBeVisible()
      // Document list
      await expect(ledgerItemBody.getByTestId('document-list')).toBeVisible()
    }
  })
})
