import { makeFeeMock, makeNoFeeMock } from '#test-mocks'

// NB: the continuation out fee is always waived by the UI (header.waiveFees), so COUTI_NO_FEE is
// what the fee widget shows for this staff only filing - COUTI is the pre-waived fee api response
export const COUTI = makeFeeMock({
  filingTypeCode: 'COUTI',
  filingType: 'Continuation Out',
  filingFees: 20.0,
  total: 20.0,
  serviceFees: 0.0
})

export const COUTI_NO_FEE = makeNoFeeMock({
  filingTypeCode: 'COUTI',
  filingType: 'Continuation Out'
})
