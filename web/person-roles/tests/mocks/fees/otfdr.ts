import { makeFeeMock } from '#test-mocks'

// the free director change code - returned when every changed director is a name/address only change
export const OTFDR = makeFeeMock({
  filingTypeCode: 'OTFDR',
  filingType: 'Free Director Change',
  filingFees: 0,
  total: 1.5
})
