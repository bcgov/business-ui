import { test, expect } from '@playwright/test'

import { NrRequestActionCode } from '#business/app/enums/name-request-code'
import { NameRequestState } from '#business/app/enums/name-request-state'
import { CorpTypeCd } from '#business/app/enums/corp-type-cd'
import { fillOutNrNumber } from '#e2e-utils'
import { getNameRequestMock } from '#test-mocks'

const API_SUCCESS_RESPONSE_CASES = [
  {
    testName: 'Valid NR Number - Approved',
    nrAction: NrRequestActionCode.CHANGE_NAME,
    nrLegalType: CorpTypeCd.BC_COMPANY,
    nrState: NameRequestState.APPROVED,
    nrConsentFlag: null,
    expectedMsg: ''
  },
  {
    testName: 'Valid NR Number - Conditional',
    nrAction: NrRequestActionCode.CHANGE_NAME,
    nrLegalType: CorpTypeCd.BC_COMPANY,
    nrState: NameRequestState.CONDITIONAL,
    nrConsentFlag: 'R',
    expectedMsg: ''
  },
  {
    testName: 'Invalid NR Number - Rejected',
    nrAction: NrRequestActionCode.CHANGE_NAME,
    nrLegalType: CorpTypeCd.BC_COMPANY,
    nrState: NameRequestState.REJECTED,
    nrConsentFlag: null,
    expectedMsg: 'The specified name request has not been approved.'
  },
  {
    testName: 'Invalid NR Number - Consumed',
    nrAction: NrRequestActionCode.CHANGE_NAME,
    nrLegalType: CorpTypeCd.BC_COMPANY,
    nrState: NameRequestState.CONSUMED,
    nrConsentFlag: null,
    expectedMsg: 'The specified name request has already been consumed.'
  },
  {
    testName: 'Invalid NR Number - Expired',
    nrAction: NrRequestActionCode.CHANGE_NAME,
    nrLegalType: CorpTypeCd.BC_COMPANY,
    nrState: NameRequestState.EXPIRED,
    nrConsentFlag: null,
    expectedMsg: 'The specified name request has expired.'
  },
  {
    testName: 'Invalid NR Number - Draft',
    nrAction: NrRequestActionCode.CHANGE_NAME,
    nrLegalType: CorpTypeCd.BC_COMPANY,
    nrState: NameRequestState.DRAFT,
    nrConsentFlag: null,
    expectedMsg: 'The specified name request has not been approved.'
  },
  {
    testName: 'Invalid NR Number - Needs Consent',
    nrAction: NrRequestActionCode.CHANGE_NAME,
    nrLegalType: CorpTypeCd.BC_COMPANY,
    nrState: NameRequestState.CONDITIONAL,
    nrConsentFlag: 'Y',
    expectedMsg: 'The specified name request is awaiting consent.'
  },
  {
    testName: 'Invalid NR Number - action',
    nrAction: NrRequestActionCode.NEW_BUSINESS,
    nrLegalType: CorpTypeCd.BC_COMPANY,
    nrState: NameRequestState.APPROVED,
    nrConsentFlag: null,
    // eslint-disable-next-line max-len
    expectedMsg: 'This Name Request is for a New Business. For this Correction you can only use the following Name Request types: Change of Name'
  },
  {
    testName: 'Invalid NR Number - legal type',
    nrAction: NrRequestActionCode.CHANGE_NAME,
    nrLegalType: CorpTypeCd.COOP,
    nrState: NameRequestState.APPROVED,
    nrConsentFlag: null,
    // eslint-disable-next-line max-len
    expectedMsg: 'This Name Request is for a BC Cooperative Association. You need to use a name request for a BC Limited Company.'
  }
]

test.describe('NameRequestNumber - api successful response validation', () => {
  API_SUCCESS_RESPONSE_CASES.forEach(({ testName, nrAction, nrLegalType, nrState, nrConsentFlag, expectedMsg }) => {
    test(testName, async ({ page }) => {
      await page.goto('./en-CA/examples/components/Form/NameRequest/Number')
      await page.waitForLoadState('networkidle')
      page.route('**/api/v2/nameRequests/**/validate', async (route) => {
        await route.fulfill({
          json: getNameRequestMock([
            { key: 'request_action_cd', value: nrAction },
            { key: 'state', value: nrState },
            { key: 'consentFlag', value: nrConsentFlag ?? '' },
            { key: 'legalType', value: nrLegalType }
          ])
        })
      })
      await fillOutNrNumber(page, 'NR 1234567')

      const nrNumberGrp = page.getByTestId('form-group-nr-number')
      await expect(nrNumberGrp).toContainText(expectedMsg)
    })
  })
})
