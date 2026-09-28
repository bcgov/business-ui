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

async function gotoAgmPage(page: Page, accountType: 'STAFF' | 'PREMIUM' = 'PREMIUM') {
  await setupAgmLocationChangePage(page, identifier, AGMLC, accountType)
  await navigateToAgmLocationChangePage(page, identifier)
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

test.describe('AGM Location Change - Filing Submit', () => {
  test('submits a new filing with all fields and correct payload shape', async ({ page }) => {
    await gotoAgmPage(page)

    await page.getByLabel('AGM Year').fill('2025')
    await page.getByLabel('Reason').fill('Shareholders are located outside BC.')
    await page.getByLabel('AGM Location', { exact: true }).fill('Calgary, Alberta, Canada')
    await page.getByRole('checkbox', { name: /i certify/i }).check()

    const submitRequest = waitForFilingPost(page)
    await page.getByRole('button', { name: 'Submit' }).click()
    const request = await submitRequest
    const body = request.postDataJSON()

    expect(body.filing.agmLocationChange).toEqual({
      year: '2025',
      reason: 'Shareholders are located outside BC.',
      agmLocation: 'Calgary, Alberta, Canada'
    })
    expect(body.filing.header.certifiedBy).toBeTruthy()
    expect(request.url()).not.toContain('draft=true')

    await assertFinalRedirect(page)
  })

  test('submits a staff filing with authorization and no staff payment fields', async ({ page }) => {
    await gotoAgmPage(page, 'STAFF')

    await page.getByLabel('AGM Year').fill('2025')
    await page.getByLabel('Reason').fill('Staff authorization submission.')
    await page.getByLabel('AGM Location', { exact: true }).fill('Seattle, Washington, USA')
    await page.getByRole('checkbox', { name: /i confirm that the information/i }).check()

    const submitRequest = waitForFilingPost(page)
    await page.getByRole('button', { name: 'Submit' }).click()
    const request = await submitRequest
    const body = request.postDataJSON()

    expect(body.filing.agmLocationChange).toEqual({
      year: '2025',
      reason: 'Staff authorization submission.',
      agmLocation: 'Seattle, Washington, USA'
    })
    expect(body.filing.header.staffPaymentOption).toBeUndefined()
    expect(body.filing.header.waiveFees).toBeUndefined()

    await assertFinalRedirect(page)
  })

  test.describe('Save and resume', () => {
    test('saves a draft and still includes certifiedBy', async ({ page }) => {
      await gotoAgmPage(page)

      await page.getByLabel('AGM Year').fill('2025')
      await page.getByLabel('Reason').fill('Draft reason for save.')
      await page.getByLabel('AGM Location', { exact: true }).fill('Vancouver, British Columbia, Canada')
      // allow the debounced 'hasChanges' watcher to register the edits before saving
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
      expect(body.filing.agmLocationChange.year).toBe('2025')
      expect(body.filing.agmLocationChange.reason).toBe('Draft reason for save.')
      expect(body.filing.agmLocationChange.agmLocation).toBe('Vancouver, British Columbia, Canada')
    })

    test('updates an existing draft when resuming', async ({ page }) => {
      await setupAgmLocationChangePageWithDraft(page, identifier, draftId, AGMLC, 'PREMIUM', {
        agmLocationChange: {
          year: '2024',
          reason: 'Original draft reason.',
          agmLocation: 'Toronto, Ontario, Canada'
        }
      })
      await navigateToAgmLocationChangePage(page, identifier, draftId)
      await page.waitForLoadState('networkidle')
      await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

      // update a field
      await page.getByLabel('Reason').fill('Updated draft reason.')
      await page.waitForTimeout(200)

      const saveRequest = waitForFilingPut(page, draftId)
      await page.getByRole('button', { name: 'Save and Resume Later' }).click()
      const request = await saveRequest

      expect(request.url()).toContain('draft=true')
      const body = request.postDataJSON()
      expect(body.filing.agmLocationChange.reason).toBe('Updated draft reason.')
    })
  })
})
