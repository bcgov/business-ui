import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import {
  fillLocationChangeDetail,
  goToReviewStep,
  selectAgmCountry,
  selectAgmRegion,
  selectAgmYear,
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
  await expect(page.getByTestId('connect-breadcrumb-wrapper')
    .getByText('Annual General Meeting (AGM) Location Change')).toBeVisible()
  // has tombstone
  await expect(page.getByTestId('connect-tombstone-wrapper')).toBeVisible()
  await expect(page.getByTestId('connect-tombstone-wrapper')
    .getByText('MCELROY ENTERPRISES LTD. - QA_IMPORT_TEST')).toBeVisible()
  // has heading
  await expect(page.getByRole('heading',
    { name: 'Annual General Meeting (AGM) Location Change', exact: true })).toBeVisible()
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

    const yearSelect = page.getByRole('combobox', { name: 'General Meeting Year' })
    await expect(yearSelect).toBeVisible()
    await expect(yearSelect).toHaveAttribute('data-placeholder', '')

    // Open the custom dropdown and verify that years are ordered newest first.
    await yearSelect.click()
    const yearOptions = await page.getByRole('option').allTextContents()
    const numericYears = yearOptions.map(year => Number(year))
    expect(numericYears).toEqual([...numericYears].sort((a, b) => b - a))
    await page.keyboard.press('Escape')

    await expect(page.getByLabel('Reason')).toBeVisible()
    await expect(page.getByLabel('Country')).toBeVisible()
    await expect(page.getByLabel('City')).toBeVisible()
    await expect(page.getByLabel('Province')).toBeVisible()

    // Certify is on the review step
    await expect(page.getByTestId('form-section-certify')).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Review and Confirm' })).toBeVisible()

    // Fields start empty
    await expect(page.getByRole('combobox', { name: 'General Meeting Year' })).toHaveAttribute('data-placeholder', '')
    await expect(page.getByLabel('Reason')).toHaveValue('')
    await expect(page.getByLabel('City')).toHaveValue('')
    // Country defaults to Canada; the city and region have no initial value.
    await expect(page.getByLabel('Country')).toHaveValue('Canada')
  })

  test('should display the review step with the details, folio and certify for non-staff', async ({ page }) => {
    await setupAgmLocationChangePage(page, identifier, AGMLC, 'PREMIUM')
    await navigateToAgmLocationChangePage(page, identifier)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

    await fillLocationChangeDetail(page, {
      year: '2025',
      reason: 'Shareholders are located outside BC.',
      agmLocation: {
        country: 'CA',
        city: 'Calgary',
        region: 'Alberta'
      }
    })
    await goToReviewStep(page)

    const detail = page.getByTestId('review-location-change-detail')
    await expect(detail).toContainText('2025')
    await expect(detail).toContainText('Shareholders are located outside BC.')
    await expect(detail).toContainText('Calgary, Alberta, Canada')

    // the business's folio on file is offered as the default
    const folioOption = page.getByTestId('folio-option')
    await expect(folioOption).toContainText('Use Default Folio or Reference Number: folio-1234')
    await expect(folioOption.getByRole('radio').first()).toBeChecked()
    await expect(page.getByTestId('folio-input')).not.toBeVisible()
    await expect(page.getByTestId('form-section-certify')).toBeVisible()
    await expect(page.getByTestId('form-section-authorization')).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'File and Pay' })).toBeVisible()
    // the design has no back or save buttons
    await expect(page.getByRole('button', { name: 'Back' })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Save and Resume Later' })).not.toBeVisible()
  })

  // no staff payment section - this filing has no fee
  test('should display authorization and folio on the review step for staff', async ({ page }) => {
    await setupAgmLocationChangePage(page, identifier, AGMLC, 'STAFF')
    await navigateToAgmLocationChangePage(page, identifier)
    await page.waitForLoadState('networkidle')

    await assertCommonElements(page)

    await expect(page.getByTestId('form-section-location-change-detail')).toBeVisible()
    await expect(page.getByTestId('form-section-authorization')).not.toBeVisible()

    await fillLocationChangeDetail(page, {
      year: '2025',
      reason: 'Staff authorization submission.',
      agmLocation: {
        country: 'US',
        city: 'Seattle',
        region: 'Washington'
      }
    })
    await goToReviewStep(page)

    await expect(page.getByTestId('review-location-change-detail'))
      .toContainText('Seattle, Washington, United States')
    await expect(page.getByTestId('form-section-authorization')).toBeVisible()
    await expect(page.getByTestId('folio-section')).toBeVisible()
    // Certify not visible for staff
    await expect(page.getByTestId('form-section-certify')).not.toBeVisible()
  })

  test('should hydrate AGM Location Change fields from a resumed draft', async ({ page }) => {
    await setupAgmLocationChangePageWithDraft(page, identifier, draftId, AGMLC, 'PREMIUM', {
      agmLocationChange: {
        year: '2025',
        reason: 'Shareholders are located outside BC.',
        agmLocation: {
          country: 'CA',
          city: 'Calgary',
          region: 'AB'
        }
      }
    })
    await navigateToAgmLocationChangePage(page, identifier, draftId)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

    await expect(page.getByRole('combobox', { name: 'General Meeting Year' })).toContainText('2025')
    await expect(page.getByLabel('Reason')).toHaveValue('Shareholders are located outside BC.')
    await expect(page.getByLabel('Country')).toHaveValue('Canada')
    await expect(page.getByLabel('City')).toHaveValue('Calgary')
    await expect(page.getByLabel('Province')).toContainText('Alberta')
  })

  test('should reset the region when the country changes', async ({ page }) => {
    await setupAgmLocationChangePage(page, identifier, AGMLC, 'PREMIUM')
    await navigateToAgmLocationChangePage(page, identifier)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

    await selectAgmCountry(page, 'CA')
    await selectAgmRegion(page, 'CA', 'Alberta')
    await expect(page.getByLabel('Province')).toContainText('Alberta')

    await selectAgmCountry(page, 'US')

    await expect(page.getByLabel('Province')).not.toBeVisible()
    await selectAgmRegion(page, 'US', 'Washington')
    await expect(page.getByTestId('agm-location-input-region')).toContainText('Washington')
  })

  test('should reject a region longer than two characters', async ({ page }) => {
    await setupAgmLocationChangePage(page, identifier, AGMLC, 'PREMIUM')
    await navigateToAgmLocationChangePage(page, identifier)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

    await selectAgmCountry(page, 'Mexico')
    await page.getByLabel('City').fill('Mexico City')
    await page.getByLabel('Region').fill('XYZ')
    await selectAgmYear(page, '2025')
    await page.getByLabel('Reason').fill('Region validation test.')

    await page.getByRole('button', { name: 'Review and Confirm' }).click()

    await expect(page.getByText('Please complete required information')).toBeVisible()
    await expect(page.getByRole('heading',
      { name: 'Annual General Meeting (AGM) Location Change', exact: true })).toBeVisible()
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
