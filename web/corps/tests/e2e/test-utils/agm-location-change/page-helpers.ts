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
  filingId: 999003,
  inColinOnly: false,
  isCorrected: false,
  isCorrectionPending: false,
  name: 'agmLocationChange',
  status: 'DRAFT',
  submitter: 'TestFirst TestLast'
}

export interface AgmLocationChangeDraftOverrides {
  agmLocationChange?: object
  header?: object
  business?: object
}

/**
 * Mock an AGM Location Change draft response returned by GET /businesses/:id/filings/:filingId.
 * Used for draft resume tests (page loaded with ?draft=<filingId> URL param).
 */
export function getAgmLocationChangeDraftMock(overrides: AgmLocationChangeDraftOverrides = {}) {
  return {
    filing: {
      business: {
        foundingDate: '1980-12-23T08:00:00+00:00',
        identifier: 'BC1234567',
        legalName: 'MCELROY ENTERPRISES LTD. - QA_IMPORT_TEST',
        legalType: 'BC',
        ...(overrides.business ?? {})
      },
      agmLocationChange: overrides.agmLocationChange ?? {},
      header: { ...defaultHeader, ...(overrides.header ?? {}) }
    }
  }
}

/**
 * Mock all API calls required for an AGM Location Change page (new filing, no pre-existing draft).
 */
export async function setupAgmLocationChangePage(
  page: Page,
  identifier: string,
  feesJSON: object,
  accountType: 'STAFF' | 'PREMIUM' = 'PREMIUM',
  options: {
    businessOverrides?: BusinessOverride[]
  } = {}
) {
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
}

/**
 * Mock API calls for an AGM Location Change page resuming a saved draft.
 * Registers an override for GET/PUT /businesses/:id/filings/:filingId.
 */
export async function setupAgmLocationChangePageWithDraft(
  page: Page,
  identifier: string,
  draftId: string,
  feesJSON: object,
  accountType: 'STAFF' | 'PREMIUM' = 'PREMIUM',
  draftOverrides: AgmLocationChangeDraftOverrides = {}
) {
  await mockCommonApiCallsForFiling(
    page,
    identifier,
    undefined,
    feesJSON,
    undefined,
    accountType
  )

  const draftMock = getAgmLocationChangeDraftMock(draftOverrides)
  await page.route(`**/api/v2/businesses/${identifier}/filings/${draftId}`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: draftMock })
    } else {
      await route.fulfill({ status: 200, json: draftMock })
    }
  })
}

export async function navigateToAgmLocationChangePage(page: Page, identifier: string, draftId?: string) {
  const url = draftId
    ? `./en-CA/agm-location-change/${identifier}?draft=${draftId}`
    : `./en-CA/agm-location-change/${identifier}`

  await Promise.all([
    page.waitForResponse('*/**/businesses/**/*'),
    page.goto(url)
  ])
}
