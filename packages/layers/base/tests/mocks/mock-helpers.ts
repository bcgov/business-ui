import type { Page } from '@playwright/test'

import { FilingType } from '#business/app/enums/filing-type'
import { isTempRegIdentifier } from '#business/app/utils/business-string-helpers'
import {
  getBootstrapMock,
  getBusinessLedgerMock,
  getBusinessMock,
  getBusinessSettingsMock,
  getCommentsMock,
  getDocumentsMock,
  getLdarklyFlagsMock,
  getPermissionsMock
  // getUserSettingsMock
} from '#test-mocks'
import type { LedgerMockItem } from '#test-mocks'

export const mockApiCallsForAlerts = async (
  page: Page,
  identifier = 'BC1234567'
) => {
  page.route('https://app.launchdarkly.com/sdk/evalx/**/context', async (route) => {
    await route.fulfill({ json: getLdarklyFlagsMock() })
  })
  page.route(`**/api/v2/businesses/${identifier}`, async (route) => {
    await route.fulfill({ json: getBusinessMock(
      [
        { key: 'adminFreeze', value: true },
        { key: 'goodStanding', value: false },
        { key: 'inDissolution', value: true },
        { key: 'warnings', value: [] }
      ],
      false) })
  })
}

export const mockApiCallsForLedger = async (
  page: Page,
  identifier = 'BC1234567',
  ledgerItems: LedgerMockItem[] = [{ type: FilingType.CHANGE_OF_ADDRESS }]
) => {
  // add identifier to the ledger mock items
  for (const item of ledgerItems) {
    item['overrides'] = [
      { key: 'businessIdentifier', value: identifier },
      ...(item.overrides || [])
    ]
  }
  if (isTempRegIdentifier(identifier)) {
    page.route(`**/api/v2/businesses/${identifier}/filings`, async (route) => {
      await route.fulfill({ json: getBootstrapMock() })
    })
  } else {
    page.route(`**/api/v2/businesses/${identifier}/filings`, async (route) => {
      await route.fulfill({ json: getBusinessLedgerMock(ledgerItems) })
    })
  }
  page.route('https://app.launchdarkly.com/sdk/evalx/**/context', async (route) => {
    await route.fulfill({ json: getLdarklyFlagsMock() })
  })
  page.route(`**/api/v2/businesses/${identifier}?slim=true`, async (route) => {
    await route.fulfill({ json: getBusinessMock([], true) })
  })
  page.route('**/api/v2/permissions', async (route) => {
    await route.fulfill({ json: getPermissionsMock() })
  })
  page.route('**/api/v2/businesses/**/filings/**/documents', async (route) => {
    await route.fulfill({ json: getDocumentsMock() })
  })
  page.route('**/api/v2/businesses/**/filings/**/comments', async (route) => {
    await route.fulfill({ json: getCommentsMock() })
  })
}

export const mockCommonApiCallsForFiling = async (
  page: Page,
  identifier = 'BC1234567',
  partiesJSON: object | undefined,
  feesJSON: object | undefined,
  addressesJSON: object | undefined
  // accountType?: string
) => {
  page.route('https://app.launchdarkly.com/sdk/evalx/**/context', async (route) => {
    await route.fulfill({ json: getLdarklyFlagsMock() })
  })
  // page.route('**/users/**/settings', async (route) => {
  //   await route.fulfill({ json: getUserSettingsMock(accountType || 'PREMIUM') })
  // })
  page.route(`**/api/v2/businesses/${identifier}`, async (route) => {
    await route.fulfill({ json: getBusinessMock([{ key: 'identifier', value: identifier }]) })
  })
  page.route(`**/api/v1/entities/${identifier}`, async (route) => {
    await route.fulfill({ json: getBusinessSettingsMock() })
  })
  page.route('**/api/v2/permissions', async (route) => {
    await route.fulfill({ json: getPermissionsMock() })
  })
  page.route(`**/businesses/${identifier}/filings`, async (route) => {
    await route.fulfill({
      status: 201,
      json: {}
    })
  })
  page.route(`${process.env.NUXT_PUBLIC_BUSINESS_DASHBOARD_URL}**`, async (route) => {
    await route.fulfill({
      status: 200,
      headers: {
        Location: `www.playwright-mocked.bc.gov.ca/business-dashboard/${identifier}`
      },
      body: 'Redirected to playwright mocked business dashboard'
    })
  })
  // FUTURE: make this configurable for other filings
  if (partiesJSON) {
    page.route(`**/api/v2/businesses/${identifier}/parties**`, async (route) => {
      // FUTURE: update roles of parties to match the configurables
      await route.fulfill({ json: partiesJSON })
    })
  }
  if (feesJSON) {
    page.route('**/api/v1/fees/**', async (route) => {
      await route.fulfill({ json: feesJSON })
    })
  }
  if (addressesJSON) {
    page.route(`**/api/v2/businesses/${identifier}/addresses`, async (route) => {
      // FUTURE: update roles of parties to match the configurables
      await route.fulfill({ json: addressesJSON })
    })
  }
}
