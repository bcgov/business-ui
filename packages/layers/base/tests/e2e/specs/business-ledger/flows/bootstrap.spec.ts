import { test, expect } from '@playwright/test'
import { mockApiCallsForLedger } from '../../../../mocks/mock-helpers'

test.describe('Business Ledger Tests (bootstrap)', () => {
  test.beforeEach(async ({ page }) => {
    const identifier = 'TUVSVVR7Ko'
    await mockApiCallsForLedger(page, identifier, [])
    await page.goto('./examples/components/BusinessLedger')
    await page.waitForLoadState('networkidle')
    const input = page.getByTestId('identifier-input')
    input.fill(identifier)
    const loadLedgerBtn = page.getByRole('button', { name: 'Load Business Ledger' })
    await loadLedgerBtn.click()
    await page.waitForLoadState('networkidle')
  })

  test('Loading the bootstrap in the ledger works as expected', async ({ page }) => {
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
    await expect(headerTitle.getByText('BC Benefit Company Incorporation Application')).toBeVisible()
    // subtitle
    await expect(headerSubtitle).toBeVisible()
    await expect(headerSubtitle).toHaveText(
      'FILED AND PAID (filed by BCREGTEST Dalia ONE on Sep 26, 2025) EFFECTIVE as of Sep 26, 2025')
    // buttons
    await expect(headerDocumentsBtn).toBeVisible()
    await expect(headerDocumentsBtn).toHaveText('View Documents')
    await expect(headerDetailsBtn).not.toBeVisible()
    // body
    await expect(item.getByTestId('business-ledger-item-body')).not.toBeVisible()
  })

  test('Expanding a bootstrap ledger item displays as expected', async ({ page }) => {
    const businessLedger = page.getByTestId('business-ledger')
    await expect(businessLedger).toBeVisible()
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
    await expect(bodyText.getByText('Incorporation Complete')).toBeVisible()
    await expect(bodyText.getByText('LUCAS DEV BEN 0926 INC. has been successfully incorporated.')).toBeVisible()
    await expect(bodyText.getByText(
      'The system has completed processing your filing. You can now retrieve the business information.')).toBeVisible()
    // FUTURE - stub redirect and verify button click
    await expect(bodyText.getByRole('link', { name: 'Retrieve Business Information' })).toBeVisible()
    // Document list
    await expect(ledgerItemBody.getByTestId('document-list')).toBeVisible()
    // Comments list
    await expect(ledgerItemBody.getByTestId('comments-list')).not.toBeVisible()
  })
})
