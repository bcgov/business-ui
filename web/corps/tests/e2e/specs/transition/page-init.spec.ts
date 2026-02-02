import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { navigateToTransitionPage } from '../../test-utils'
import { mockCommonApiCallsForFiling, getBusinessAddressesMock, getPartiesMock } from '#test-mocks'
import { TRANP } from '~~/tests/mocks'

const identifier = 'BC1234567'

async function assertCorrectOffices(page: Page) {
  const section = page.getByTestId('office-addresses-section')
  const tbody = section.locator('tbody')
  await expect(tbody).toContainText('Registered Office')
  await expect(tbody).toContainText('Records Office')
  await expect(tbody).not.toContainText('Business Office')
  await expect(tbody).not.toContainText('Custodial Office')
  await expect(tbody).not.toContainText('Liquidation Records Office')

  const rows = tbody.locator('tr')
  await expect(rows).toHaveCount(2)

  const registeredRow = rows.filter({ hasText: 'Registered Office' })
  await expect(registeredRow).toContainText('1800 - 510 West Georgia Street')
  await expect(registeredRow).toContainText('Same as Delivery Address')

  // TODO: update mocks to be unique for each address? currently this second check is kinda useless
  // updating the mock will affect other tests currently relying on it
  const recordsRow = rows.filter({ hasText: 'Records Office' })
  await expect(recordsRow).toContainText('1800 - 510 West Georgia Street')
  await expect(recordsRow).toContainText('Same as Delivery Address')
}

async function assertCorrectDirectors(page: Page) {
  const section = page.getByTestId('current-directors-section')
  const tbody = section.locator('tbody')
  await expect(tbody).toContainText('TESTER TESTING')
  await expect(tbody).toContainText('WALLABY WAY')
  await expect(tbody).toContainText('MIHAI DINU TEST')

  const rows = tbody.locator('tr')
  await expect(rows).toHaveCount(3)
}

async function assertCommonElements(page: Page) {
  await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })
  // has auth header
  await expect(page.getByTestId('connect-header-wrapper')).toBeVisible()
  // has breadcrumb
  await expect(page.getByTestId('connect-breadcrumb-wrapper')).toBeVisible()
  await expect(page.getByTestId('connect-breadcrumb-wrapper').getByText(
    'Post Restoration Transition Application')).toBeVisible()
  // has tombstone
  await expect(page.getByTestId('connect-tombstone-wrapper')).toBeVisible()
  await expect(page.getByTestId('connect-tombstone-wrapper')
    .getByText('MCELROY ENTERPRISES LTD. - QA_IMPORT_TEST')
  ).toBeVisible()
  // has heading
  await expect(page.getByRole('heading', { name: 'Post Restoration Transition Application' })).toBeVisible()
  // has fee summary
  await expect(page.getByTestId('fee-widget')).toBeVisible()
  // has fee summary text
  await expect(page.getByTestId('fee-widget').getByText('Post Restoration Transition Application')).toBeVisible()
  await expect(page.getByTestId('fee-widget').getByText('No Fee')).toBeVisible()
  // has buttons
  await expect(page.getByTestId('connect-button-control')).toBeVisible()
  // has footer
  await expect(page.getByTestId('connect-main-footer')).toBeVisible()
  // has office addresses
  await expect(page.getByTestId('office-addresses-section')).toBeVisible()
  await assertCorrectOffices(page)
  // has directors
  await expect(page.getByTestId('current-directors-section')).toBeVisible()
  await assertCorrectDirectors(page)
  // has share structure
  await expect(page.getByTestId('share-structure-section')).toBeVisible()
  // has articles
  await expect(page.getByTestId('articles-section')).toBeVisible()
}

test.describe('Transition - Page init', () => {
  test.describe('Staff Only', () => {
    test.beforeEach(async ({ page }) => {
      await mockCommonApiCallsForFiling(
        page,
        identifier,
        getPartiesMock([
          { index: 0, key: 'roleType', value: 'Director' },
          { index: 1, key: 'roleType', value: 'Director' },
          { index: 2, key: 'roleType', value: 'Director' }
        ]),
        TRANP,
        getBusinessAddressesMock(),
        'STAFF'
      )
      await navigateToTransitionPage(page, identifier)
      await page.waitForLoadState('networkidle')
    })

    test('Page elements', async ({ page }) => {
      // step 1
      await assertCommonElements(page)
      // step 2
      await page.getByRole('button', { name: 'Review and Confirm' }).click()
      // should still have common elements
      await assertCommonElements(page)

      // common step 2 and staff only sections
      await expect(page.getByTestId('provisions-section')).toBeVisible()
      await expect(page.getByTestId('document-delivery-section')).toBeVisible()
      await expect(page.getByTestId('court-order-section')).toBeVisible()
      await expect(page.getByTestId('staff-payment-section')).toBeVisible()

      // client only which should not be visible
      await expect(page.getByTestId('folio-section')).not.toBeVisible()
      await expect(page.getByTestId('certify-section')).not.toBeVisible()
    })
  })

  test.describe('Client Only', () => {
    test.beforeEach(async ({ page }) => {
      await mockCommonApiCallsForFiling(
        page,
        identifier,
        getPartiesMock([
          { index: 0, key: 'roleType', value: 'Director' },
          { index: 1, key: 'roleType', value: 'Director' },
          { index: 2, key: 'roleType', value: 'Director' }
        ]),
        TRANP,
        getBusinessAddressesMock(),
        'PREMIUM'
      )
      await navigateToTransitionPage(page, identifier)
      await page.waitForLoadState('networkidle')
    })

    test('Page elements', async ({ page }) => {
      // step 1
      await assertCommonElements(page)
      // step 2
      await page.getByRole('button', { name: 'Review and Confirm' }).click()
      // should still have common elements
      await assertCommonElements(page)

      // common step 2 and staff only sections
      await expect(page.getByTestId('provisions-section')).toBeVisible()
      await expect(page.getByTestId('document-delivery-section')).toBeVisible()
      await expect(page.getByTestId('folio-section')).toBeVisible()
      await expect(page.getByTestId('certify-section')).toBeVisible()

      // staff only which should not be visible
      await expect(page.getByTestId('court-order-section')).not.toBeVisible()
      await expect(page.getByTestId('staff-payment-section')).not.toBeVisible()
    })
  })
})
