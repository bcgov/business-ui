import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { mockCommonApiCallsForFiling } from '#test-mocks'
import type { BusinessOverride } from '#test-mocks'
import { createLetterSizePdfBuffer } from './pdf-fixture'
import { COURT } from '~~/tests/mocks'
import { goToReviewAndConfirm, mockDraftChangesNotFound } from '../common'

const defaultHeader = {
  accountId: 1234,
  affectedFilings: [],
  availableOnPaperOnly: false,
  certifiedBy: '',
  colinIds: [],
  comments: [],
  date: '2026-03-05T18:41:08.429796+00:00',
  deletionLocked: false,
  effectiveDate: '2026-03-05T18:41:08.429863+00:00',
  filingId: 999002,
  inColinOnly: false,
  isCorrected: false,
  isCorrectionPending: false,
  name: 'courtOrder',
  status: 'DRAFT',
  submitter: 'TestFirst TestLast'
}

export interface CourtOrderDraftOverrides {
  courtOrder?: object
  header?: object
  business?: object
}

/**
 * Mock court order draft response returned by GET /businesses/:id/filings/:filingId.
 *
 * NB: the page always resumes a pre-created draft (the filing id is a required route param) -
 * an empty `courtOrder: {}` block is a valid draft (see `isValidDraft` in the base layer), so
 * `overrides.courtOrder` only needs to be populated for hydration-specific tests.
 */
export function getCourtOrderDraftMock(overrides: CourtOrderDraftOverrides = {}) {
  return {
    filing: {
      business: {
        foundingDate: '1980-12-23T08:00:00+00:00',
        identifier: 'BC1234567',
        legalName: 'MCELROY ENTERPRISES LTD. - QA_IMPORT_TEST',
        legalType: 'BC',
        ...(overrides.business ?? {})
      },
      courtOrder: overrides.courtOrder ?? {},
      header: { ...defaultHeader, ...(overrides.header ?? {}) }
    }
  }
}

/**
 * Mock all API calls required for a court order page.
 *
 * Route registration order matters in Playwright — later routes take precedence.
 * We register common routes first, then override with court-order-specific routes.
 */
export async function setupCourtOrderPage(
  page: Page,
  identifier: string,
  filingId: string,
  feesJSON: object,
  accountType: 'STAFF' | 'PREMIUM' = 'STAFF',
  options: {
    draftOverrides?: CourtOrderDraftOverrides
    businessOverrides?: BusinessOverride[]
  } = {}
) {
  // 1. Register common API calls first (business, permissions, fees) - court order doesn't fetch
  //    parties/addresses/share-classes on init, so those mocks are intentionally omitted.
  await mockCommonApiCallsForFiling(
    page,
    identifier,
    undefined,
    feesJSON,
    undefined,
    accountType,
    undefined,
    options.businessOverrides
  )

  // 2. Override the draft filing endpoint - the specific filingId route takes precedence
  //    over the generic /filings route from mockCommonApiCallsForFiling
  await page.route(`**/api/v2/businesses/${identifier}/filings/${filingId}`, async (route) => {
    const draftMock = getCourtOrderDraftMock(options.draftOverrides)
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: draftMock })
    } else {
      // PUT for saving/updating the draft
      await route.fulfill({ status: 200, json: draftMock })
    }
  })

  // 3. Draft changes report - 404 resumes the draft as saved (no rebase for this filing)
  await mockDraftChangesNotFound(page, identifier, filingId)

  // 4. DRS document blob preview fetches (Form/CourtOrderPoa/Full/FileUpload/Item/Preview.vue) -
  //    only fires for docs that already have a fileKey (ex: a hydrated draft with existing files).
  //    Upload POSTs (documents/client/courtOrder/**) are not covered by mockCommonApiCallsForFiling -
  //    stub them locally in tests that exercise the file upload flow.
  await page.route('**/documents/client/**', async (route) => {
    if (route.request().method() !== 'GET') {
      return route.fallback()
    }
    await route.fulfill({ status: 200, contentType: 'application/pdf', body: 'document content' })
  })
}

export async function navigateToCourtOrderPage(page: Page, identifier: string, filingId: string) {
  await Promise.all([
    page.waitForResponse('*/**/businesses/**/*'),
    page.goto(`./en-CA/court-order/${identifier}/${filingId}`)
  ])
}

/** Navigates to the court order page and waits for it to finish loading. */
export async function loadCourtOrderPage(page: Page, identifier: string, filingId: string) {
  await navigateToCourtOrderPage(page, identifier, filingId)
  await page.waitForLoadState('networkidle')
  await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })
}

/** Mocks the court order page APIs as staff, then loads the page. */
export async function gotoCourtOrderPage(
  page: Page,
  identifier: string,
  filingId: string,
  options: Parameters<typeof setupCourtOrderPage>[5] = {}
) {
  await setupCourtOrderPage(page, identifier, filingId, COURT, 'STAFF', options)
  await loadCourtOrderPage(page, identifier, filingId)
}

// step 1 validates the court order section before the review step (and the staff payment) renders
export async function goToCourtOrderReviewStep(page: Page) {
  await goToReviewAndConfirm(page, page.getByTestId('review-court-order-section'))
}

const uploadFixtures = {
  courtOrder: { key: 'CORP-DS0100001003', name: 'Court Order.pdf' },
  supporting: { key: 'CORP-DS0100001004', name: 'Affidavit.pdf' }
}

/**
 * Uploads a court order document (required to reach the review step) or a supporting document.
 * Stubs the DRS upload for that document and waits on its response - a file still uploading has no key.
 * NB: the supporting upload only renders once 'Add supporting documents' is checked.
 */
export async function uploadCourtOrderFile(page: Page, type: keyof typeof uploadFixtures = 'courtOrder') {
  const { key, name } = uploadFixtures[type]
  await page.route('**/documents/client/courtOrder/**', async (route) => {
    await route.fulfill({
      status: 201,
      json: { key, consumerFilename: name, documentURL: `https://mock-api-url/documents/client/${key}` }
    })
  })
  const uploadResponse = page.waitForResponse(
    res => res.url().includes('/documents/client/courtOrder/') && res.request().method() === 'POST',
    { timeout: 10000 }
  )
  // the court order (singular) upload is the first file input, the multi supporting documents upload the last
  const fileInputs = page.getByTestId('court-order-file-upload').locator('input[type="file"]')
  await (type === 'courtOrder' ? fileInputs.first() : fileInputs.last()).setInputFiles({
    name,
    mimeType: 'application/pdf',
    buffer: createLetterSizePdfBuffer()
  })
  await uploadResponse
  await expect(page.getByTestId('court-order-file-upload').getByText(name)).toBeVisible({ timeout: 10000 })
}
