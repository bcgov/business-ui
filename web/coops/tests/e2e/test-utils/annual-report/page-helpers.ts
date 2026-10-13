import type { Page } from '@playwright/test'
import { mockCommonApiCallsForFiling } from '#test-mocks'
import type { BusinessOverride } from '#test-mocks'
import { COOP_AR_YEAR, getCoopBusinessOverrides } from '~~/tests/mocks'

const defaultHeader = {
  accountId: 1234,
  affectedFilings: [],
  availableOnPaperOnly: false,
  certifiedBy: '',
  colinIds: [],
  comments: [],
  date: `${COOP_AR_YEAR}-03-05T18:41:08.429796+00:00`,
  deletionLocked: false,
  effectiveDate: `${COOP_AR_YEAR}-03-05T18:41:08.429863+00:00`,
  filingId: 999001,
  inColinOnly: false,
  isCorrected: false,
  isCorrectionPending: false,
  name: 'annualReport',
  status: 'DRAFT',
  submitter: 'TestFirst TestLast',
  ARFilingYear: COOP_AR_YEAR,
  arMinDate: `${COOP_AR_YEAR}-01-01`,
  arMaxDate: `${COOP_AR_YEAR}-12-31`
}

export interface AnnualReportDraftOverrides {
  annualReport?: object
  changeOfAddress?: object
  changeOfDirectors?: object
  header?: object
  business?: object
}

/**
 * Mock a coop annual report draft response returned by GET /businesses/:id/filings/:filingId.
 * Used for draft resume tests (page loaded with ?draft=<filingId> URL param).
 */
export function getAnnualReportDraftMock(overrides: AnnualReportDraftOverrides = {}) {
  return {
    filing: {
      business: {
        foundingDate: '1998-08-26T07:00:00+00:00',
        identifier: 'CP1002605',
        legalName: 'PLAYWRIGHT TEST COOPERATIVE ASSOCIATION',
        legalType: 'CP',
        ...(overrides.business ?? {})
      },
      annualReport: overrides.annualReport ?? {
        annualReportDate: `${COOP_AR_YEAR}-12-31`,
        annualGeneralMeetingDate: null,
        didNotHoldAgm: false
      },
      ...(overrides.changeOfAddress ? { changeOfAddress: overrides.changeOfAddress } : {}),
      ...(overrides.changeOfDirectors ? { changeOfDirectors: overrides.changeOfDirectors } : {}),
      header: { ...defaultHeader, ...(overrides.header ?? {}) }
    }
  }
}

/**
 * Mock all API calls required for a coop annual report page (new filing, no pre-existing draft).
 * NB: directors and the registered office are fetched on page init.
 */
export async function setupAnnualReportPage(
  page: Page,
  identifier: string,
  feesJSON: object,
  partiesJSON: object | undefined,
  addressesJSON: object | undefined,
  accountType: 'STAFF' | 'PREMIUM' = 'PREMIUM',
  options: {
    businessOverrides?: BusinessOverride[]
  } = {}
) {
  await mockCommonApiCallsForFiling(
    page,
    identifier,
    partiesJSON,
    feesJSON,
    addressesJSON,
    accountType,
    undefined,
    getCoopBusinessOverrides(options.businessOverrides)
  )
}

/**
 * Mock API calls for a coop annual report page resuming a saved draft.
 * Registers an override for GET/PUT /businesses/:id/filings/:filingId.
 */
export async function setupAnnualReportPageWithDraft(
  page: Page,
  identifier: string,
  draftId: string,
  feesJSON: object,
  partiesJSON: object | undefined,
  addressesJSON: object | undefined,
  accountType: 'STAFF' | 'PREMIUM' = 'PREMIUM',
  draftOverrides: AnnualReportDraftOverrides = {}
) {
  await setupAnnualReportPage(page, identifier, feesJSON, partiesJSON, addressesJSON, accountType)

  const draftMock = getAnnualReportDraftMock(draftOverrides)
  await page.route(`**/api/v2/businesses/${identifier}/filings/${draftId}`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: draftMock })
    } else {
      await route.fulfill({ status: 200, json: draftMock })
    }
  })
}

export async function navigateToAnnualReportPage(
  page: Page,
  identifier: string,
  year: number = COOP_AR_YEAR,
  draftId?: string
) {
  const url = draftId
    ? `./en-CA/annual-report/${identifier}?year=${year}&draft=${draftId}`
    : `./en-CA/annual-report/${identifier}?year=${year}`

  await Promise.all([
    page.waitForResponse('*/**/businesses/**/*'),
    page.goto(url)
  ])
}
