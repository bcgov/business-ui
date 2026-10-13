import { makeFeeMock, makeNoFeeMock } from '#test-mocks'

export const BCCDR = makeFeeMock({
  filingTypeCode: 'BCCDR',
  filingType: 'Director Change',
  filingFees: 20.0,
  total: 21.5
})

export const BCCDR_NO_FEE = makeNoFeeMock({
  filingTypeCode: 'BCCDR',
  filingType: 'Director Change'
})
