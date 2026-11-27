import { test, expect } from '@playwright/test'
import {
  setupCourtOrderPage,
  navigateToCourtOrderPage,
  gotoCourtOrderPage,
  goToCourtOrderReviewStep,
  assertCommonFilingElements
} from '../../test-utils'
import { COURT } from '~~/tests/mocks'

const identifier = 'BC1234567'
const filingId = '999002'
const poaCheckboxName = 'This filing is pursuant to a Plan of Arrangement'
const supportingDocsCheckboxName = 'Add supporting documents'

test.describe('Court Order - Page init', () => {
  test('should display basic filing elements for staff', async ({ page }) => {
    await setupCourtOrderPage(page, identifier, filingId, COURT, 'STAFF')
    await navigateToCourtOrderPage(page, identifier, filingId)
    await page.waitForLoadState('networkidle')

    await assertCommonFilingElements(page, { title: 'Court Order' })

    // form sections
    await expect(page.getByTestId('form-section-court-order')).toBeVisible()
    await expect(page.getByTestId('court-order-number-input')).toBeVisible()
    await expect(page.getByTestId('court-order-poa-checkbox')).toBeVisible()
    await expect(page.getByTestId('court-order-text-input')).toBeVisible()
    await expect(page.getByTestId('court-order-file-upload')).toBeVisible()
    // the staff payment is collected on the review step
    await expect(page.getByTestId('staff-payment-section')).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Review and Confirm' })).toBeVisible()

    // the card sits directly under the h1 - no card heading or description
    await expect(page.getByText('Court Order and Plan of Arrangement')).not.toBeVisible()
    await expect(page.getByRole('group', { name: 'Court Order and Plan of Arrangement' })).toBeVisible()
    await expect(page.getByTestId('form-section-court-order').getByText('Max file size 50 MB')).toBeVisible()

    // the court order number is entered before the plan of arrangement
    const numberFirst = await page.getByTestId('form-section-court-order').evaluate((section) => {
      const number = section.querySelector('[data-testid="court-order-number-input"]')
      const poa = section.querySelector('[data-testid="court-order-poa-checkbox"]')
      return !!(number && poa && (number.compareDocumentPosition(poa) & Node.DOCUMENT_POSITION_FOLLOWING))
    })
    expect(numberFirst).toBe(true)

    // a fresh (empty) draft should not pre-fill any values
    await expect(page.getByTestId('court-order-number-input')).toHaveValue('')
    await expect(page.getByRole('checkbox', { name: poaCheckboxName })).not.toBeChecked()
    await expect(page.getByTestId('court-order-text-input')).toHaveValue('')
    // the supporting documents upload stays hidden behind its checkbox
    await expect(page.getByRole('checkbox', { name: supportingDocsCheckboxName })).not.toBeChecked()
    await expect(page.getByRole('checkbox', { name: supportingDocsCheckboxName })).toBeEnabled()
    await expect(page.getByTestId('court-order-file-upload').locator('input[type="file"]')).toHaveCount(1)
  })

  test('should hydrate court order fields from a non-empty draft', async ({ page }) => {
    await gotoCourtOrderPage(page, identifier, filingId, {
      draftOverrides: {
        courtOrder: {
          fileNumber: '12345-6789',
          effectOfOrder: 'planOfArrangement',
          orderDetails: 'Order pursuant to a court decision.',
          files: [
            { fileKey: 'CORP-DS0100001003', fileName: 'Court Order.pdf', documentType: 'court_order' }
          ]
        }
      }
    })

    await expect(page.getByTestId('court-order-number-input')).toHaveValue('12345-6789')
    await expect(page.getByRole('checkbox', { name: poaCheckboxName })).toBeChecked()
    await expect(page.getByTestId('court-order-text-input')).toHaveValue('Order pursuant to a court decision.')
    await expect(page.getByTestId('court-order-file-upload').getByText('Court Order.pdf')).toBeVisible()
    await expect(page.getByRole('checkbox', { name: supportingDocsCheckboxName })).not.toBeChecked()
  })

  test('should hydrate a supporting document with the supporting docs box checked', async ({ page }) => {
    await gotoCourtOrderPage(page, identifier, filingId, {
      draftOverrides: {
        courtOrder: {
          fileNumber: '12345-6789',
          files: [
            { fileKey: 'CORP-DS0100001003', fileName: 'Court Order.pdf', documentType: 'court_order' },
            { fileKey: 'CORP-DS0100001004', fileName: 'Affidavit.pdf', documentType: 'supporting_document' }
          ]
        }
      }
    })

    await expect(page.getByRole('checkbox', { name: supportingDocsCheckboxName })).toBeChecked()
    await expect(page.getByRole('checkbox', { name: supportingDocsCheckboxName })).toBeEnabled()
    await expect(page.getByTestId('court-order-file-upload').getByText('Affidavit.pdf')).toBeVisible()
    await expect(page.getByTestId('court-order-file-upload').locator('input[type="file"]')).toHaveCount(2)
  })

  test('should review the court order and return to the form with the values retained', async ({ page }) => {
    await gotoCourtOrderPage(page, identifier, filingId, {
      draftOverrides: {
        courtOrder: {
          fileNumber: '12345-6789',
          effectOfOrder: 'planOfArrangement',
          orderDetails: 'Order pursuant to a court decision.',
          files: [
            { fileKey: 'CORP-DS0100001003', fileName: 'Court Order.pdf', documentType: 'court_order' },
            { fileKey: 'CORP-DS0100001004', fileName: 'Affidavit.pdf', documentType: 'supporting_document' }
          ]
        }
      }
    })

    await goToCourtOrderReviewStep(page)

    await expect(page.getByRole('heading', { name: 'Court Order', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Review and Confirm' })).toBeVisible()
    await expect(page.getByTestId('review-court-order-number')).toHaveText('12345-6789')
    await expect(page.getByTestId('review-court-order-poa')).toHaveText('Yes')
    await expect(page.getByTestId('review-court-order-details')).toHaveText('Order pursuant to a court decision.')
    await expect(page.getByTestId('review-court-order-document').getByText('Court Order.pdf')).toBeVisible()
    await expect(page.getByTestId('review-supporting-documents').getByText('Affidavit.pdf')).toBeVisible()
    // review rows are display only
    await expect(page.getByTestId('review-court-order-section').getByRole('button', { name: /Delete|Remove/ }))
      .toHaveCount(0)
    await expect(page.getByTestId('staff-payment-section')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible()
    await expect(page.getByTestId('form-section-court-order')).not.toBeVisible()

    await page.getByRole('button', { name: 'Back' }).click()

    await expect(page.getByTestId('form-section-court-order')).toBeVisible()
    await expect(page.getByTestId('review-court-order-section')).not.toBeVisible()
    await expect(page.getByTestId('court-order-number-input')).toHaveValue('12345-6789')
    await expect(page.getByRole('checkbox', { name: poaCheckboxName })).toBeChecked()
    await expect(page.getByTestId('court-order-file-upload').getByText('Court Order.pdf')).toBeVisible()
  })

  test('should leave supporting documents out of the review when there are none', async ({ page }) => {
    await gotoCourtOrderPage(page, identifier, filingId, {
      draftOverrides: {
        courtOrder: {
          fileNumber: '12345-6789',
          orderDetails: 'Order pursuant to a court decision.',
          files: [{ fileKey: 'CORP-DS0100001003', fileName: 'Court Order.pdf', documentType: 'court_order' }]
        }
      }
    })

    await goToCourtOrderReviewStep(page)

    const review = page.getByTestId('review-court-order-section')
    await expect(page.getByTestId('review-court-order-document').getByText('Court Order.pdf')).toBeVisible()
    await expect(page.getByTestId('review-court-order-details')).toHaveText('Order pursuant to a court decision.')
    await expect(page.getByTestId('review-supporting-documents')).toHaveCount(0)
    await expect(review.getByText('Supporting Documents')).toHaveCount(0)
  })

  test('should hydrate the staff payment selection from a resumed draft', async ({ page }) => {
    await gotoCourtOrderPage(page, identifier, filingId, {
      draftOverrides: {
        courtOrder: {
          fileNumber: '12345-6789',
          orderDetails: 'Order pursuant to a court decision.',
          files: [{ fileKey: 'CORP-DS0100001003', fileName: 'Court Order.pdf', documentType: 'court_order' }]
        },
        header: {
          staffPaymentOption: 'BCOL',
          bcolAccountNumber: '123456',
          datNumber: 'C1234567',
          folioNumber: 'test-folio-123',
          priority: true
        }
      }
    })

    await goToCourtOrderReviewStep(page)

    await expect(page.getByRole('radio', { name: 'BC OnLine' })).toBeChecked()
    await expect(page.getByTestId('bcolnumberinput')).toHaveValue('123456')
    await expect(page.getByTestId('datnumberinput')).toHaveValue('C1234567')
    await expect(page.getByTestId('folionumber')).toHaveValue('test-folio-123')
    await expect(page.getByRole('checkbox', { name: 'Priority (Add $100.00)' })).toBeChecked()
  })

  test('should show the not-allowed modal when the user lacks the court order filing permission', async ({ page }) => {
    await setupCourtOrderPage(page, identifier, filingId, COURT, 'STAFF')
    // override the permissions the common mock registers - simulate a user without COURT_ORDER_FILING
    await page.route('**/api/v2/permissions', async (route) => {
      await route.fulfill({ json: { authorizedPermissions: [] } })
    })
    await navigateToCourtOrderPage(page, identifier, filingId)

    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expect(modal).toContainText('Page not available')
    await expect(page).toHaveURL(/.*court-order.*/)
  })

  test('should show the not-allowed modal for a non-BC-corp legal type', async ({ page }) => {
    await setupCourtOrderPage(page, identifier, filingId, COURT, 'STAFF', {
      businessOverrides: [{ key: 'legalType', value: 'SP' }]
    })
    await navigateToCourtOrderPage(page, identifier, filingId)

    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expect(modal).toContainText('Page not available')
    await expect(page).toHaveURL(/.*court-order.*/)
  })

  test('should show an error modal when the draft filing fails to load', async ({ page }) => {
    await setupCourtOrderPage(page, identifier, filingId, COURT, 'STAFF')
    // override the draft GET registered by setupCourtOrderPage to simulate a failed draft load -
    // getAndValidateDraftFiling rethrows any GET failure as 'invalid-draft-filing' either way
    await page.route(`**/api/v2/businesses/${identifier}/filings/${filingId}`, async (route) => {
      await route.fulfill({ status: 500, json: { message: 'Internal Server Error' } })
    })
    await navigateToCourtOrderPage(page, identifier, filingId)

    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expect(modal).toContainText('Page not found')
    await expect(page).toHaveURL(/.*court-order.*/)
  })
})
