import { test, expect } from '@playwright/test'

import { FilingType } from '../../../../../app/enums/filing-type'
import { mockApiCallsForLedger } from '../../../../mocks/mock-helpers'

test.describe('Business Ledger Tests (submission not filing)', () => {
  test.beforeEach(async ({ page }) => {
    const identifier = 'BC1234567'
    await mockApiCallsForLedger(page, identifier, [{ type: FilingType.CHANGE_OF_OFFICERS }])
    await page.goto('./examples/components/BusinessLedger')
    await page.waitForLoadState('networkidle')
    const input = page.getByTestId('identifier-input')
    input.fill(identifier)
    const loadLedgerBtn = page.getByRole('button', { name: 'Load Business Ledger' })
    await loadLedgerBtn.click()
    await page.waitForLoadState('networkidle')
  })

  test('Loading the Submission in the ledger displays as expected', async ({ page }) => {
    const businessLedger = page.getByTestId('business-ledger')
    await expect(businessLedger).toBeVisible()
    const ledgerItems = await businessLedger.getByTestId('business-ledger-item').all()
    expect(ledgerItems.length).toBe(1)
    const item = ledgerItems[0]!
    const header = item.getByTestId('business-ledger-item-header')
    const headerTitle = header.getByTestId('business-ledger-item-header-title')
    const headerSubtitle = header.getByTestId('business-ledger-item-header-subtitle')
    const headerDocumentsBtn = header.getByTestId('business-ledger-item-header-dropdown-btn')
    const headerDetailsBtn = header.getByTestId('business-ledger-item-header-details-btn')
    // Header
    await expect(header).toBeVisible()
    // title
    await expect(headerTitle).toBeVisible()
    await expect(headerTitle.getByText('Officer Change')).toBeVisible()
    // subtitle
    await expect(headerSubtitle).toBeVisible()
    await expect(headerSubtitle).toHaveText(
      'Submitted by Testing Tester on Sep 29, 2025EFFECTIVE as of Sep 29, 2025')
    // buttons
    await expect(headerDocumentsBtn).toBeVisible()
    await expect(headerDocumentsBtn).toHaveText('View Documents')
    await expect(headerDetailsBtn).not.toBeVisible()
    // body
    await expect(item.getByTestId('business-ledger-item-body')).not.toBeVisible()
  })
})
