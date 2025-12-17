import { test, expect } from '@playwright/test'

import { FilingType } from '../../../../app/enums/filing-type'
import { mockApiCallsForLedger } from '../../../mocks/mock-helpers'

test.describe('Business Ledger Tests (advanced)', () => {
  test.beforeEach(async ({ page }) => {
    // skip setup for first test in this suite
    if (test.info().title !== 'BusinessLedger test component displays as expected') {
      const identifier = 'BC1234567'
      const filingId = 1234
      const paperOnly = test.info().title.includes('(paper only)')
      await mockApiCallsForLedger(
        page,
        identifier,
        [{
          type: FilingType.CHANGE_OF_ADDRESS,
          overrides: [{ key: 'filingId', value: filingId }, { key: 'availableOnPaperOnly', value: paperOnly }]
        }]
      )
      if (test.info().title.includes('filing_id')) {
        await page.goto(`./examples/components/BusinessLedger?filing_id=${filingId}`)
      } else {
        await page.goto('./examples/components/BusinessLedger')
      }
      await page.waitForLoadState('load')
      if (test.info().title.includes('docs locked')) {
        await page.getByRole('switch', { name: 'Documents Locked' }).click()
      }
      if (test.info().title.includes('receipts not included')) {
        await page.getByRole('switch', { name: 'Hide Receipts' }).click()
      }
      const input = page.getByTestId('identifier-input')
      input.fill(identifier)
      const loadLedgerBtn = page.getByRole('button', { name: 'Load Business Ledger' })
      await loadLedgerBtn.click()
      await page.waitForLoadState('load')
    }
  })
  test('BusinessLedger test component displays as expected', async ({ page }) => {
    await mockApiCallsForLedger(page)
    await page.goto('./examples/components/BusinessLedger')
    await page.waitForLoadState('load')
    await expect(page.getByText('BusinessLedger').first()).toBeVisible()
    await expect(page.getByRole(
      'heading',
      { name: 'Example (login and API integration setup required)' }
    )).toBeVisible()
    await expect(page.getByRole('switch', { name: 'Hide Receipts' })).toBeVisible()
    await expect(page.getByRole('switch', { name: 'Hide Receipts' })).not.toBeChecked()
    await expect(page.getByTestId('identifier-input')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Load Business Ledger' })).toBeVisible()
  })

  test('Loading the business ledger works as expected', async ({ page }) => {
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
    await expect(headerTitle.getByText('Address Change')).toBeVisible()
    // subtitle
    await expect(headerSubtitle).toBeVisible()
    await expect(headerSubtitle).toHaveText(
      'FILED AND PAID (filed by Tester Testing on Oct 10, 2025) EFFECTIVE as of Oct 11, 2025')
    // buttons
    await expect(headerDocumentsBtn).toBeVisible()
    await expect(headerDocumentsBtn).toHaveText('View Documents')
    await expect(headerDetailsBtn).toBeVisible()
    await expect(headerDetailsBtn).toHaveText('Details (1)')
    // body
    await expect(item.getByTestId('business-ledger-item-body')).not.toBeVisible()
  })

  test('Expanding a business ledger item works as expected', async ({ page }) => {
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
    await page.waitForLoadState('load')
    await expect(ledgerItemBody).toBeVisible()
    // No text
    await expect(ledgerItemBody.getByTestId('business-ledger-item-body-text')).not.toBeVisible()
    // Document list
    await expect(ledgerItemBody.getByTestId('document-list')).toBeVisible()
    // Comments list
    await expect(ledgerItemBody.getByTestId('comments-list')).toBeVisible()
  })

  test('Expanding a business ledger item works as expected (paper only)', async ({ page }) => {
    const businessLedger = page.getByTestId('business-ledger')
    await expect(businessLedger).toBeVisible()
    const ledgerItems = await businessLedger.getByTestId('business-ledger-item').all()
    expect(ledgerItems.length).toBe(1)
    const item = ledgerItems[0]!
    const headerDocumentsBtn = item
      .getByTestId('business-ledger-item-header')
      .getByTestId('business-ledger-item-header-dropdown-btn').getByRole('button')
    await expect(headerDocumentsBtn).toHaveText('Request a Copy')
    // expand
    const ledgerItemBody = item.getByTestId('business-ledger-item-body')
    await expect(ledgerItemBody).not.toBeVisible()
    await headerDocumentsBtn.click()
    await page.waitForLoadState('load')
    await expect(headerDocumentsBtn).toHaveText('Close')
    await expect(ledgerItemBody).toBeVisible()
    // Text
    const bodyText = ledgerItemBody.getByTestId('business-ledger-item-body-text')
    await expect(bodyText).toBeVisible()
    await expect(bodyText.getByTestId('business-help-contact')).toBeVisible()
    await expect(bodyText).toHaveText(
      // eslint-disable-next-line max-len
      'This filing is available on paper only. To request copies of paper documents, contact BC Registries staff.BC Registries Contact InformationMonday to Friday, 8:30am - 4:30pm Pacific Time Toll Free: 1-877-370-1033 Victoria Office: 1-250-370-1033 Email: BCRegistries@gov.bc.ca')
    // Document list
    await expect(ledgerItemBody.getByTestId('document-list')).not.toBeVisible()
    // Comments list
    await expect(ledgerItemBody.getByTestId('comments-list')).toBeVisible()
  })

  test('Setting filing_id in the url expands the corresponding filing by default', async ({ page }) => {
    const businessLedger = page.getByTestId('business-ledger')
    await expect(businessLedger).toBeVisible()
    const ledgerItems = await businessLedger.getByTestId('business-ledger-item').all()
    expect(ledgerItems.length).toBe(1)
    const item = ledgerItems[0]!
    // verify its already expanded
    const headerDocumentsBtn = item
      .getByTestId('business-ledger-item-header')
      .getByTestId('business-ledger-item-header-dropdown-btn').getByRole('button')
    await expect(headerDocumentsBtn).toHaveText('Hide Documents')
    const ledgerItemBody = item.getByTestId('business-ledger-item-body')
    await expect(ledgerItemBody).toBeVisible()
    // Document list
    await expect(ledgerItemBody.getByTestId('document-list')).toBeVisible()
    // Comments list
    await expect(ledgerItemBody.getByTestId('comments-list')).toBeVisible()
  })

  test('Documents list shows as expected (docs unlocked, receipts included)', async ({ page }) => {
    const businessLedger = page.getByTestId('business-ledger')
    // verify starting state
    await expect(page.getByRole('switch', { name: 'Hide Receipts' })).toBeVisible()
    await expect(page.getByRole('switch', { name: 'Hide Receipts' })).not.toBeChecked()
    await expect(page.getByRole('switch', { name: 'Documents Locked' })).toBeVisible()
    await expect(page.getByRole('switch', { name: 'Documents Locked' })).not.toBeChecked()
    await expect(businessLedger).toBeVisible()
    // expand item
    const ledgerItems = await businessLedger.getByTestId('business-ledger-item').all()
    const item = ledgerItems[0]!
    const headerDocumentsBtn = item
      .getByTestId('business-ledger-item-header')
      .getByTestId('business-ledger-item-header-dropdown-btn').getByRole('button')
    const ledgerItemBody = item.getByTestId('business-ledger-item-body')
    await headerDocumentsBtn.click()
    await page.waitForLoadState('load')
    // Verify Document list
    const documentList = ledgerItemBody.getByTestId('document-list')
    await expect(documentList).toBeVisible()
    const documents = await documentList.getByRole('button').all()
    expect(documents.length).toBe(4)
    await expect(documents[0]!).toHaveText('Address Change')
    await expect(documents[0]!).toBeEnabled()
    await expect(documents[1]!).toHaveText('Notice Of Articles')
    await expect(documents[1]!).toBeEnabled()
    await expect(documents[2]!).toHaveText('Receipt')
    await expect(documents[2]!).toBeEnabled()
    await expect(documents[3]!).toHaveText('Download All')
    await expect(documents[3]!).toBeEnabled()
  })

  test('Documents list shows as expected (docs unlocked, receipts not included)', async ({ page }) => {
    const businessLedger = page.getByTestId('business-ledger')
    // verify starting state
    await expect(page.getByRole('switch', { name: 'Hide Receipts' })).toBeVisible()
    await expect(page.getByRole('switch', { name: 'Hide Receipts' })).toBeChecked()
    await expect(page.getByRole('switch', { name: 'Documents Locked' })).toBeVisible()
    await expect(page.getByRole('switch', { name: 'Documents Locked' })).not.toBeChecked()
    await expect(businessLedger).toBeVisible()
    // expand item
    const ledgerItems = await businessLedger.getByTestId('business-ledger-item').all()
    const item = ledgerItems[0]!
    const headerDocumentsBtn = item
      .getByTestId('business-ledger-item-header')
      .getByTestId('business-ledger-item-header-dropdown-btn').getByRole('button')
    const ledgerItemBody = item.getByTestId('business-ledger-item-body')
    await headerDocumentsBtn.click()
    await page.waitForLoadState('load')
    // Verify Document list
    const documentList = ledgerItemBody.getByTestId('document-list')
    await expect(documentList).toBeVisible()
    const documents = await documentList.getByRole('button').all()
    // No receipt so it shouldn't receipt
    expect(documents.length).toBe(3)
    // FUTURE - stub download and verify button click
    await expect(documents[0]!).toHaveText('Address Change')
    await expect(documents[0]!).toBeEnabled()
    await expect(documents[1]!).toHaveText('Notice Of Articles')
    await expect(documents[1]!).toBeEnabled()
    await expect(documents[2]!).toHaveText('Download All')
    await expect(documents[2]!).toBeEnabled()
  })

  test('Documents list shows as expected (docs locked, receipts not included)', async ({ page }) => {
    const businessLedger = page.getByTestId('business-ledger')
    // verify starting state
    await expect(page.getByRole('switch', { name: 'Hide Receipts' })).toBeChecked()
    await expect(page.getByRole('switch', { name: 'Documents Locked' })).toBeChecked()
    await expect(businessLedger).toBeVisible()
    // expand item
    const ledgerItems = await businessLedger.getByTestId('business-ledger-item').all()
    const item = ledgerItems[0]!
    const headerDocumentsBtn = item
      .getByTestId('business-ledger-item-header')
      .getByTestId('business-ledger-item-header-dropdown-btn').getByRole('button')
    const ledgerItemBody = item.getByTestId('business-ledger-item-body')
    await headerDocumentsBtn.click()
    await page.waitForLoadState('load')
    // Verify Document list
    const documentList = ledgerItemBody.getByTestId('document-list')
    await expect(documentList).toBeVisible()
    const documents = await documentList.getByRole('button').all()
    // Locked and no receipt so it shouldn't have download all, or receipt
    expect(documents.length).toBe(2)
    await expect(documents[0]!).toHaveText('Address Change')
    await expect(documents[0]!).toBeDisabled()
    await expect(documents[1]!).toHaveText('Notice Of Articles')
    await expect(documents[1]!).toBeDisabled()
  })

  test('Comment list shows as expected', async ({ page }) => {
    const businessLedger = page.getByTestId('business-ledger')
    await expect(businessLedger).toBeVisible()
    // expand item
    const ledgerItems = await businessLedger.getByTestId('business-ledger-item').all()
    const item = ledgerItems[0]!
    const headerDetailsBtn = item
      .getByTestId('business-ledger-item-header')
      .getByTestId('business-ledger-item-header-details-btn')
    const ledgerItemBody = item.getByTestId('business-ledger-item-body')
    await headerDetailsBtn.click()
    await page.waitForLoadState('load')
    // Verify Comment list
    const commentSection = ledgerItemBody.getByTestId('comments-list')
    await expect(commentSection).toBeVisible()
    await expect(commentSection.getByText('Details (1)')).toBeVisible()
    const comments = await commentSection.getByTestId('ledger-comment').all()
    expect(comments.length).toBe(1)
    await expect(comments[0]!).toContainText('BC Registries Staff')
    await expect(comments[0]!).toContainText('(October 14, 2025 at 7:11 am Pacific time)')
    await expect(comments[0]!).toContainText('Testing')
  })
})
