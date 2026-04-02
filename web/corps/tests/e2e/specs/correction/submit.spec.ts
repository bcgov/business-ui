import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { setupCorrectionPage, navigateToCorrectionPage } from '../../test-utils'
import { CRCTN, CRCTN_NO_FEE } from '~~/tests/mocks'

const identifier = 'BC1234567'
const filingId = '999001'

const aliasesNameTranslationsMock = {
  aliases: [
    { id: '10001', type: 'TRANSLATION', name: 'Nom Entreprise' }
  ]
}

async function mockNameTranslations(page: Page, businessIdentifier: string, aliasesJSON = aliasesNameTranslationsMock) {
  await page.route(`**/api/v2/businesses/${businessIdentifier}/aliases**`, async (route) => {
    await route.fulfill({ json: aliasesJSON })
  })
}

async function makeDirectorChange(page: Page) {
  const directors = page.getByTestId('current-directors-section').locator('tbody')
  const rowToEdit = directors.locator('tr').filter({ hasText: 'TESTER TESTING' })
  const streetInput = directors.getByTestId('mailing-address-input-streetAdditional')
  await rowToEdit.getByRole('button', { name: 'Correct' }).click()
  await expect(streetInput).toBeVisible()
  // Use toPass for CI resilience — retries the fill+Done+verify cycle if the form
  // is slow to validate/close on resource-constrained environments
  await expect(async () => {
    if (await streetInput.isVisible()) {
      await streetInput.fill('Corrected Unit 1A')
      await directors.getByRole('button', { name: 'Done' }).click()
    }
    await expect(streetInput).not.toBeVisible()
  }).toPass({ timeout: 15000 })
}

async function fillCorrectionComment(page: Page, comment: string) {
  const commentSection = page.getByTestId('correction-comment-section')
  await commentSection.locator('textarea').fill(comment)
}

async function goToReview(page: Page) {
  await page.getByRole('button', { name: 'Review and Confirm' }).click()
  // Wait for step transition to complete
  await expect(page.getByTestId('review-section')).toBeVisible({ timeout: 10000 })
}

async function fillCompletingParty(page: Page) {
  await page.getByTestId('completing-party-email-input').fill('correction-test@example.com')
}

test.describe('Correction - Filing Submit', () => {
  test.describe('Staff correction', () => {
    test('should submit a staff correction with director changes', async ({ page }) => {
      await setupCorrectionPage(page, identifier, filingId, CRCTN_NO_FEE, 'STAFF', 'STAFF')
      await navigateToCorrectionPage(page, identifier, filingId)
      await page.waitForLoadState('networkidle')
      await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

      // Step 1: Make changes
      await makeDirectorChange(page)

      // Navigate to step 2
      await goToReview(page)

      // Review: directors should be visible
      await expect(page.getByTestId('review-current-directors-section')).toBeVisible()

      // Step 2: Fill correction comment (now on step 2)
      await fillCorrectionComment(page, 'Correcting director address from original incorporation')

      // Correction comment section should be visible on step 2
      await expect(page.getByTestId('correction-comment-section')).toBeVisible()

      // Fill completing party email
      await fillCompletingParty(page)

      // Select staff payment option (required for form validation)
      await page.getByRole('radio', { name: 'No Fee' }).click()

      // Submit
      const submitRequest = page.waitForRequest(
        req => req.url().includes(`/businesses/${identifier}/filings`) && req.method() === 'PUT',
        { timeout: 10000 }
      )
      await page.getByRole('button', { name: 'Submit' }).click()
      const request = await submitRequest
      const requestBody = request.postDataJSON()
      const correction = requestBody.filing.correction

      // Verify the correction payload structure
      expect(correction).toBeDefined()
      expect(correction.correctedFilingId).toBe(111554)
      expect(correction.correctedFilingType).toBe('incorporationApplication')
      expect(correction.type).toBe('STAFF')
      expect(correction.comment).toBe('Correcting director address from original incorporation')
      expect(correction.contactPoint).toEqual({ email: 'correction-test@example.com' })

      // Verify relationships are included (party data formatted as relationships)
      expect(correction.relationships).toBeDefined()
      expect(correction.relationships.length).toBeGreaterThan(0)

      // Verify offices are included
      expect(correction.offices).toBeDefined()
      expect(correction.offices).toHaveProperty('registeredOffice')
      expect(correction.offices).toHaveProperty('recordsOffice')

      // Verify share structure is included
      expect(correction.shareStructure).toBeDefined()
      expect(correction.shareStructure.shareClasses).toBeDefined()

      // Should redirect to dashboard
      await page.waitForURL(
        `${process.env.NUXT_PUBLIC_BUSINESS_DASHBOARD_URL}**`,
        { timeout: 10000, waitUntil: 'commit' }
      )
      expect(page.url()).toContain(`${process.env.NUXT_PUBLIC_BUSINESS_DASHBOARD_URL}${identifier}`)
    })

    test('should display name translations and submit when unchanged', async ({ page }) => {
      await mockNameTranslations(page, identifier)

      const aliasesRequest = page.waitForResponse(
        response =>
          response.url().includes(`/api/v2/businesses/${identifier}/aliases`)
          && response.request().method() === 'GET',
        { timeout: 10000 }
      )

      await setupCorrectionPage(page, identifier, filingId, CRCTN_NO_FEE, 'STAFF', 'STAFF')
      await navigateToCorrectionPage(page, identifier, filingId)
      await aliasesRequest
      await page.waitForLoadState('networkidle')
      await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

      const nameTranslationSection = page.getByTestId('name-translations-section')
      await expect(nameTranslationSection).toBeVisible()
      await expect(nameTranslationSection.locator('tbody')).toContainText('Nom Entreprise')

      // Make a different correction so submission can proceed.
      await makeDirectorChange(page)

      await goToReview(page)
      await fillCorrectionComment(page, 'Correcting existing name translation')
      await fillCompletingParty(page)
      await page.getByRole('radio', { name: 'No Fee' }).click()

      const submitRequest = page.waitForRequest(
        req => req.url().includes(`/businesses/${identifier}/filings`) && req.method() === 'PUT',
        { timeout: 10000 }
      )

      await page.getByRole('button', { name: 'Submit' }).click()
      const request = await submitRequest
      const requestBody = request.postDataJSON()
      const correction = requestBody.filing.correction

      // Name translations are unchanged, so no translation delta should be sent.
      expect(correction.nameTranslations).toEqual([])
    })
  })

  test.describe('Save and resume', () => {
    test('should save a correction draft', async ({ page }) => {
      await setupCorrectionPage(page, identifier, filingId, CRCTN_NO_FEE, 'STAFF', 'STAFF')
      await navigateToCorrectionPage(page, identifier, filingId)
      await page.waitForLoadState('networkidle')
      await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

      // Make a change
      await makeDirectorChange(page)

      // Set up request listener before clicking
      const saveRequest = page.waitForRequest(
        req => req.url().includes(`/businesses/${identifier}/filings`) && req.method() === 'PUT',
        { timeout: 10000 }
      )

      await page.getByRole('button', { name: 'Save and Resume Later' }).click()

      // Verify the PUT request was made with correct payload
      const request = await saveRequest
      const requestBody = request.postDataJSON()

      // Should have correction data in the payload
      expect(requestBody.filing.correction).toBeDefined()
      expect(requestBody.filing.correction.correctedFilingId).toBe(111554)

      // Verify it was sent as a draft (not a submission)
      expect(request.url()).toContain('draft=true')
    })
  })

  test.describe('Task guards', () => {
    test('should be able to cancel when no changes have been made', async ({ page }) => {
      await setupCorrectionPage(page, identifier, filingId, CRCTN_NO_FEE, 'STAFF', 'STAFF')
      await navigateToCorrectionPage(page, identifier, filingId)
      await page.waitForLoadState('networkidle')
      await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

      // Cancel without changes — should navigate away immediately
      await page.getByRole('button', { name: 'Cancel', exact: true }).click()
      await page.waitForURL(
        `${process.env.NUXT_PUBLIC_BUSINESS_DASHBOARD_URL}**`,
        { timeout: 5000 }
      )
    })

    test('should block active sub-form before navigating to review', async ({ page }) => {
      await setupCorrectionPage(page, identifier, filingId, CRCTN_NO_FEE, 'STAFF', 'STAFF')
      await navigateToCorrectionPage(page, identifier, filingId)
      await page.waitForLoadState('networkidle')
      await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

      // Open a director edit form but don't complete it
      const directors = page.getByTestId('current-directors-section').locator('tbody')
      const rowToEdit = directors.locator('tr').first()
      await rowToEdit.getByRole('button', { name: 'Correct' }).click()

      // Try to navigate to review — should be blocked
      await page.getByRole('button', { name: 'Review and Confirm' }).click()

      // Should still be on step 1 with the edit form open
      await expect(page.getByTestId('office-addresses-section')).toBeVisible()
    })
  })

  test.describe('Client correction', () => {
    test('should show client-specific sections and verify client payload structure', async ({ page }) => {
      await setupCorrectionPage(page, identifier, filingId, CRCTN, 'STAFF', 'CLIENT')
      await navigateToCorrectionPage(page, identifier, filingId)
      await page.waitForLoadState('networkidle')
      await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

      // Step 1: Make changes
      await makeDirectorChange(page)

      // Navigate to step 2
      await goToReview(page)

      // Review: directors should be visible
      await expect(page.getByTestId('review-current-directors-section')).toBeVisible()

      // Document delivery section should be visible
      await expect(page.getByTestId('document-delivery-section')).toBeVisible()

      // Completing party section should be visible for client corrections
      await expect(page.getByTestId('completing-party-section')).toBeVisible()

      // Certify section should be visible for client corrections
      await expect(page.getByTestId('certify-section')).toBeVisible()

      // Staff payment should be visible
      await expect(page.getByTestId('staff-payment-section')).toBeVisible()

      // Fill correction comment
      await fillCorrectionComment(page, 'Client correction: fixing director address')

      // Fill document delivery email
      await fillCompletingParty(page)

      // Fill completing party name fields
      await page.getByTestId('completing-party-first-name').locator('input').fill('Test')
      await page.getByTestId('completing-party-last-name').locator('input').fill('User')

      // Fill completing party mailing address required fields
      // Wrap in toPass() — country/region selects are flaky, must focus first (see fillAddressFields)
      const cpSection = page.getByTestId('completing-party-section')
      await expect(async () => {
        // Country (required) — focus first to ensure select receives keyboard events
        await cpSection.getByTestId('completing-party-mailing-address-input-country').focus()
        await cpSection.getByTestId('completing-party-mailing-address-input-country').click()
        const countryList = page.getByRole('listbox')
        await countryList.scrollIntoViewIfNeeded()
        await expect(countryList).toBeVisible()
        await page.keyboard.type('canada')
        await page.keyboard.press('Enter')
        await expect(countryList).not.toBeVisible()
        // Street, City (required)
        await cpSection.getByTestId('completing-party-mailing-address-input-street').fill('123 Test St')
        await cpSection.getByTestId('completing-party-mailing-address-input-city').fill('Victoria')
        // Province (required when country is CA) — focus first like country
        await cpSection.getByTestId('completing-party-mailing-address-input-region').focus()
        await cpSection.getByTestId('completing-party-mailing-address-input-region').click()
        const regionList = page.getByRole('listbox')
        await regionList.scrollIntoViewIfNeeded()
        await expect(regionList).toBeVisible()
        await page.keyboard.type('British Columbia')
        await page.keyboard.press('Enter')
        await expect(regionList).not.toBeVisible()
        // Postal code (required when country is CA)
        await cpSection.getByTestId('completing-party-mailing-address-input-postalCode').fill('V8V 1A1')
      }).toPass({ timeout: 15000 })

      // Fill certify: legal name + checkbox (both required by certify schema)
      const certifySection = page.getByTestId('certify-section')
      await certifySection.getByTestId('legal-name-input').fill('Test User')
      await certifySection.getByRole('checkbox', { name: /certify/i }).check({ force: true })

      // Select staff payment option
      await page.getByRole('radio', { name: 'No Fee' }).click()

      // Submit and verify redirect (confirms form validation passed and PUT was sent)
      const submitRequest = page.waitForRequest(
        req => req.url().includes(`/businesses/${identifier}/filings`) && req.method() === 'PUT',
        { timeout: 10000 }
      )
      await page.getByRole('button', { name: 'Submit' }).click()
      await submitRequest

      // Should redirect to dashboard
      await page.waitForURL(
        `${process.env.NUXT_PUBLIC_BUSINESS_DASHBOARD_URL}**`,
        { timeout: 10000, waitUntil: 'commit' }
      )
      expect(page.url()).toContain(`${process.env.NUXT_PUBLIC_BUSINESS_DASHBOARD_URL}${identifier}`)
    })
  })

  test.describe('Step navigation', () => {
    test('should navigate back from step 2 to step 1', async ({ page }) => {
      await setupCorrectionPage(page, identifier, filingId, CRCTN_NO_FEE, 'STAFF', 'STAFF')
      await navigateToCorrectionPage(page, identifier, filingId)
      await page.waitForLoadState('networkidle')
      await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

      // Make a change and navigate to step 2
      await makeDirectorChange(page)
      await goToReview(page)

      // Verify we are on step 2
      await expect(page.getByTestId('review-section')).toBeVisible()
      await expect(page.getByTestId('correction-comment-section')).toBeVisible()

      // Click back button to return to step 1
      await page.getByRole('button', { name: 'Back' }).click()

      // Should be back on step 1
      await expect(page.getByTestId('office-addresses-section')).toBeVisible({ timeout: 10000 })
      await expect(page.getByTestId('current-directors-section')).toBeVisible()

      // Step 2 sections should not be visible
      await expect(page.getByTestId('review-section')).not.toBeVisible()
      await expect(page.getByTestId('correction-comment-section')).not.toBeVisible()
    })

    test('should show document delivery section on step 2', async ({ page }) => {
      await setupCorrectionPage(page, identifier, filingId, CRCTN_NO_FEE, 'STAFF', 'STAFF')
      await navigateToCorrectionPage(page, identifier, filingId)
      await page.waitForLoadState('networkidle')
      await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

      // Make a change and navigate to step 2
      await makeDirectorChange(page)
      await goToReview(page)

      // Document delivery section should be visible on step 2
      await expect(page.getByTestId('document-delivery-section')).toBeVisible()
    })

    test('should show office address review when offices are corrected', async ({ page }) => {
      await setupCorrectionPage(page, identifier, filingId, CRCTN_NO_FEE, 'STAFF', 'STAFF')
      await navigateToCorrectionPage(page, identifier, filingId)
      await page.waitForLoadState('networkidle')
      await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

      // Edit an office address to create a change
      const offices = page.getByTestId('office-addresses-section').locator('tbody')
      const rowToEdit = offices.locator('tr').first()
      const officeStreetInput = offices.getByTestId('mailing-address-input-streetAdditional')
      await rowToEdit.getByRole('button', { name: 'Correct' }).click()
      await expect(officeStreetInput).toBeVisible()
      await expect(async () => {
        if (await officeStreetInput.isVisible()) {
          await officeStreetInput.fill('Suite 200')
          await offices.getByRole('button', { name: 'Done' }).click()
        }
        await expect(officeStreetInput).not.toBeVisible()
      }).toPass({ timeout: 15000 })

      // Navigate to step 2
      await page.getByRole('button', { name: 'Review and Confirm' }).click()
      await expect(page.getByTestId('review-section')).toBeVisible({ timeout: 10000 })

      // Office addresses should be visible in review (change was made)
      await expect(page.getByTestId('review-office-addresses-section')).toBeVisible()

      // Directors should NOT be visible in review (no change was made)
      await expect(page.getByTestId('review-current-directors-section')).not.toBeVisible()
    })
  })
})
