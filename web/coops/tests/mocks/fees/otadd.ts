import { makeFeeMock, makeNoFeeMock } from '#test-mocks'

export const OTADD = makeFeeMock({
  filingTypeCode: 'OTADD',
  filingType: 'Address Change',
  filingFees: 20,
  total: 21.5
})

export const OTADD_NO_FEE = makeNoFeeMock({
  filingTypeCode: 'OTADD',
  filingType: 'Address Change'
})
