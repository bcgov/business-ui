import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { setupCourtOrderPage, navigateToCourtOrderPage } from '../../test-utils'
import { COURT } from '~~/tests/mocks'

const identifier = 'BC1234567'
const filingId = '999002'
const poaCheckboxName = 'This filing is pursuant to a Plan of Arrangement'

async function assertCommonElements(page: Page) {
  await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })
  // has auth header
  await expect(page.getByTestId('connect-header-wrapper')).toBeVisible()
  // has breadcrumb
  await expect(page.getByTestId('connect-breadcrumb-wrapper')).toBeVisible()
  await expect(page.getByTestId('connect-breadcrumb-wrapper').getByText('Court Order')).toBeVisible()
  // has tombstone
  await expect(page.getByTestId('connect-tombstone-wrapper')).toBeVisible()
  await expect(page.getByTestId('connect-tombstone-wrapper')
    .getByText('MCELROY ENTERPRISES LTD. - QA_IMPORT_TEST')
  ).toBeVisible()
  // has heading
  await expect(page.getByRole('heading', { name: 'Court Order', exact: true })).toBeVisible()
  // has fee summary
  await expect(page.getByTestId('fee-widget')).toBeVisible()
  await expect(page.getByTestId('fee-widget').getByText('Court Order')).toBeVisible()
  // has buttons
  await expect(page.getByTestId('connect-button-control')).toBeVisible()
  // has footer
  await expect(page.getByTestId('connect-main-footer')).toBeVisible()
}

test.describe('Court Order - Page init', () => {
  test('should display basic filing elements for staff', async ({ page }) => {
    await setupCourtOrderPage(page, identifier, filingId, COURT, 'STAFF')
    await navigateToCourtOrderPage(page, identifier, filingId)
    await page.waitForLoadState('networkidle')

    await assertCommonElements(page)

    // form sections
    await expect(page.getByTestId('form-section-court-order')).toBeVisible()
    await expect(page.getByTestId('court-order-number-input')).toBeVisible()
    await expect(page.getByTestId('court-order-poa-checkbox')).toBeVisible()
    await expect(page.getByTestId('court-order-text-input')).toBeVisible()
    await expect(page.getByTestId('court-order-file-upload')).toBeVisible()
    await expect(page.getByTestId('staff-payment-section')).toBeVisible()

    // a fresh (empty) draft should not pre-fill any values
    await expect(page.getByTestId('court-order-number-input')).toHaveValue('')
    await expect(page.getByRole('checkbox', { name: poaCheckboxName })).not.toBeChecked()
    await expect(page.getByTestId('court-order-text-input')).toHaveValue('')
  })

  test('should hydrate court order fields from a non-empty draft', async ({ page }) => {
    await setupCourtOrderPage(page, identifier, filingId, COURT, 'STAFF', {
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
    await navigateToCourtOrderPage(page, identifier, filingId)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

    await expect(page.getByTestId('court-order-number-input')).toHaveValue('12345-6789')
    await expect(page.getByRole('checkbox', { name: poaCheckboxName })).toBeChecked()
    await expect(page.getByTestId('court-order-text-input')).toHaveValue('Order pursuant to a court decision.')
    await expect(page.getByTestId('court-order-file-upload').getByText('Court Order.pdf')).toBeVisible()
  })

  test('should hydrate the staff payment selection from a resumed draft', async ({ page }) => {
    await setupCourtOrderPage(page, identifier, filingId, COURT, 'STAFF', {
      draftOverrides: {
        header: {
          staffPaymentOption: 'BCOL',
          bcolAccountNumber: '123456',
          datNumber: 'C1234567',
          folioNumber: 'test-folio-123',
          priority: true
        }
      }
    })
    await navigateToCourtOrderPage(page, identifier, filingId)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

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
