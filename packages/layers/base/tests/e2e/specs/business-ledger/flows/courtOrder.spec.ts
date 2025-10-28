import { test, expect } from '@playwright/test'

import { FilingType } from '../../../../../app/enums/filing-type'
import { mockApiCallsForLedger } from '../../../../mocks/mock-helpers'

test.describe('Business Ledger Tests (bootstrap)', () => {
  test.beforeEach(async ({ page }) => {
    const identifier = 'BC1234567'
    await mockApiCallsForLedger(page, identifier, [{ type: FilingType.COURT_ORDER }])
    await page.goto('./examples/components/BusinessLedger')
    await page.waitForLoadState('networkidle')
    const input = page.getByTestId('identifier-input')
    input.fill(identifier)
    const loadLedgerBtn = page.getByRole('button', { name: 'Load Business Ledger' })
    await loadLedgerBtn.click()
    await page.waitForLoadState('networkidle')
  })

  test('Loading the the ledger displays as expected', async ({ page }) => {
    const businessLedger = page.getByTestId('business-ledger')
    await expect(businessLedger).toBeVisible()
    const courtOrderNotification = businessLedger.getByTestId('court-order-notification')
    await expect(courtOrderNotification).toBeVisible()
    await expect(courtOrderNotification).toHaveText(
      'Court order(s) have been filed on this company. Review the filing history for impacts to business information.')
    const ledgerItems = await businessLedger.getByTestId('business-ledger-item').all()
    expect(ledgerItems.length).toBe(1)
    const item = ledgerItems[0]!
    const header = item.getByTestId('business-ledger-item-header')
    const headerTitle = header.getByTestId('business-ledger-item-header-title')
    const headerSubtitle = header.getByTestId('business-ledger-item-header-subtitle')
    // Header
    await expect(header).toBeVisible()
    // title
    await expect(headerTitle).toBeVisible()
    await expect(headerTitle).toHaveText('Court Order')
    // subtitle
    await expect(headerSubtitle).toBeVisible()
    await expect(headerSubtitle).toHaveText(
      'FILED AND PAID (filed by Tester Testing on Jul 16, 2024)')
  })

  // FUTURE - add pursuant to plan of arrangement case
  test('Expanding a Court Order item displays as expected', async ({ page }) => {
    const businessLedger = page.getByTestId('business-ledger')
    await expect(businessLedger).toBeVisible()
    // default is just 1 filing in the ledger (change of address)
    const ledgerItems = await businessLedger.getByTestId('business-ledger-item').all()
    expect(ledgerItems.length).toBe(1)
    const item = ledgerItems[0]!
    const headerDocumentsBtn = item
      .getByTestId('business-ledger-item-header')
      .getByTestId('business-ledger-item-header-dropdown-btn').getByRole('button')
    await expect(headerDocumentsBtn).toHaveText('View Documents')
    // expand
    const ledgerItemBody = item.getByTestId('business-ledger-item-body')
    await expect(ledgerItemBody).not.toBeVisible()
    await headerDocumentsBtn.click()
    await page.waitForLoadState('networkidle')
    await expect(ledgerItemBody).toBeVisible()
    // Text
    const bodyText = ledgerItemBody.getByTestId('business-ledger-item-body-text')
    await expect(bodyText).toBeVisible()
    await expect(bodyText.getByText('TEST')).toBeVisible()
    await expect(bodyText.getByText('Court Order Number: BBBBBBBBB')).toBeVisible()
    // Document list
    await expect(ledgerItemBody.getByTestId('document-list')).toBeVisible()
    // Comments list
    await expect(ledgerItemBody.getByTestId('comments-list')).not.toBeVisible()
  })
})
