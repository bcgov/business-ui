import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import {
  gotoCourtOrderPage,
  goToCourtOrderReviewStep,
  uploadCourtOrderFile,
  assertFinalRedirect
} from '../../test-utils'

const identifier = 'BC1234567'
const filingId = '999002'
const poaCheckboxText = 'This filing is pursuant to a Plan of Arrangement'
const courtOrderFilePayload = { fileKey: 'CORP-DS0100001003', fileName: 'Court Order.pdf', documentType: 'court_order' }

function waitForFilingPut(page: Page) {
  return page.waitForRequest(
    req => req.url().includes(`/businesses/${identifier}/filings/${filingId}`) && req.method() === 'PUT',
    { timeout: 10000 }
  )
}

test.describe('Court Order - Filing Submit', () => {
  test('submits a court order number, document, order text, and plan of arrangement', async ({ page }) => {
    await gotoCourtOrderPage(page, identifier, filingId)

    await page.getByTestId('court-order-number-input').fill('12345-6789')
    await page.getByText(poaCheckboxText, { exact: true }).click()
    await page.getByTestId('court-order-text-input').fill('Order pursuant to a court decision.')
    await uploadCourtOrderFile(page)
    await goToCourtOrderReviewStep(page)
    await page.getByRole('radio', { name: 'No Fee' }).click()

    const submitRequest = waitForFilingPut(page)
    await page.getByRole('button', { name: 'Submit' }).click()
    const request = await submitRequest
    const body = request.postDataJSON()

    expect(body.filing.courtOrder).toEqual({
      fileNumber: '12345-6789',
      effectOfOrder: 'planOfArrangement',
      orderDetails: 'Order pursuant to a court decision.',
      files: [courtOrderFilePayload]
    })
    expect(body.filing.header.certifiedBy).toBeTruthy()
    expect(body.filing.header).not.toHaveProperty('effectiveDate')
    expect(request.url()).not.toContain('draft=true')

    await assertFinalRedirect(page, identifier)
  })

  test('omits effectOfOrder when the Plan of Arrangement checkbox is not checked', async ({ page }) => {
    await gotoCourtOrderPage(page, identifier, filingId)

    await page.getByTestId('court-order-number-input').fill('12345-6789')
    await page.getByTestId('court-order-text-input').fill('Order pursuant to a court decision.')
    await uploadCourtOrderFile(page)
    await goToCourtOrderReviewStep(page)
    await page.getByRole('radio', { name: 'No Fee' }).click()

    const submitRequest = waitForFilingPut(page)
    await page.getByRole('button', { name: 'Submit' }).click()
    const request = await submitRequest
    const body = request.postDataJSON()

    expect(body.filing.courtOrder).not.toHaveProperty('effectOfOrder')
    expect(body.filing.courtOrder.files).toEqual([courtOrderFilePayload])
    expect(body.filing.courtOrder.fileNumber).toBe('12345-6789')
  })

  test.describe('Staff payment variants', () => {
    test('Cash or Cheque (FAS) - requires a routing slip number', async ({ page }) => {
      await gotoCourtOrderPage(page, identifier, filingId)

      await page.getByTestId('court-order-number-input').fill('12345-6789')
      await page.getByTestId('court-order-text-input').fill('Order text for FAS payment.')
      await uploadCourtOrderFile(page)
      await goToCourtOrderReviewStep(page)
      await page.getByRole('radio', { name: 'Cash or Cheque' }).click()
      await page.getByTestId('routingslipinput').fill('123456789')

      const submitRequest = waitForFilingPut(page)
      await page.getByRole('button', { name: 'Submit' }).click()
      const request = await submitRequest
      const body = request.postDataJSON()

      expect(body.filing.header).toMatchObject({
        staffPaymentOption: 'FAS',
        waiveFees: false,
        routingSlipNumber: '123456789'
      })
      expect(body.filing.header).not.toHaveProperty('bcolAccountNumber')
      expect(body.filing.header).not.toHaveProperty('priority')

      await assertFinalRedirect(page, identifier)
    })

    test('BC OnLine (BCOL) - with folio number and priority', async ({ page }) => {
      await gotoCourtOrderPage(page, identifier, filingId)

      await page.getByTestId('court-order-number-input').fill('12345-6789')
      await page.getByTestId('court-order-text-input').fill('Order text for BCOL payment.')
      await uploadCourtOrderFile(page)
      await goToCourtOrderReviewStep(page)
      await page.getByRole('radio', { name: 'BC OnLine' }).click()
      await page.getByTestId('bcolnumberinput').fill('123456')
      await page.getByTestId('datnumberinput').fill('C1234567')
      await page.getByTestId('folionumber').fill('folio-123')
      await page.getByRole('checkbox', { name: 'Priority (Add $100.00)' }).check()

      const submitRequest = waitForFilingPut(page)
      await page.getByRole('button', { name: 'Submit' }).click()
      const request = await submitRequest
      const body = request.postDataJSON()

      expect(body.filing.header).toMatchObject({
        staffPaymentOption: 'BCOL',
        waiveFees: false,
        bcolAccountNumber: '123456',
        datNumber: 'C1234567',
        folioNumber: 'folio-123',
        priority: true
      })

      await assertFinalRedirect(page, identifier)
    })

    test('No Fee - waives the fee widget total and sets waiveFees on submit', async ({ page }) => {
      await gotoCourtOrderPage(page, identifier, filingId)

      await page.getByTestId('court-order-number-input').fill('12345-6789')
      await page.getByTestId('court-order-text-input').fill('Order text for a no-fee filing.')
      await uploadCourtOrderFile(page)
      await goToCourtOrderReviewStep(page)
      await page.getByRole('radio', { name: 'No Fee' }).click()

      // fee widget should update client-side to reflect the waived fee, regardless of the
      // initial (non-zero) COURT fee mock the page was loaded with
      await expect(page.getByTestId('fee-widget').getByText('No Fee')).toBeVisible()

      const submitRequest = waitForFilingPut(page)
      await page.getByRole('button', { name: 'Submit' }).click()
      const request = await submitRequest
      const body = request.postDataJSON()

      expect(body.filing.header).toMatchObject({
        staffPaymentOption: 'NO_FEE',
        waiveFees: true
      })
      expect(body.filing.header).not.toHaveProperty('bcolAccountNumber')
      expect(body.filing.header).not.toHaveProperty('routingSlipNumber')

      await assertFinalRedirect(page, identifier)
    })
  })

  test.describe('Save and resume', () => {
    test('saves a draft with draft=true and still includes certifiedBy', async ({ page }) => {
      await gotoCourtOrderPage(page, identifier, filingId)

      await page.getByTestId('court-order-number-input').fill('12345-6789')
      await page.getByTestId('court-order-text-input').fill('Draft order text.')
      // allow the debounced 'hasChanges' watcher to register the edits before saving
      await page.waitForTimeout(200)

      const saveRequest = waitForFilingPut(page)
      await page.getByRole('button', { name: 'Save and Resume Later' }).click()
      const request = await saveRequest

      expect(request.url()).toContain('draft=true')
      const body = request.postDataJSON()
      expect(body.filing.header.certifiedBy).toBeTruthy()
      expect(body.filing.courtOrder.fileNumber).toBe('12345-6789')
      expect(body.filing.courtOrder.orderDetails).toBe('Draft order text.')
    })

    test('saves a draft from the review step', async ({ page }) => {
      await gotoCourtOrderPage(page, identifier, filingId)

      await page.getByTestId('court-order-number-input').fill('12345-6789')
      await page.getByTestId('court-order-text-input').fill('Draft order text.')
      await uploadCourtOrderFile(page)
      await goToCourtOrderReviewStep(page)
      await page.getByRole('radio', { name: 'No Fee' }).click()

      const saveRequest = waitForFilingPut(page)
      await page.getByRole('button', { name: 'Save and Resume Later' }).click()
      const request = await saveRequest

      expect(request.url()).toContain('draft=true')
      const body = request.postDataJSON()
      expect(body.filing.courtOrder.fileNumber).toBe('12345-6789')
      expect(body.filing.header).toMatchObject({ staffPaymentOption: 'NO_FEE', waiveFees: true })
    })
  })
})
