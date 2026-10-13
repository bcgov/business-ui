export interface FeeMockOptions {
  /** The pay-api filing type code, eg BCCDR. */
  filingTypeCode: string
  /** The fee label pay-api returns, eg 'Director Change'. */
  filingType: string
  filingFees: number
  /** Never derived - state the total pay-api returns. */
  total: number
  serviceFees?: number
  priorityFees?: number
  gst?: number
  pst?: number
}

/** A fee as returned by pay-api GET /fees/:corpType/:filingTypeCode. */
export function makeFeeMock({
  filingTypeCode,
  filingType,
  filingFees,
  total,
  serviceFees = 1.5,
  priorityFees = 100,
  gst = 0,
  pst = 0
}: FeeMockOptions) {
  return {
    filingFees,
    filingType,
    filingTypeCode,
    futureEffectiveFees: 0,
    priorityFees,
    processingFees: 0,
    serviceFees,
    tax: {
      gst,
      pst
    },
    total
  }
}

/** The all zero fee pay-api returns for a staff no fee filing. */
export function makeNoFeeMock({
  filingTypeCode,
  filingType
}: Pick<FeeMockOptions, 'filingTypeCode' | 'filingType'>) {
  return {
    filingFees: 0,
    filingType,
    filingTypeCode,
    futureEffectiveFees: 0,
    priorityFees: 0,
    processingFees: 0,
    serviceFees: 0,
    tax: {
      gst: 0,
      pst: 0
    },
    total: 0
  }
}
