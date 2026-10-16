import { makeFeeMock } from '#test-mocks'

export const OTANN = makeFeeMock({
  filingTypeCode: 'OTANN',
  filingType: 'Annual Report',
  filingFees: 30,
  // pay-api returns no priority fee for a coop annual report
  priorityFees: 0,
  total: 31.5
})
