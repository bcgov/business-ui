import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { setupCorrectionPage, navigateToCorrectionPage } from '../../test-utils'
import { CRCTN, CRCTN_NO_FEE } from '~~/tests/mocks'

const identifier = 'BC1234567'
const filingId = '999001'
const nameTranslationsMock = {
  aliases: [
    { id: '1001', type: 'TRANSLATION', name: 'Nom Entreprise' },
    { id: '1002', type: 'TRANSLATION', name: 'Raison Sociale' }
  ]
}

async function mockNameTranslations(page: Page, businessIdentifier: string, aliasesJSON = nameTranslationsMock) {
  await page.route(`**/api/v2/businesses/${businessIdentifier}/aliases`, async (route) => {
    await route.fulfill({ json: aliasesJSON })
  })
}

/** Edit a director's address inline and wait for the form to close (CI-resilient). */
async function makeDirectorEdit(page: Page, fillValue: string) {
  const directors = page.getByTestId('current-directors-section').locator('tbody')
  const rowToEdit = directors.locator('tr').first()
  const streetInput = directors.getByTestId('mailing-address-input-streetAdditional')
  await rowToEdit.getByRole('button', { name: 'Correct' }).click()
  await expect(streetInput).toBeVisible()
  await expect(async () => {
    if (await streetInput.isVisible()) {
      await streetInput.fill(fillValue)
      await directors.getByRole('button', { name: 'Done' }).click()
    }
    await expect(streetInput).not.toBeVisible()
  }).toPass({ timeout: 15000 })
}

async function assertCommonElements(page: Page) {
  await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })
  // has auth header
  await expect(page.getByTestId('connect-header-wrapper')).toBeVisible()
  // has breadcrumb
  await expect(page.getByTestId('connect-breadcrumb-wrapper')).toBeVisible()
  await expect(page.getByTestId('connect-breadcrumb-wrapper').getByText('Correction')).toBeVisible()
  // has tombstone
  await expect(page.getByTestId('connect-tombstone-wrapper')).toBeVisible()
  await expect(page.getByTestId('connect-tombstone-wrapper')
    .getByText('MCELROY ENTERPRISES LTD. - QA_IMPORT_TEST')
  ).toBeVisible()
  // has heading
  await expect(page.getByRole('heading', { name: 'Correction', exact: true })).toBeVisible()
  // has fee summary
  await expect(page.getByTestId('fee-widget')).toBeVisible()
  await expect(page.getByTestId('fee-widget').getByText('Correction')).toBeVisible()
  // has buttons
  await expect(page.getByTestId('connect-button-control')).toBeVisible()
  // has footer
  await expect(page.getByTestId('connect-main-footer')).toBeVisible()
}

async function assertStep1Sections(page: Page) {
  // has name translations section
  await expect(page.getByTestId('name-translations-section')).toBeVisible()
  // has office addresses section
  await expect(page.getByTestId('office-addresses-section')).toBeVisible()
  // has directors section
  await expect(page.getByTestId('current-directors-section')).toBeVisible()
  // has share structure section
  await expect(page.getByTestId('share-structure-section')).toBeVisible()
  // has receivers section
  await expect(page.getByTestId('receivers-section')).toBeVisible()
  // has liquidators section
  await expect(page.getByTestId('liquidators-section')).toBeVisible()
  // correction comment section should NOT be on step 1 (it's on step 2)
  await expect(page.getByTestId('correction-comment-section')).not.toBeVisible()
}

async function assertCorrectOffices(page: Page) {
  const section = page.getByTestId('office-addresses-section')
  const tbody = section.locator('tbody')
  await expect(tbody).toContainText('Registered Office')
  await expect(tbody).toContainText('Records Office')

  const rows = tbody.locator('tr')
  await expect(rows).toHaveCount(2)
}

async function assertCorrectDirectors(page: Page) {
  const section = page.getByTestId('current-directors-section')
  const tbody = section.locator('tbody')

  const rows = tbody.locator('tr')
  await expect(rows).toHaveCount(3)
}

test.describe('Correction - Page init', () => {
  test.describe('Staff correction (no fee)', () => {
    test('should display basic filing elements for staff', async ({ page }) => {
      await setupCorrectionPage(page, identifier, filingId, CRCTN_NO_FEE, 'STAFF', 'STAFF')
      await navigateToCorrectionPage(page, identifier, filingId)
      await page.waitForLoadState('networkidle')

      await assertCommonElements(page)
      await assertStep1Sections(page)
      await assertCorrectOffices(page)
      await assertCorrectDirectors(page)

      // Staff correction should show No Fee
      await expect(page.getByTestId('fee-widget').getByText('No Fee')).toBeVisible()
    })
  })

  test.describe('Client correction ($20 fee)', () => {
    test('should display basic filing elements for client correction', async ({ page }) => {
      await setupCorrectionPage(page, identifier, filingId, CRCTN, 'STAFF', 'CLIENT')
      await navigateToCorrectionPage(page, identifier, filingId)
      await page.waitForLoadState('networkidle')

      await assertCommonElements(page)
      await assertStep1Sections(page)
      await assertCorrectOffices(page)
      await assertCorrectDirectors(page)
    })
  })

  test.describe('Step navigation', () => {
    test('should block navigation to step 2 when no changes are made', async ({ page }) => {
      await setupCorrectionPage(page, identifier, filingId, CRCTN_NO_FEE, 'STAFF', 'STAFF')
      await navigateToCorrectionPage(page, identifier, filingId)
      await page.waitForLoadState('networkidle')

      await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

      // Attempt to navigate to step 2 without making changes
      await page.getByRole('button', { name: 'Review and Confirm' }).click()

      // Should show the "no changes" alert and stay on step 1
      await expect(page.getByTestId('connect-button-control')).toContainText('There are no changes to submit.')
      await expect(page.getByTestId('office-addresses-section')).toBeVisible()
    })

    test('should navigate to step 2 after making changes', async ({ page }) => {
      await setupCorrectionPage(page, identifier, filingId, CRCTN_NO_FEE, 'STAFF', 'STAFF')
      await navigateToCorrectionPage(page, identifier, filingId)
      await page.waitForLoadState('networkidle')

      await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

      // Edit a director's address to create a change
      await makeDirectorEdit(page, 'Corrected Unit')

      // Navigate to step 2
      await page.getByRole('button', { name: 'Review and Confirm' }).click()

      // Should be on step 2 — review section visible
      await expect(page.getByTestId('review-section')).toBeVisible({ timeout: 10000 })
      // Correction comment section should be on step 2
      await expect(page.getByTestId('correction-comment-section')).toBeVisible()
      // Step 1 sections should be hidden
      await expect(page.getByTestId('office-addresses-section')).not.toBeVisible()
    })

    test('should show step 2 review sections only for changed data', async ({ page }) => {
      await setupCorrectionPage(page, identifier, filingId, CRCTN_NO_FEE, 'STAFF', 'STAFF')
      await navigateToCorrectionPage(page, identifier, filingId)
      await page.waitForLoadState('networkidle')

      await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

      // Only edit a director
      await makeDirectorEdit(page, 'Corrected Unit')

      await page.getByRole('button', { name: 'Review and Confirm' }).click()

      // Directors should be visible in review
      await expect(page.getByTestId('review-current-directors-section')).toBeVisible({ timeout: 10000 })

      // Offices and share structure should NOT be visible (no changes made)
      await expect(page.getByTestId('review-office-addresses-section')).not.toBeVisible()
      await expect(page.getByTestId('review-share-structure-section')).not.toBeVisible()
      await expect(page.getByTestId('review-receivers-section')).not.toBeVisible()
      await expect(page.getByTestId('review-liquidators-section')).not.toBeVisible()
    })

    test('should show completing party on step 2 for client corrections', async ({ page }) => {
      await setupCorrectionPage(page, identifier, filingId, CRCTN, 'STAFF', 'CLIENT')
      await navigateToCorrectionPage(page, identifier, filingId)
      await page.waitForLoadState('networkidle')

      await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

      // Make a change to navigate to step 2
      await makeDirectorEdit(page, 'Corrected Unit')

      await page.getByRole('button', { name: 'Review and Confirm' }).click()

      // Completing party and certify should be visible for client corrections
      await expect(page.getByTestId('completing-party-section')).toBeVisible({ timeout: 10000 })
      await expect(page.getByTestId('certify-section')).toBeVisible()
      // Staff payment is always present
      await expect(page.getByTestId('staff-payment-section')).toBeVisible()
    })

    test('should show staff payment on step 2 for staff users', async ({ page }) => {
      await setupCorrectionPage(page, identifier, filingId, CRCTN_NO_FEE, 'STAFF', 'STAFF')
      await navigateToCorrectionPage(page, identifier, filingId)
      await page.waitForLoadState('networkidle')

      await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

      // Make a change so we can navigate to step 2
      await makeDirectorEdit(page, 'Corrected Unit')

      await page.getByRole('button', { name: 'Review and Confirm' }).click()

      // Staff payment section visible
      await expect(page.getByTestId('staff-payment-section')).toBeVisible({ timeout: 10000 })
      // Client-only sections not visible
      await expect(page.getByTestId('completing-party-section')).not.toBeVisible()
      await expect(page.getByTestId('certify-section')).not.toBeVisible()
    })
  })

  test.describe('Name translations', () => {
    test('should load and display name translations from aliases API', async ({ page }) => {
      await setupCorrectionPage(page, identifier, filingId, CRCTN_NO_FEE, 'STAFF', 'STAFF')
      await mockNameTranslations(page, identifier)
      await navigateToCorrectionPage(page, identifier, filingId)
      await page.waitForLoadState('networkidle')

      await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

      const section = page.getByTestId('name-translations-section')
      const tbody = section.locator('tbody')

      await expect(section).toBeVisible()
      await expect(tbody).toContainText('Nom Entreprise')
      await expect(tbody).toContainText('Raison Sociale')
      await expect(tbody.locator('tr')).toHaveCount(2)
    })
  })

  test.describe('Action labels', () => {
    test('should display "Correct" instead of "Change" for action buttons', async ({ page }) => {
      await setupCorrectionPage(page, identifier, filingId, CRCTN_NO_FEE, 'STAFF', 'STAFF')
      await navigateToCorrectionPage(page, identifier, filingId)
      await page.waitForLoadState('networkidle')

      await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

      // Directors section should have "Correct" buttons, not "Change"
      const directors = page.getByTestId('current-directors-section')
      await expect(directors.getByRole('button', { name: 'Correct' }).first()).toBeVisible()
      await expect(directors.getByRole('button', { name: 'Change' })).not.toBeVisible()

      // Offices section should have "Correct" buttons, not "Change"
      const offices = page.getByTestId('office-addresses-section')
      await expect(offices.getByRole('button', { name: 'Correct' }).first()).toBeVisible()
      await expect(offices.getByRole('button', { name: 'Change' })).not.toBeVisible()
    })
  })

  test.describe('Step 2 review sections', () => {
    test('should show review sections as readonly with no action buttons', async ({ page }) => {
      await setupCorrectionPage(page, identifier, filingId, CRCTN_NO_FEE, 'STAFF', 'STAFF')
      await navigateToCorrectionPage(page, identifier, filingId)
      await page.waitForLoadState('networkidle')
      await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

      // Edit a director to create a change
      await makeDirectorEdit(page, 'Review Test')

      await page.getByRole('button', { name: 'Review and Confirm' }).click()

      // Review director section should be visible but in readonly mode (no Correct/Change buttons)
      const reviewDirectors = page.getByTestId('review-current-directors-section')
      await expect(reviewDirectors).toBeVisible({ timeout: 10000 })
      await expect(reviewDirectors.getByRole('button', { name: 'Correct' })).not.toBeVisible()
      await expect(reviewDirectors.getByRole('button', { name: 'Change' })).not.toBeVisible()
      await expect(reviewDirectors.getByRole('button', { name: 'Remove' })).not.toBeVisible()
    })

    test('should not show no-changes alert when changes exist', async ({ page }) => {
      await setupCorrectionPage(page, identifier, filingId, CRCTN_NO_FEE, 'STAFF', 'STAFF')
      await navigateToCorrectionPage(page, identifier, filingId)
      await page.waitForLoadState('networkidle')
      await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

      // Edit a director to create a change
      await makeDirectorEdit(page, 'Change Test')

      await page.getByRole('button', { name: 'Review and Confirm' }).click()
      await expect(page.getByTestId('review-section')).toBeVisible({ timeout: 10000 })

      // No-changes alert should NOT be visible when changes exist
      await expect(page.getByTestId('no-changes-alert')).not.toBeVisible()
    })
  })
})
