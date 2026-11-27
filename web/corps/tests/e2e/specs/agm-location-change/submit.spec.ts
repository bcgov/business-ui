import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import {
  fillLocationChangeDetail,
  goToReviewStep,
  setupAgmLocationChangePage,
  navigateToAgmLocationChangePage,
  assertFinalRedirect
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

    await expect(page.getByText(
      'Confirm your authorization to complete and submit this filing. The name of the person submitting this filing '
      + 'will be displayed in the history of filings for this BC Limited Company.'
    )).toBeVisible()

    await expect(page.getByRole('checkbox', {
      name: 'I confirm that the information provided is correct and that I am authorized to submit this filing on '
        + 'behalf of the BC Limited Company.'
    })).toBeVisible()

    await expect(page.getByTestId('completing-party-section')).not.toBeVisible()

    await page.getByRole('checkbox', {
      name: /i confirm that the information provided is correct/i
    }).check()

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
    expect(body.filing.header.authorizationReceived).toBe(true)
    // the business's default folio is filed unless a different one is entered
    expect(body.filing.header.folioNumber).toBe('folio-1234')
    expect(request.url()).not.toContain('draft=true')

    await assertFinalRedirect(page, identifier)
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

    const completingPartyInput = page.getByRole('textbox', {
      name: 'Legal name of completing party'
    })

    await expect(page.getByText(
      'Confirm the completing party’s authorization to complete and submit this filing. The name of the person '
      + 'submitting this filing will be displayed in the history of filings for this BC Limited Company.'
    )).toBeVisible()

    await expect(page.getByRole('checkbox', {
      name: '[Completing Party] confirms that the information provided is correct and that they are authorized to '
        + 'submit this filing on behalf of the BC Limited Company.'
    })).toBeVisible()

    await expect(page.getByTestId('completing-party-section')).toBeVisible()
    await expect(completingPartyInput).toBeVisible()

    await completingPartyInput.fill('Jane Smith')

    await expect(page.getByRole('checkbox', {
      name: 'Jane Smith confirms that the information provided is correct and that they are authorized to submit '
        + 'this filing on behalf of the BC Limited Company.'
    })).toBeVisible()

    await page.getByRole('checkbox', {
      name: /jane smith confirms that the information provided is correct/i
    }).check()

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
    expect(body.filing.header.authorizationReceived).toBe(true)
    expect(body.filing.header.folioNumber).toBe('folio-1234')
    expect(body.filing.header.staffPaymentOption).toBeUndefined()
    expect(body.filing.header.waiveFees).toBeUndefined()
    expect(body.filing.header.certifiedBy).toBe('Jane Smith')

    await assertFinalRedirect(page, identifier)
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

    await page.getByRole('checkbox', {
      name: /i confirm that the information provided is correct/i
    }).check()

    const submitRequest = waitForFilingPost(page)
    await page.getByRole('button', { name: 'File and Pay' }).click()
    const body = (await submitRequest).postDataJSON()

    expect(body.filing.header.folioNumber).toBe('TXN-123')
    expect(body.filing.agmLocationChange.agmLocation).toEqual({
      country: 'CA',
      city: 'Calgary',
      region: 'AB'
    })
    expect(body.filing.header.authorizationReceived).toBe(true)
  })

  test('stays on the first step with an alert when required details are missing', async ({ page }) => {
    await gotoAgmPage(page)

    await page.getByRole('button', { name: 'Review and Confirm' }).click()

    await expect(page.getByText('Please complete required information')).toBeVisible()
    await expect(page.getByRole('heading', {
      name: 'Annual General Meeting (AGM) Location Change',
      exact: true
    })).toBeVisible()
  })

  test('stays on the first step when the AGM location is in British Columbia', async ({ page }) => {
    await gotoAgmPage(page)

    await fillLocationChangeDetail(page, {
      year: '2025',
      reason: 'The AGM is being held in British Columbia.',
      agmLocation: {
        country: 'CA',
        city: 'Vancouver',
        region: 'British Columbia'
      }
    })

    await page.getByRole('button', { name: 'Review and Confirm' }).click()

    await expect(page.getByText('AGM location must be outside B.C.')).toBeVisible()
    await expect(page.getByRole('heading', {
      name: 'Annual General Meeting (AGM) Location Change',
      exact: true
    })).toBeVisible()

    await expect(page.getByTestId('review-location-change-detail')).not.toBeVisible()
  })

  test('requires authorization before filing from the review step', async ({ page }) => {
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

  test('requires completing party name before staff filing submission', async ({ page }) => {
    await gotoAgmPage(page, 'STAFF')

    await fillLocationChangeDetail(page, {
      year: '2025',
      reason: 'Staff authorization validation test.',
      agmLocation: {
        country: 'US',
        city: 'Seattle',
        region: 'Washington'
      }
    })
    await goToReviewStep(page)

    const completingPartyInput = page.getByRole('textbox', {
      name: 'Legal name of completing party'
    })
    await expect(completingPartyInput).toBeVisible()

    // Check authorization but leave Completing Party empty.
    await page.getByTestId('confirm-authorization-section').getByRole('checkbox').check()

    let posted = false
    page.on('request', (req) => {
      if (req.url().includes(`/businesses/${identifier}/filings`) && req.method() === 'POST') {
        posted = true
      }
    })

    await page.getByRole('button', { name: 'File and Pay' }).click()

    await expect(page.getByText('Please enter the full legal name of the completing party')).toBeVisible()
    expect(posted).toBe(false)

    // Completing Party name should allow submission to proceed.
    await completingPartyInput.fill('Jane Smith')

    await expect(page.getByRole('checkbox', {
      name: 'Jane Smith confirms that the information provided is correct and that they are authorized to submit '
        + 'this filing on behalf of the BC Limited Company.'
    })).toBeVisible()

    const submitRequest = waitForFilingPost(page)
    await page.getByRole('button', { name: 'File and Pay' }).click()

    const request = await submitRequest
    const body = request.postDataJSON()

    expect(body.filing.header.authorizationReceived).toBe(true)
  })
})
