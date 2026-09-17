import type { Page } from '@playwright/test'
import { mockCommonApiCallsForFiling } from '#test-mocks'
import type { BusinessOverride } from '#test-mocks'

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

  // 3. DRS document blob preview fetches (Form/CourtOrderPoa/Full/FileUpload/Item/Preview.vue) -
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
