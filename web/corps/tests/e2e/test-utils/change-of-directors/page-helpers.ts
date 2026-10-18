import type { Page } from '@playwright/test'
import { mockCommonApiCallsForFiling, getPartiesMock } from '#test-mocks'
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
  filingId: 999005,
  inColinOnly: false,
  isCorrected: false,
  isCorrectionPending: false,
  name: 'changeOfDirectors',
  status: 'DRAFT',
  submitter: 'TestFirst TestLast'
}

export interface ChangeOfDirectorsDraftOverrides {
  changeOfDirectors?: object
  header?: object
  business?: object
}

/**
 * Mock a Change of Directors draft response returned by GET /businesses/:id/filings/:filingId.
 * Used for draft resume tests (page loaded with ?draft=<filingId> URL param).
 */
export function getChangeOfDirectorsDraftMock(overrides: ChangeOfDirectorsDraftOverrides = {}) {
  return {
    filing: {
      business: {
        foundingDate: '1980-12-23T08:00:00+00:00',
        identifier: 'BC1234567',
        legalName: 'MCELROY ENTERPRISES LTD. - QA_IMPORT_TEST',
        legalType: 'BC',
        ...(overrides.business ?? {})
      },
      changeOfDirectors: overrides.changeOfDirectors ?? {},
      header: { ...defaultHeader, ...(overrides.header ?? {}) }
    }
  }
}

/**
 * Mock all API calls required for a Change of Directors page (new filing, no pre-existing draft).
 * Includes parties mock with 3 directors since the store fetches parties on init.
 */
export async function setupChangeOfDirectorsPage(
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
    getPartiesMock([
      { index: 0, key: 'roleType', value: 'Director' },
      { index: 1, key: 'roleType', value: 'Director' },
      { index: 2, key: 'roleType', value: 'Director' }
    ]),
    feesJSON,
    undefined,
    accountType,
    undefined,
    options.businessOverrides
  )
}

/**
 * Mock API calls for a Change of Directors page resuming a saved draft.
 * Registers an override for GET/PUT /businesses/:id/filings/:filingId.
 */
export async function setupChangeOfDirectorsPageWithDraft(
  page: Page,
  identifier: string,
  draftId: string,
  feesJSON: object,
  accountType: 'STAFF' | 'PREMIUM' = 'PREMIUM',
  draftOverrides: ChangeOfDirectorsDraftOverrides = {}
) {
  await setupChangeOfDirectorsPage(page, identifier, feesJSON, accountType)

  const draftMock = getChangeOfDirectorsDraftMock(draftOverrides)
  await page.route(`**/api/v2/businesses/${identifier}/filings/${draftId}`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: draftMock })
    } else {
      await route.fulfill({ status: 200, json: draftMock })
    }
  })
}

export async function navigateToChangeOfDirectorsPage(page: Page, identifier: string, draftId?: string) {
  const url = draftId
    ? `./en-CA/change-of-directors/${identifier}?draft=${draftId}`
    : `./en-CA/change-of-directors/${identifier}`

  await Promise.all([
    page.waitForResponse('*/**/businesses/**/*'),
    page.goto(url)
  ])
}
