import type { Page } from '@playwright/test'

import type { BusinessOverride } from './business'
import { mockCommonApiCallsForFiling } from './mock-helpers'

/**
 * The default DRAFT header of a draft filing response.
 * NB: `name` is always overridden with the filing name - a draft is only resumed when it matches.
 */
export function getDefaultFilingHeaderMock(overrides: Record<string, unknown> = {}) {
  return {
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
    name: '',
    status: 'DRAFT',
    submitter: 'TestFirst TestLast',
    ...overrides
  }
}

/** Routes GET/PUT /businesses/:identifier/filings/:draftId to the given draft mock. */
export async function routeDraftFiling(page: Page, identifier: string, draftId: string, mock: object) {
  await page.route(`**/api/v2/businesses/${identifier}/filings/${draftId}`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: mock })
    } else {
      await route.fulfill({ status: 200, json: mock })
    }
  })
}

export interface FilingDraftOverrides {
  body?: object
  header?: Record<string, unknown>
  business?: object
}

export interface SetupFilingPageOptions {
  identifier: string
  fees: object
  parties?: object
  addresses?: object
  accountType?: 'STAFF' | 'PREMIUM'
  businessOverrides?: BusinessOverride[]
}

export interface SetupFilingPageWithDraftOptions extends SetupFilingPageOptions {
  draftId: string
  draftOverrides?: FilingDraftOverrides
}

export interface NavigateToFilingPageOptions {
  identifier: string
  draftId?: string
  query?: Record<string, string | number>
}

export interface FilingPageHelpersConfig {
  /** The filing body key, eg `changeOfDirectors` - also the draft `header.name`. */
  filingName: string
  /** The page route segment, eg `director-change`. */
  routeSlug: string
  defaultBody: object
  defaultHeader?: Record<string, unknown>
  /** Waits for the page to finish initializing after a navigation. */
  waitForInit?: (page: Page) => Promise<void>
}

/** The page level mock and navigation helpers a filing e2e suite needs. */
export function createFilingPageHelpers({
  filingName,
  routeSlug,
  defaultBody,
  defaultHeader = {},
  waitForInit
}: FilingPageHelpersConfig) {
  /** A draft filing response for GET /businesses/:identifier/filings/:filingId. */
  function getDraftMock(overrides: FilingDraftOverrides = {}) {
    return {
      filing: {
        business: {
          foundingDate: '1980-12-23T08:00:00+00:00',
          identifier: 'BC1234567',
          legalName: 'MCELROY ENTERPRISES LTD. - QA_IMPORT_TEST',
          legalType: 'BC',
          ...(overrides.business ?? {})
        },
        [filingName]: overrides.body ?? defaultBody,
        header: getDefaultFilingHeaderMock({
          name: filingName,
          ...defaultHeader,
          ...(overrides.header ?? {})
        })
      }
    }
  }

  /** Mocks every api call a new filing page makes (no pre-existing draft). */
  async function setupPage(page: Page, opts: SetupFilingPageOptions) {
    await mockCommonApiCallsForFiling(
      page,
      opts.identifier,
      opts.parties,
      opts.fees,
      opts.addresses,
      opts.accountType ?? 'PREMIUM',
      undefined,
      opts.businessOverrides
    )
  }

  /** Mocks a filing page resuming a saved draft. */
  async function setupPageWithDraft(page: Page, opts: SetupFilingPageWithDraftOptions) {
    await setupPage(page, opts)
    await routeDraftFiling(page, opts.identifier, opts.draftId, getDraftMock(opts.draftOverrides))
  }

  async function navigateToPage(page: Page, opts: NavigateToFilingPageOptions) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(opts.query ?? {})) {
      params.set(key, String(value))
    }
    if (opts.draftId) {
      params.set('draft', opts.draftId)
    }
    const search = params.toString()
    const url = `./en-CA/${routeSlug}/${opts.identifier}${search ? `?${search}` : ''}`

    await Promise.all([
      page.waitForResponse('*/**/businesses/**/*'),
      page.goto(url)
    ])

    await waitForInit?.(page)
  }

  return {
    getDraftMock,
    setupPage,
    setupPageWithDraft,
    navigateToPage
  }
}
