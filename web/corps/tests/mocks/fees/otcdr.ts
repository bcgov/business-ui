import { makeFeeMock, makeNoFeeMock } from '#test-mocks'

export const OTCDR = makeFeeMock({
  filingTypeCode: 'OTCDR',
  filingType: 'Director Change',
  filingFees: 20.0,
  total: 21.5
})

export const OTCDR_NO_FEE = makeNoFeeMock({
  filingTypeCode: 'OTCDR',
  filingType: 'Director Change'
})
