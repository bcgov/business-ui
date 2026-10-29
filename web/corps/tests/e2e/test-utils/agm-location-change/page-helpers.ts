import { expect } from '@playwright/test'
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

/**
 * Select a country using its ISO alpha-2 code.
 */
export async function selectAgmCountry(page: Page, country: string) {
  const countryNames: Record<string, string> = {
    CA: 'Canada',
    US: 'United States'
  }
  const countryName = countryNames[country] ?? country
  const countryInput = page.getByTestId('agm-location-input-country')

  await countryInput.fill(countryName)
  await countryInput.press('Enter')
}

/**
 * Select a Canadian province or US state by its visible name.
 * For other countries, the region is a free-text field.
 */
export async function selectAgmRegion(page: Page, country: string, region: string) {
  if (country === 'CA' || country === 'US') {
    const regionInput = page.locator('#agm-location-input-region')

    await regionInput.click()
    await page.getByRole('option', { name: region, exact: true }).click()
    return
  }

  await page.getByTestId('agm-location-input-region').fill(region)
}

/**
 * Select a year from the General Meeting Year dropdown.
 */
export async function selectAgmYear(page: Page, year: string) {
  const yearSelect = page.getByRole('combobox', { name: 'General Meeting Year' })
  await yearSelect.click()
  await page.getByRole('option', { name: year, exact: true }).click()
}

/**
 * Fill the first-step fields. Region is the visible province/state name
 * for Canada and the US, and free text for other countries.
 */
export async function fillLocationChangeDetail(
  page: Page,
  detail: {
    year: string
    reason: string
    agmLocation: {
      country: string
      city: string
      region: string
    }
  }
) {
  await selectAgmYear(page, detail.year)
  await page.getByLabel('Reason').fill(detail.reason)
  await selectAgmCountry(page, detail.agmLocation.country)
  await page.getByLabel('City').fill(detail.agmLocation.city)
  await selectAgmRegion(
    page,
    detail.agmLocation.country,
    detail.agmLocation.region
  )
}

export async function goToReviewStep(page: Page) {
  await page.getByRole('button', { name: 'Review and Confirm' }).click()
  await expect(page.getByRole('heading', { name: 'Review Annual General Meeting (AGM) Location Change' }))
    .toBeVisible()
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
