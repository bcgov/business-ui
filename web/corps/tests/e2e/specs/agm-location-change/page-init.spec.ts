import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import {
  setupAgmLocationChangePage,
  setupAgmLocationChangePageWithDraft,
  navigateToAgmLocationChangePage
} from '../../test-utils'
import { AGMLC } from '~~/tests/mocks'

const identifier = 'BC1234567'
const draftId = '999003'

async function assertCommonElements(page: Page) {
  await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })
  // has auth header
  await expect(page.getByTestId('connect-header-wrapper')).toBeVisible()
  // has breadcrumb
  await expect(page.getByTestId('connect-breadcrumb-wrapper')).toBeVisible()
  await expect(page.getByTestId('connect-breadcrumb-wrapper').getByText('AGM Location Change')).toBeVisible()
  // has tombstone
  await expect(page.getByTestId('connect-tombstone-wrapper')).toBeVisible()
  await expect(page.getByTestId('connect-tombstone-wrapper')
    .getByText('MCELROY ENTERPRISES LTD. - QA_IMPORT_TEST')
  ).toBeVisible()
  // has heading
  await expect(page.getByRole('heading', { name: 'AGM Location Change', exact: true })).toBeVisible()
  // has fee summary
  await expect(page.getByTestId('fee-widget')).toBeVisible()
  await expect(page.getByTestId('fee-widget').getByText('AGM Location Change')).toBeVisible()
  await expect(page.getByTestId('fee-widget').getByText('No Fee')).toBeVisible()
  // has buttons
  await expect(page.getByTestId('connect-button-control')).toBeVisible()
  // has footer
  await expect(page.getByTestId('connect-main-footer')).toBeVisible()
}

test.describe('AGM Location Change - Page init', () => {
  test('should display basic filing elements for non-staff', async ({ page }) => {
    await setupAgmLocationChangePage(page, identifier, AGMLC, 'PREMIUM')
    await navigateToAgmLocationChangePage(page, identifier)
    await page.waitForLoadState('networkidle')

    await assertCommonElements(page)

    // Location Change Detail section
    await expect(page.getByTestId('form-section-location-change-detail')).toBeVisible()
    await expect(page.getByLabel('AGM Year')).toBeVisible()
    await expect(page.getByLabel('Reason')).toBeVisible()
    await expect(page.getByLabel('AGM Location', { exact: true })).toBeVisible()

    // Certify section visible for non-staff
    await expect(page.getByTestId('form-section-certify')).toBeVisible()

    // Fields start empty
    await expect(page.getByLabel('AGM Year')).toHaveValue('')
    await expect(page.getByLabel('Reason')).toHaveValue('')
    await expect(page.getByLabel('AGM Location', { exact: true })).toHaveValue('')
  })

  test('should display authorization section for staff (no staff payment — no-fee filing)', async ({ page }) => {
    await setupAgmLocationChangePage(page, identifier, AGMLC, 'STAFF')
    await navigateToAgmLocationChangePage(page, identifier)
    await page.waitForLoadState('networkidle')

    await assertCommonElements(page)

    await expect(page.getByTestId('form-section-location-change-detail')).toBeVisible()
    await expect(page.getByTestId('form-section-authorization')).toBeVisible()

    // Certify not visible for staff
    await expect(page.getByTestId('form-section-certify')).not.toBeVisible()
  })

  test('should hydrate AGM Location Change fields from a resumed draft', async ({ page }) => {
    await setupAgmLocationChangePageWithDraft(page, identifier, draftId, AGMLC, 'PREMIUM', {
      agmLocationChange: {
        year: '2025',
        reason: 'Shareholders are located outside BC.',
        agmLocation: 'Calgary, Alberta, Canada'
      }
    })
    await navigateToAgmLocationChangePage(page, identifier, draftId)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

    await expect(page.getByLabel('AGM Year')).toHaveValue('2025')
    await expect(page.getByLabel('Reason')).toHaveValue('Shareholders are located outside BC.')
    await expect(page.getByLabel('AGM Location', { exact: true })).toHaveValue('Calgary, Alberta, Canada')
  })

  test('should show the not-allowed modal for a non-BC-corp legal type', async ({ page }) => {
    await setupAgmLocationChangePage(page, identifier, AGMLC, 'PREMIUM', {
      businessOverrides: [{ key: 'legalType', value: 'SP' }]
    })
    await navigateToAgmLocationChangePage(page, identifier)

    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expect(modal).toContainText('Page not available')
    await expect(page).toHaveURL(/.*agm-location-change.*/)
  })
})
