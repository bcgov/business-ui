import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import {
  setupChangeOfDirectorsPage,
  setupChangeOfDirectorsPageWithDraft,
  navigateToChangeOfDirectorsPage
} from '../../test-utils'
import { OTCDR } from '~~/tests/mocks'

const identifier = 'BC1234567'
const draftId = '999005'

async function assertCommonElements(page: Page) {
  await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })
  // has auth header
  await expect(page.getByTestId('connect-header-wrapper')).toBeVisible()
  // has breadcrumb
  await expect(page.getByTestId('connect-breadcrumb-wrapper')).toBeVisible()
  await expect(page.getByTestId('connect-breadcrumb-wrapper').getByText('Director Change')).toBeVisible()
  // has tombstone
  await expect(page.getByTestId('connect-tombstone-wrapper')).toBeVisible()
  await expect(
    page.getByTestId('connect-tombstone-wrapper').getByText('MCELROY ENTERPRISES LTD. - QA_IMPORT_TEST')
  ).toBeVisible()
  // has heading
  await expect(page.getByRole('heading', { name: 'Director Change', exact: true })).toBeVisible()
  // has fee summary
  await expect(page.getByTestId('fee-widget')).toBeVisible()
  // has buttons
  await expect(page.getByTestId('connect-button-control')).toBeVisible()
  // has footer
  await expect(page.getByTestId('connect-main-footer')).toBeVisible()
}

test.describe('Change of Directors - Page init', () => {
  test('should display basic filing elements for non-staff', async ({ page }) => {
    await setupChangeOfDirectorsPage(page, identifier, OTCDR, 'PREMIUM')
    await navigateToChangeOfDirectorsPage(page, identifier)
    await page.waitForLoadState('networkidle')

    await assertCommonElements(page)

    // COD date section
    await expect(page.getByTestId('cod-date-section')).toBeVisible()
    await expect(page.getByTestId('cod-date-input')).toBeVisible()

    // Directors section
    await expect(page.getByTestId('directors-section')).toBeVisible()
    await expect(page.getByTestId('manage-directors')).toBeVisible()

    // Certify section visible for non-staff
    await expect(page.getByTestId('form-section-certify')).toBeVisible()

    // Authorization not visible for non-staff
    await expect(page.getByTestId('form-section-authorization')).not.toBeVisible()
  })

  test('should display authorization section for staff', async ({ page }) => {
    await setupChangeOfDirectorsPage(page, identifier, OTCDR, 'STAFF')
    await navigateToChangeOfDirectorsPage(page, identifier)
    await page.waitForLoadState('networkidle')

    await assertCommonElements(page)

    await expect(page.getByTestId('cod-date-section')).toBeVisible()
    await expect(page.getByTestId('directors-section')).toBeVisible()
    await expect(page.getByTestId('form-section-authorization')).toBeVisible()

    // Certify not visible for staff
    await expect(page.getByTestId('form-section-certify')).not.toBeVisible()
  })

  test('should load a resumed draft and display directors', async ({ page }) => {
    await setupChangeOfDirectorsPageWithDraft(page, identifier, draftId, OTCDR, 'PREMIUM', {
      header: {
        effectiveDate: '2026-02-15T08:00:00+00:00'
      }
    })
    await navigateToChangeOfDirectorsPage(page, identifier, draftId)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

    // Page loads correctly with the draft — sections visible and directors populated
    await expect(page.getByTestId('cod-date-section')).toBeVisible()
    await expect(page.getByTestId('directors-section')).toBeVisible()
    await expect(page.getByTestId('manage-directors')).toBeVisible()
  })

  test('should show the not-allowed modal for a non-corp legal type', async ({ page }) => {
    await setupChangeOfDirectorsPage(page, identifier, OTCDR, 'PREMIUM', {
      businessOverrides: [{ key: 'legalType', value: 'SP' }]
    })
    await navigateToChangeOfDirectorsPage(page, identifier)

    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expect(modal).toContainText('Page not available')
    await expect(page).toHaveURL(/.*change-of-directors.*/)
  })
})
