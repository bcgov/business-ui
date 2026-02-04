import { test, expect } from '@playwright/test'
import type { Locator } from '@playwright/test'
import { FilingType } from '#business/app/enums/filing-type'
import { mockApiCallsForLedger } from '#test-mocks'

const identifier = 'BC1234567'

test.describe('Business Ledger Tests (document download)', () => {
  let documents: Locator

  test.beforeEach(async ({ page }) => {
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
    await page.goto('./examples/components/BusinessLedger')
    await page.waitForLoadState('load')
    const input = page.getByTestId('identifier-input')
    input.fill(identifier)
    const loadLedgerBtn = page.getByRole('button', { name: 'Load Business Ledger' })
    await loadLedgerBtn.click()
    await page.waitForLoadState('load')
    const businessLedger = page.getByTestId('business-ledger')
    // verify starting state
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
    documents = documentList.getByRole('button')
    expect(documents).toHaveCount(4)
  })

  test('Document download works as expected for a single document', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download')
    await documents.filter({ hasText: 'Receipt' }).click()
    const download = await downloadPromise

    const filename = download.suggestedFilename()
    expect(filename).toContain('Receipt')
    expect(filename).toContain(identifier)
    expect(filename.endsWith('.pdf')).toBe(true)
  })

  test('Document download works as expected for a download all', async ({ page }) => {
    const expectedDocs = ['Address Change', 'Notice Of Articles', 'Receipt']

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const downloads: any[] = []
    page.on('download', download => downloads.push(download))

    const downloadAllBtn = documents.filter({ hasText: 'Download All' })
    await downloadAllBtn.click()
    await expect(downloadAllBtn).toBeEnabled() // download button will be disabled until the downloads complete
    // check pw runner waits for browser - https://playwright.dev/docs/test-assertions#expectpoll
    await expect.poll(() => downloads.length).toBe(3)

    const filenames = downloads.map(d => d.suggestedFilename())
    for (const docName of expectedDocs) {
      const match = filenames.find(name =>
        name.includes(docName) && name.includes(identifier)
      )
      expect(match).toBeDefined()
      expect(match?.endsWith('.pdf')).toBe(true)
    }
  })

  test('Document download displays an error modal if the download fails', async ({ page }) => {
    await page.route('**/api/v2/**/documents/**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' })
      })
    })

    await documents.filter({ hasText: 'Address Change' }).click()

    const errorModal = page.getByRole('dialog')
    await expect(errorModal).toBeVisible()
    await expect(errorModal).toContainText('Unable to Download Documents')
    await expect(errorModal).toContainText('BC Registries Contact Information')
    await expect(errorModal).toContainText('Monday to Friday, 8:30am - 4:30pm Pacific Time')
    await expect(errorModal).toContainText('OK')
  })
})
