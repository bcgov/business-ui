import { test, expect } from '@playwright/test'

test.describe('Business Ledger Tests (basic)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./examples/components/BusinessLedger/Mocked')
    await page.waitForLoadState('networkidle')
  })

  test('Should render hardcoded ledger page', async ({ page }) => {
    await expect(page.getByText('BusinessLedger Mocked').first()).toBeVisible()
    await expect(page.getByRole(
      'heading',
      { name: 'Mocked Example (No comments or documents, ledger items are hardcoded)' }
    )).toBeVisible()
    await expect(page.getByRole('switch', { name: 'Court Order' })).toBeVisible()
    await expect(page.getByRole('switch', { name: 'No Filings' })).toBeVisible()
    await expect(page.getByTestId('business-ledger')).toBeVisible()
  })

  test('Should display expected hardcoded filings in the ledger as expected', async ({ page }) => {
    const ledgerItems = await page.getByTestId('business-ledger').getByTestId('business-ledger-item').all()
    for (const item of ledgerItems) {
      const header = item.getByTestId('business-ledger-item-header')
      const headerTitle = header.getByTestId('business-ledger-item-header-title')
      const headerSubtitle = header.getByTestId('business-ledger-item-header-subtitle')
      const headerDocumentsBtn = header.getByTestId('business-ledger-item-header-dropdown-btn')
      // Header
      await expect(header).toBeVisible()
      // title
      await expect(headerTitle).toBeVisible()
      expect(headerTitle.allTextContents()).toBeDefined()
      // subtitle
      await expect(headerSubtitle).toBeVisible()
      expect(headerSubtitle.allTextContents()).toBeDefined()
      // buttons
      await expect(headerDocumentsBtn).toBeVisible()
      await expect(headerDocumentsBtn).toHaveText('View Documents')
      // body
      await expect(item.getByTestId('business-ledger-item-body')).not.toBeVisible()
    }
  })

  test('Should display expanded body as expected', async ({ page }) => {
    const ledgerItem = page.getByTestId('business-ledger').getByTestId('business-ledger-item').first()
    const ledgerItemBody = ledgerItem.getByTestId('business-ledger-item-body')
    await expect(ledgerItemBody).not.toBeVisible()
    const headerDocumentsBtn = ledgerItem
      .getByTestId('business-ledger-item-header')
      .getByTestId('business-ledger-item-header-dropdown-btn')
    await expect(headerDocumentsBtn).toHaveText('View Documents')
    // expand
    await headerDocumentsBtn.click()
    await expect(headerDocumentsBtn).toHaveText('Hide Documents')
    await expect(ledgerItemBody).toBeVisible()
    // collapse
    await headerDocumentsBtn.click()
    await expect(headerDocumentsBtn).toHaveText('View Documents')
    await expect(ledgerItemBody).not.toBeVisible()
  })

  test('Should display court order info as expected', async ({ page }) => {
    // NOTE: page should start with court order filing toggled on
    const courtOrderSwitch = page.getByRole('switch', { name: 'Court Order' })
    await expect(courtOrderSwitch).toBeChecked()
    const courtOrderNotification = page.getByTestId('business-ledger').getByTestId('court-order-notification')
    await expect(courtOrderNotification).toBeVisible()
    await expect(courtOrderNotification).toHaveText(
      'Court order(s) have been filed on this company. Review the filing history for impacts to business information.')
    // toggle court order
    await courtOrderSwitch.click()
    await expect(courtOrderSwitch).not.toBeChecked()
    await expect(courtOrderNotification).not.toBeVisible()
  })

  test('Should display empty filings as expected', async ({ page }) => {
    // NOTE: page should start with no filings toggled off
    const noFilingsSwitch = page.getByRole('switch', { name: 'No Filings' })
    await expect(noFilingsSwitch).not.toBeChecked()
    const emptyBusinessLedger = page.getByTestId('business-ledger').getByTestId('business-ledger-empty')
    await expect(emptyBusinessLedger).not.toBeVisible()
    // toggle no filings
    await noFilingsSwitch.click()
    await expect(noFilingsSwitch).toBeChecked()
    await expect(emptyBusinessLedger.getByText('You have no filing history')).toBeVisible()
    await expect(emptyBusinessLedger.getByText(
      'Your completed filings and transactions will appear here')).toBeVisible()
  })
})
