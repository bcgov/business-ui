import { test, expect } from '@playwright/test'
import {
  setupCourtOrderPage,
  navigateToCourtOrderPage,
  createLetterSizePdfBuffer,
  goToCourtOrderReviewStep
} from '../../test-utils'
import { COURT } from '~~/tests/mocks'

const identifier = 'BC1234567'
const filingId = '999002'
const supportingDocsCheckboxName = 'Add supporting documents'
const supportingDocsError = 'Add Supporting Documents or uncheck the box above'

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
    await goToCourtOrderReviewStep(page)
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

    await page.getByRole('button', { name: 'Review and Confirm' }).click()

    await expect(page.getByText('Enter a court order or upload a file')).toBeVisible()
    // should remain on the form step - the review step never renders
    await expect(page).toHaveURL(/.*court-order.*/)
    await expect(page.getByTestId('review-court-order-section')).not.toBeVisible()
  })

  test('clears the validation error as soon as court order text is entered', async ({ page }) => {
    await setupCourtOrderPage(page, identifier, filingId, COURT, 'STAFF')
    await navigateToCourtOrderPage(page, identifier, filingId)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

    await page.getByTestId('court-order-number-input').fill('12345-6789')
    await page.getByRole('button', { name: 'Review and Confirm' }).click()
    await expect(page.getByText('Enter a court order or upload a file')).toBeVisible()

    // entering text must clear the cross-field error immediately - no resubmit required
    await page.getByTestId('court-order-text-input').fill('Ordered by the court')
    await expect(page.getByText('Enter a court order or upload a file')).not.toBeVisible()
  })

  test('clears the validation error as soon as a court order file is uploaded', async ({ page }) => {
    await setupCourtOrderPage(page, identifier, filingId, COURT, 'STAFF')
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
    await page.getByRole('button', { name: 'Review and Confirm' }).click()
    await expect(page.getByText('Enter a court order or upload a file')).toBeVisible()

    // uploading a court order file must clear the cross-field error immediately
    const uploadResponse = page.waitForResponse(
      res => res.url().includes('/documents/client/courtOrder/') && res.request().method() === 'POST',
      { timeout: 10000 }
    )
    await page.getByTestId('court-order-file-upload').locator('input[type="file"]').first().setInputFiles({
      name: 'Court Order.pdf',
      mimeType: 'application/pdf',
      buffer: createLetterSizePdfBuffer()
    })
    await uploadResponse
    await expect(page.getByText('Enter a court order or upload a file')).not.toBeVisible()
  })

  test('errors when add supporting documents is checked without an upload, clears on uncheck', async ({ page }) => {
    await setupCourtOrderPage(page, identifier, filingId, COURT, 'STAFF')
    await navigateToCourtOrderPage(page, identifier, filingId)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

    await page.getByTestId('court-order-number-input').fill('12345-6789')
    await page.getByTestId('court-order-text-input').fill('Ordered by the court')
    await page.getByRole('checkbox', { name: supportingDocsCheckboxName }).check()
    await expect(page.getByRole('button', { name: 'Upload Documents' })).toBeVisible()
    // the rule only applies on Review and Confirm, not when the box is checked
    await expect(page.getByText(supportingDocsError)).not.toBeVisible()

    await page.getByRole('button', { name: 'Review and Confirm' }).click()

    await expect(page.getByText(supportingDocsError)).toBeVisible()
    await expect(page.getByTestId('review-court-order-section')).not.toBeVisible()

    // unchecking the box resolves the error and hides the upload again
    await page.getByRole('checkbox', { name: supportingDocsCheckboxName }).uncheck()
    await expect(page.getByText(supportingDocsError)).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Upload Documents' })).not.toBeVisible()

    await goToCourtOrderReviewStep(page)
  })

  test('locks the add supporting documents box while a supporting document is uploaded', async ({ page }) => {
    await setupCourtOrderPage(page, identifier, filingId, COURT, 'STAFF')
    await page.route('**/documents/client/courtOrder/**', async (route) => {
      await route.fulfill({
        status: 201,
        json: {
          key: 'CORP-DS0100001004',
          consumerFilename: 'Affidavit.pdf',
          documentURL: 'https://mock-api-url/documents/client/CORP-DS0100001004'
        }
      })
    })
    // removing a file uploaded this session hard deletes it from DRS
    await page.route('**/documents/client/CORP-DS0100001004', async (route) => {
      await route.fulfill({ status: 200, json: {} })
    })
    await navigateToCourtOrderPage(page, identifier, filingId)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

    const checkbox = page.getByRole('checkbox', { name: supportingDocsCheckboxName })
    await checkbox.check()
    const fileInputs = page.getByTestId('court-order-file-upload').locator('input[type="file"]')
    await expect(fileInputs).toHaveCount(2)

    const uploadResponse = page.waitForResponse(
      res => res.url().includes('/documents/client/courtOrder/') && res.request().method() === 'POST',
      { timeout: 10000 }
    )
    // the second file input is the multi supporting-documents upload
    await fileInputs.last().setInputFiles({
      name: 'Affidavit.pdf',
      mimeType: 'application/pdf',
      buffer: createLetterSizePdfBuffer()
    })
    await uploadResponse

    await expect(page.getByTestId('court-order-file-upload').getByText('Affidavit.pdf')).toBeVisible({ timeout: 10000 })
    await expect(checkbox).toBeChecked()
    await expect(checkbox).toBeDisabled()

    await page.getByRole('button', { name: 'Remove Affidavit.pdf' }).first().click()

    await expect(page.getByTestId('court-order-file-upload').getByText('Affidavit.pdf')).not.toBeVisible()
    await expect(checkbox).toBeEnabled()
    await expect(checkbox).toBeChecked()
  })
})
