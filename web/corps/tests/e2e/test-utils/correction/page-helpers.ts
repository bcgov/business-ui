import type { Page } from '@playwright/test'
import {
  mockCommonApiCallsForFiling,
  getBusinessAddressesMock,
  getPartiesMock,
  getShareClassesMock
} from '#test-mocks'

/** Mock correction draft response returned by GET /businesses/:id/filings/:filingId */
export function getCorrectionDraftMock(overrides: { type?: 'CLIENT' | 'STAFF' } = {}) {
  return {
    filing: {
      business: {
        foundingDate: '2021-02-24T00:20:57.707325+00:00',
        identifier: 'BC1234567',
        legalName: 'MCELROY ENTERPRISES LTD. - QA_IMPORT_TEST',
        legalType: 'BEN'
      },
      correction: {
        comment: '',
        correctedFilingDate: '2021-02-23',
        correctedFilingId: 111554,
        correctedFilingType: 'incorporationApplication',
        type: overrides.type ?? 'STAFF'
      },
      header: {
        affectedFilings: [],
        availableOnPaperOnly: false,
        certifiedBy: '',
        colinIds: [],
        comments: [],
        date: '2026-03-05T18:41:08.429796+00:00',
        deletionLocked: false,
        effectiveDate: '2026-03-05T18:41:08.429863+00:00',
        filingId: 999001,
        inColinOnly: false,
        isCorrected: false,
        isCorrectionPending: false,
        name: 'correction',
        status: 'DRAFT',
        submitter: 'TestFirst TestLast'
      }
    }
  }
}

/**
 * Mock all API calls required for a correction page and navigate to it.
 *
 * Route registration order matters in Playwright — later routes take precedence.
 * We register common routes first, then override with correction-specific routes.
 */
export async function setupCorrectionPage(
  page: Page,
  identifier: string,
  filingId: string,
  feesJSON: object,
  accountType: 'STAFF' | 'PREMIUM',
  correctionType: 'CLIENT' | 'STAFF' = 'STAFF'
) {
  // 1. Register common API calls first (business, parties, addresses, fees, share classes)
  await mockCommonApiCallsForFiling(
    page,
    identifier,
    getPartiesMock([
      { index: 0, key: 'roleType', value: 'Director' },
      { index: 1, key: 'roleType', value: 'Director' },
      { index: 2, key: 'roleType', value: 'Director' }
    ]),
    feesJSON,
    getBusinessAddressesMock(),
    accountType,
    getShareClassesMock()
  )

  // 2. Override the draft filing endpoint — the specific filingId route takes precedence
  //    over the generic /filings route from mockCommonApiCallsForFiling
  await page.route(`**/api/v2/businesses/${identifier}/filings/${filingId}`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: getCorrectionDraftMock({ type: correctionType }) })
    } else {
      // PUT for saving/updating the draft
      await route.fulfill({ status: 200, json: getCorrectionDraftMock({ type: correctionType }) })
    }
  })

  // 3. Mock receivers and liquidators with empty lists
  //    These specific role= query params override the generic parties** route
  await page.route(`**/api/v2/businesses/${identifier}/parties?role=receiver`, async (route) => {
    await route.fulfill({ json: { parties: [] } })
  })
  await page.route(`**/api/v2/businesses/${identifier}/parties?role=liquidator`, async (route) => {
    await route.fulfill({ json: { parties: [] } })
  })
}

export async function navigateToCorrectionPage(page: Page, identifier: string, filingId: string) {
  await page.goto(`./en-CA/correction/${identifier}/${filingId}`)
  await page.waitForResponse('*/**/businesses/**/*')
}
