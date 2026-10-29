import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import {
  fillLocationChangeDetail,
  goToReviewStep,
  setupAgmLocationChangePage,
  navigateToAgmLocationChangePage
} from '../../test-utils'
import { fillOutFolio } from '#business/tests/e2e/test-utils'
import { AGMLC } from '~~/tests/mocks'

const identifier = 'BC1234567'

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

async function assertFinalRedirect(page: Page) {
  await page.waitForURL(
    `${process.env.NUXT_PUBLIC_BUSINESS_DASHBOARD_URL}**`,
    { timeout: 10000, waitUntil: 'commit' }
  )
  expect(page.url()).toContain(`${process.env.NUXT_PUBLIC_BUSINESS_DASHBOARD_URL}${identifier}`)
}

test.describe('AGM Location Change - Filing Submit', () => {
  test('submits a new filing with structured Canadian AGM location', async ({ page }) => {
    await gotoAgmPage(page)

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
    await expect(page.getByTestId('review-location-change-detail'))
      .toContainText('Calgary, Alberta, Canada')
    await page.getByRole('checkbox', { name: /i certify/i }).check()

    const submitRequest = waitForFilingPost(page)
    await page.getByRole('button', { name: 'File and Pay' }).click()
    const request = await submitRequest
    const body = request.postDataJSON()

    expect(body.filing.agmLocationChange).toEqual({
      year: '2025',
      reason: 'Shareholders are located outside BC.',
      agmLocation: {
        country: 'CA',
        city: 'Calgary',
        region: 'AB'
      }
    })
    expect(body.filing.header.certifiedBy).toBeTruthy()
    // the business's default folio is filed unless a different one is entered
    expect(body.filing.header.folioNumber).toBe('folio-1234')
    expect(request.url()).not.toContain('draft=true')

    await assertFinalRedirect(page)
  })

  test('submits a staff filing with a structured US AGM location', async ({ page }) => {
    await gotoAgmPage(page, 'STAFF')

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
    await page.getByRole('checkbox', { name: /i confirm that the information/i }).check()

    const submitRequest = waitForFilingPost(page)
    await page.getByRole('button', { name: 'File and Pay' }).click()
    const request = await submitRequest
    const body = request.postDataJSON()

    expect(body.filing.agmLocationChange).toEqual({
      year: '2025',
      reason: 'Staff authorization submission.',
      agmLocation: {
        country: 'US',
        city: 'Seattle',
        region: 'WA'
      }
    })
    expect(body.filing.header.folioNumber).toBe('folio-1234')
    expect(body.filing.header.staffPaymentOption).toBeUndefined()
    expect(body.filing.header.waiveFees).toBeUndefined()

    await assertFinalRedirect(page)
  })

  test('files a different folio number when one is entered', async ({ page }) => {
    await gotoAgmPage(page)

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
    await fillOutFolio(page, 'TXN-123')
    await page.getByRole('checkbox', { name: /i certify/i }).check()

    const submitRequest = waitForFilingPost(page)
    await page.getByRole('button', { name: 'File and Pay' }).click()
    const body = (await submitRequest).postDataJSON()

    expect(body.filing.header.folioNumber).toBe('TXN-123')
    expect(body.filing.agmLocationChange.agmLocation).toEqual({
      country: 'CA',
      city: 'Calgary',
      region: 'AB'
    })
  })

  test('stays on the first step with an alert when required details are missing', async ({ page }) => {
    await gotoAgmPage(page)

    await page.getByRole('button', { name: 'Review and Confirm' }).click()

    await expect(page.getByText('Please complete required information')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Annual General Meeting (AGM) Location Change',
      exact: true })).toBeVisible()
  })

  test('requires certification before filing from the review step', async ({ page }) => {
    await gotoAgmPage(page)
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

    let posted = false
    page.on('request', (req) => {
      if (req.url().includes(`/businesses/${identifier}/filings`) && req.method() === 'POST') {
        posted = true
      }
    })
    await page.getByRole('button', { name: 'File and Pay' }).click()

    await expect(page.getByText('Please complete required information')).toBeVisible()
    expect(posted).toBe(false)
  })
})
