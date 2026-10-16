import { makeFeeMock, makeNoFeeMock } from '#test-mocks'

export const IAMGO = makeFeeMock({
  filingTypeCode: 'IAMGO',
  filingType: 'Six-Month Consent to Amalgamate Out',
  filingFees: 350.0,
  total: 351.5
})

export const IAMGO_NO_FEE = makeNoFeeMock({
  filingTypeCode: 'IAMGO',
  filingType: 'Six-Month Consent to Amalgamate Out'
})
