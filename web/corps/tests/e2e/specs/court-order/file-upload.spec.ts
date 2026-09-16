import { test, expect } from '@playwright/test'
import { setupCourtOrderPage, navigateToCourtOrderPage, createLetterSizePdfBuffer } from '../../test-utils'
import { COURT } from '~~/tests/mocks'

const identifier = 'BC1234567'
const filingId = '999002'

test.describe('Court Order - File Upload', () => {
  test('uploads a court order PDF via DRS and includes it in the submitted files array', async ({ page }) => {
    await setupCourtOrderPage(page, identifier, filingId, COURT, 'STAFF')
    // DRS upload endpoint - not covered by mockCommonApiCallsForFiling, stubbed locally here
    await page.route('**/documents/client/courtOrder/**', async (route) => {
      await route.fulfill({
        status: 201,
        json: {
          key: 'CORP-DS0100001003',
          consumerFilename: 'Court Order.pdf',
          documentURL: 'https://mock-api-url/documents/client/CORP-DS0100001003'
        }
      })
    })
    await navigateToCourtOrderPage(page, identifier, filingId)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

    await page.getByTestId('court-order-number-input').fill('12345-6789')

    // the court order (singular) upload area is the first file input rendered within the
    // court-order-file-upload fieldset - the second is the multi supporting-documents upload
    const courtOrderFileInput = page.getByTestId('court-order-file-upload').locator('input[type="file"]').first()
    // the file row renders optimistically before the DRS upload resolves, so wait on the
    // upload response itself - a keyless (still-uploading) file would be dropped from the payload
    const uploadResponse = page.waitForResponse(
      res => res.url().includes('/documents/client/courtOrder/') && res.request().method() === 'POST',
      { timeout: 10000 }
    )
    await courtOrderFileInput.setInputFiles({
      name: 'Court Order.pdf',
      mimeType: 'application/pdf',
      buffer: createLetterSizePdfBuffer()
    })
    await uploadResponse

    const uploadedFileRow = page.getByTestId('court-order-file-upload').getByText('Court Order.pdf')
    await expect(uploadedFileRow).toBeVisible({ timeout: 10000 })

    // orderDetails intentionally left blank - an uploaded court order file satisfies the
    // 'text or file' cross-field validation rule on its own
    await page.getByRole('radio', { name: 'No Fee' }).click()

    const submitRequest = page.waitForRequest(
      req => req.url().includes(`/businesses/${identifier}/filings/${filingId}`) && req.method() === 'PUT',
      { timeout: 10000 }
    )
    await page.getByRole('button', { name: 'Submit' }).click()
    const request = await submitRequest
    const body = request.postDataJSON()

    expect(body.filing.courtOrder.fileNumber).toBe('12345-6789')
    expect(body.filing.courtOrder).not.toHaveProperty('orderDetails')
    expect(body.filing.courtOrder.files).toEqual([
      { fileKey: 'CORP-DS0100001003', fileName: 'Court Order.pdf', documentType: 'court_order' }
    ])
  })

  test('shows a validation error when neither order text nor a file is provided', async ({ page }) => {
    await setupCourtOrderPage(page, identifier, filingId, COURT, 'STAFF')
    await navigateToCourtOrderPage(page, identifier, filingId)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

    await page.getByTestId('court-order-number-input').fill('12345-6789')
    await page.getByRole('radio', { name: 'No Fee' }).click()

    await page.getByRole('button', { name: 'Submit' }).click()

    await expect(page.getByText('Enter a court order or upload a file')).toBeVisible()
    // should remain on the court order page - the request should never have been sent
    await expect(page).toHaveURL(/.*court-order.*/)
  })
})
