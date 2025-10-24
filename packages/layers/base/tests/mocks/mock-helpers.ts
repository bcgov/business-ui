import type { Page } from '@playwright/test'

import { FilingType } from '../../app/enums/filing-type'
import { isTempRegIdentifier } from '../../app/utils/business-string-helpers'
import { getBootstrapMock } from './bootstrap'
import { getBusinessMock } from './business'
import { getCommentsMock } from './business-comments'
import { getDocumentsMock } from './business-ledger/documents'
import type { LedgerMockItem } from './business-ledger'
import { getBusinessLedgerMock } from './business-ledger'
import { getPermissionsMock } from './business-permissions'
import { getLdarklyFlagsMock } from './ldarkly'

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
