import { makeFeeMock, makeNoFeeMock } from '#test-mocks'

export const BCADD = makeFeeMock({
  filingTypeCode: 'BCADD',
  filingType: 'Address Change',
  filingFees: 20.0,
  total: 21.5
})

export const BCADD_NO_FEE = makeNoFeeMock({
  filingTypeCode: 'BCADD',
  filingType: 'Address Change'
})
