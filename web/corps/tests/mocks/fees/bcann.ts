import { makeFeeMock, makeNoFeeMock } from '#test-mocks'

export const BCANN = makeFeeMock({
  filingTypeCode: 'BCANN',
  filingType: 'Annual Report',
  filingFees: 43.39,
  total: 44.89
})

export const BCANN_NO_FEE = makeNoFeeMock({
  filingTypeCode: 'BCANN',
  filingType: 'Annual Report'
})
