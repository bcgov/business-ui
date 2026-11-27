import { test, expect } from '@playwright/test'
import {
  setupCourtOrderPage,
  loadCourtOrderPage,
  gotoCourtOrderPage,
  createLetterSizePdfBuffer,
  goToCourtOrderReviewStep,
  uploadCourtOrderFile
} from '../../test-utils'
import { COURT } from '~~/tests/mocks'

const identifier = 'BC1234567'
const filingId = '999002'
const supportingDocsCheckboxName = 'Add supporting documents'
const supportingDocsError = 'Add Supporting Documents or uncheck the box above'
const courtOrderFileError = 'Court order document is required.'

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
    await loadCourtOrderPage(page, identifier, filingId)

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

    await page.getByTestId('court-order-text-input').fill('Ordered by the court')
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
    expect(body.filing.courtOrder.orderDetails).toBe('Ordered by the court')
    expect(body.filing.courtOrder.files).toEqual([
      { fileKey: 'CORP-DS0100001003', fileName: 'Court Order.pdf', documentType: 'court_order' }
    ])
  })

  test('requires court order details even when a court order document is uploaded', async ({ page }) => {
    await gotoCourtOrderPage(page, identifier, filingId)

    await page.getByTestId('court-order-number-input').fill('12345-6789')
    await uploadCourtOrderFile(page)

    await page.getByRole('button', { name: 'Review and Confirm' }).click()

    await expect(page.getByTestId('form-section-court-order').getByText('This field is required')).toBeVisible()
    await expect(page.getByTestId('court-order-text-input')).toBeFocused()
    await expect(page.getByTestId('review-court-order-section')).not.toBeVisible()

    // entering details clears the error - no resubmit required
    await page.getByTestId('court-order-text-input').fill('Ordered by the court')
    await expect(page.getByTestId('form-section-court-order').getByText('This field is required')).not.toBeVisible()
    await goToCourtOrderReviewStep(page)
  })

  test('requires a court order document even when order details are entered', async ({ page }) => {
    await gotoCourtOrderPage(page, identifier, filingId)

    await page.getByTestId('court-order-number-input').fill('12345-6789')
    await page.getByTestId('court-order-text-input').fill('Ordered by the court')

    await page.getByRole('button', { name: 'Review and Confirm' }).click()

    await expect(page.getByTestId('court-order-file-upload').getByRole('alert').getByText(courtOrderFileError))
      .toBeVisible()
    // should remain on the form step - the review step never renders
    await expect(page).toHaveURL(/.*court-order.*/)
    await expect(page.getByTestId('review-court-order-section')).not.toBeVisible()
  })

  test('clears the validation error as soon as a court order file is uploaded', async ({ page }) => {
    await gotoCourtOrderPage(page, identifier, filingId)

    await page.getByTestId('court-order-number-input').fill('12345-6789')
    await page.getByRole('button', { name: 'Review and Confirm' }).click()
    await expect(page.getByText(courtOrderFileError)).toBeVisible()

    // uploading a court order file must clear the error immediately - no resubmit required
    await uploadCourtOrderFile(page)
    await expect(page.getByText(courtOrderFileError)).not.toBeVisible()
  })

  test('errors when add supporting documents is checked without an upload, clears on uncheck', async ({ page }) => {
    await gotoCourtOrderPage(page, identifier, filingId)

    await page.getByTestId('court-order-number-input').fill('12345-6789')
    await page.getByTestId('court-order-text-input').fill('Ordered by the court')
    await uploadCourtOrderFile(page)
    await page.getByRole('checkbox', { name: supportingDocsCheckboxName }).check()
    await expect(page.getByRole('button', { name: 'Upload Documents' })).toBeVisible()
    // the rule only applies on Review and Confirm, not when the box is checked
    await expect(page.getByText(supportingDocsError)).not.toBeVisible()

    await page.getByRole('button', { name: 'Review and Confirm' }).click()

    await expect(page.getByText(supportingDocsError)).toBeVisible()
    await expect(page.getByTestId('review-court-order-section')).not.toBeVisible()

    // nothing uploaded: unchecking needs no confirmation, resolves the error and hides the upload again
    await page.getByRole('checkbox', { name: supportingDocsCheckboxName }).uncheck()
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(page.getByText(supportingDocsError)).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Upload Documents' })).not.toBeVisible()

    await goToCourtOrderReviewStep(page)
  })

  test('asks before unchecking add supporting documents with a document uploaded', async ({ page }) => {
    await setupCourtOrderPage(page, identifier, filingId, COURT, 'STAFF')
    // removing a file uploaded this session hard deletes it from DRS
    let deletedFromDrs = false
    await page.route('**/documents/client/CORP-DS0100001004', async (route) => {
      if (route.request().method() !== 'DELETE') {
        return route.fallback()
      }
      deletedFromDrs = true
      await route.fulfill({ status: 200, json: {} })
    })
    await loadCourtOrderPage(page, identifier, filingId)

    await page.getByTestId('court-order-number-input').fill('12345-6789')
    await page.getByTestId('court-order-text-input').fill('Ordered by the court')
    await uploadCourtOrderFile(page)
    const checkbox = page.getByRole('checkbox', { name: supportingDocsCheckboxName })
    await checkbox.check()
    await uploadCourtOrderFile(page, 'supporting')
    // the box stays usable with a supporting document uploaded
    await expect(checkbox).toBeChecked()
    await expect(checkbox).toBeEnabled()

    // Cancel keeps the box checked and the document in place
    await checkbox.click()
    const modal = page.getByRole('dialog')
    await expect(modal.getByRole('heading', { name: 'Remove Supporting Documents' })).toBeVisible()
    await expect(modal).toContainText('Unchecking this box will remove the supporting documents already uploaded.')
    await modal.getByRole('button', { name: 'Cancel' }).click()
    await expect(modal).not.toBeVisible()
    await expect(checkbox).toBeChecked()
    await expect(page.getByTestId('court-order-file-upload').getByText('Affidavit.pdf')).toBeVisible()

    // Remove Documents removes every supporting document, unchecks the box and hides the upload
    await checkbox.click()
    await modal.getByRole('button', { name: 'Remove Documents' }).click()
    await expect(modal).not.toBeVisible()
    await expect(checkbox).not.toBeChecked()
    await expect(page.getByRole('button', { name: 'Upload Documents' })).not.toBeVisible()
    await expect(page.getByTestId('court-order-file-upload').getByText('Affidavit.pdf')).not.toBeVisible()
    await expect(page.getByTestId('court-order-file-upload').getByText('Court Order.pdf')).toBeVisible()
    expect(deletedFromDrs).toBe(true)

    // the removed document is not reviewed or submitted
    await goToCourtOrderReviewStep(page)
    await expect(page.getByTestId('review-supporting-documents')).toHaveCount(0)
    await page.getByRole('radio', { name: 'No Fee' }).click()
    const submitRequest = page.waitForRequest(
      req => req.url().includes(`/businesses/${identifier}/filings/${filingId}`) && req.method() === 'PUT',
      { timeout: 10000 }
    )
    await page.getByRole('button', { name: 'Submit' }).click()
    const body = (await submitRequest).postDataJSON()
    expect(body.filing.courtOrder.files).toEqual([
      { fileKey: 'CORP-DS0100001003', fileName: 'Court Order.pdf', documentType: 'court_order' }
    ])
  })
})
