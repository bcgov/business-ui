import { makeFeeMock, makeNoFeeMock } from '#test-mocks'

export const CONTO = makeFeeMock({
  filingTypeCode: 'CONTO',
  filingType: '6-Month Consent to Continue Out',
  filingFees: 350.0,
  total: 351.5
})

export const CONTO_NO_FEE = makeNoFeeMock({
  filingTypeCode: 'CONTO',
  filingType: '6-Month Consent to Continue Out'
})
