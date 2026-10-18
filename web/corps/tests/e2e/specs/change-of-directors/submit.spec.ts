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

function waitForFilingPost(page: Page) {
  return page.waitForRequest(
    req => req.url().includes(`/businesses/${identifier}/filings`) && req.method() === 'POST',
    { timeout: 10000 }
  )
}

function waitForFilingPut(page: Page, id: string) {
  return page.waitForRequest(
    req => req.url().includes(`/businesses/${identifier}/filings/${id}`) && req.method() === 'PUT',
    { timeout: 10000 }
  )
}

async function assertFinalRedirect(page: Page) {
  await page.waitForURL(
    `${process.env.NUXT_PUBLIC_BUSINESS_DASHBOARD_URL}**`,
    { timeout: 10000, waitUntil: 'commit' }
  )
  expect(page.url()).toContain(`${process.env.NUXT_PUBLIC_BUSINESS_DASHBOARD_URL}${identifier}`)
}

test.describe('Change of Directors - Filing Submit', () => {
  test('submits a non-staff filing with certify and correct payload shape', async ({ page }) => {
    await gotoCodPage(page)

    // Set a COD date
    await page.getByTestId('cod-date-input').fill('2026-02-15')
    // Make a director change (cease first director)
    await page.getByTestId('manage-directors').getByRole('button', { name: /cease/i }).first().click()
    await page.getByRole('checkbox', { name: /i certify/i }).check()

    const submitRequest = waitForFilingPost(page)
    await page.getByRole('button', { name: 'Submit' }).click()
    const request = await submitRequest
    const body = request.postDataJSON()

    expect(body.filing.changeOfDirectors).toBeDefined()
    expect(body.filing.changeOfDirectors.relationships).toBeDefined()
    expect(body.filing.header.certifiedBy).toBeTruthy()
    expect(request.url()).not.toContain('draft=true')

    await assertFinalRedirect(page)
  })

  test('submits a staff filing with authorization', async ({ page }) => {
    await gotoCodPage(page, 'STAFF')

    await page.getByTestId('cod-date-input').fill('2026-02-15')
    await page.getByTestId('manage-directors').getByRole('button', { name: /cease/i }).first().click()
    await page.getByRole('checkbox', { name: /i confirm that the information/i }).check()

    const submitRequest = waitForFilingPost(page)
    await page.getByRole('button', { name: 'Submit' }).click()
    const request = await submitRequest
    const body = request.postDataJSON()

    expect(body.filing.changeOfDirectors).toBeDefined()
    expect(body.filing.header.authorizationReceived).toBe(true)
    expect(body.filing.header.staffPaymentOption).toBeUndefined()

    await assertFinalRedirect(page)
  })

  test.describe('Save and resume', () => {
    test('saves a draft when COD date is set', async ({ page }) => {
      await gotoCodPage(page)

      await page.getByTestId('cod-date-input').fill('2026-02-15')
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
      expect(body.filing.header.certifiedBy).toBeTruthy()
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
      await page.getByTestId('cod-date-input').fill('2026-02-15')
      await page.waitForTimeout(200)

      const saveRequest = waitForFilingPut(page, draftId)
      await page.getByRole('button', { name: 'Save and Resume Later' }).click()
      const request = await saveRequest

      expect(request.url()).toContain('draft=true')
    })
  })
})
