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

async function gotoCodPage(page: Page, accountType: 'STAFF' | 'PREMIUM' = 'PREMIUM') {
  await setupChangeOfDirectorsPage(page, identifier, OTCDR, accountType)
  await navigateToChangeOfDirectorsPage(page, identifier)
  await page.waitForLoadState('networkidle')
  await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })
}

function waitForFilingPut(page: Page, id: string) {
  return page.waitForRequest(
    req => req.url().includes(`/businesses/${identifier}/filings/${id}`) && req.method() === 'PUT',
    { timeout: 10000 }
  )
}

test.describe('Change of Directors - Filing Submit', () => {
  test.describe('Save and resume', () => {
    test('saves a draft when COD date is set', async ({ page }) => {
      await gotoCodPage(page)

      await page.getByLabel('Director Change Date').fill('2026-02-15')
      // allow the debounced 'hasChanges' watcher to register the edits
      await page.waitForTimeout(200)

      const saveRequest = page.waitForRequest(
        req => req.url().includes(`/businesses/${identifier}/filings`) && req.method() === 'POST',
        { timeout: 10000 }
      )
      await page.getByRole('button', { name: 'Save and Resume Later' }).click()
      const request = await saveRequest

      expect(request.url()).toContain('draft=true')
      const body = request.postDataJSON()
      // certifiedBy is intentionally removed by applyAuthorizationCertify (API reads it from JWT)
      expect(body.filing.header.name).toBe('changeOfDirectors')
      expect(body.filing.changeOfDirectors).toBeDefined()
    })

    test('updates an existing draft when resuming', async ({ page }) => {
      await setupChangeOfDirectorsPageWithDraft(page, identifier, draftId, OTCDR, 'PREMIUM', {
        header: { effectiveDate: '2026-01-10T08:00:00+00:00' }
      })
      await navigateToChangeOfDirectorsPage(page, identifier, draftId)
      await page.waitForLoadState('networkidle')
      await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

      // update the COD date
      await page.getByLabel('Director Change Date').fill('2026-02-15')
      await page.waitForTimeout(200)

      const saveRequest = waitForFilingPut(page, draftId)
      await page.getByRole('button', { name: 'Save and Resume Later' }).click()
      const request = await saveRequest

      expect(request.url()).toContain('draft=true')
      const body = request.postDataJSON()
      expect(body.filing.header.name).toBe('changeOfDirectors')
    })
  })

  test.describe('Form validation', () => {
    test('requires a COD date before submission is possible', async ({ page }) => {
      await gotoCodPage(page)

      // try to submit without a date
      await page.getByRole('checkbox', { name: /i certify/i }).check()
      await page.getByRole('button', { name: 'Submit' }).click()

      // form validation should show date required error
      await expect(page.getByText('Director change date is required.')).toBeVisible()
    })

    test('shows authorization section for staff and does not show certify', async ({ page }) => {
      await gotoCodPage(page, 'STAFF')

      await expect(page.getByTestId('form-section-authorization')).toBeVisible()
      await expect(page.getByTestId('form-section-certify')).not.toBeVisible()
    })
  })
})
