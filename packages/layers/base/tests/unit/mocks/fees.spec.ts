// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { makeFeeMock, makeNoFeeMock } from '#test-mocks/fees'

describe('makeFeeMock', () => {
  it('should build the pay-api fee shape with the standard defaults', () => {
    const fee = makeFeeMock({
      filingTypeCode: 'BCCDR',
      filingType: 'Director Change',
      filingFees: 20.0,
      total: 21.5
    })

    expect(fee).toEqual({
      filingFees: 20.0,
      filingType: 'Director Change',
      filingTypeCode: 'BCCDR',
      futureEffectiveFees: 0,
      priorityFees: 100,
      processingFees: 0,
      serviceFees: 1.5,
      tax: { gst: 0, pst: 0 },
      total: 21.5
    })
  })

  it('should apply the overridable fees and taxes', () => {
    const fee = makeFeeMock({
      filingTypeCode: 'OTANN',
      filingType: 'Annual Report',
      filingFees: 30.0,
      total: 35.0,
      serviceFees: 0,
      priorityFees: 0,
      gst: 5,
      pst: 0
    })

    expect(fee.serviceFees).toBe(0)
    expect(fee.priorityFees).toBe(0)
    expect(fee.tax).toEqual({ gst: 5, pst: 0 })
    expect(fee.total).toBe(35.0)
  })
})

describe('makeNoFeeMock', () => {
  it('should build the all zero staff no fee shape', () => {
    const fee = makeNoFeeMock({ filingTypeCode: 'BCCDR', filingType: 'Director Change' })

    expect(fee).toEqual({
      filingFees: 0,
      filingType: 'Director Change',
      filingTypeCode: 'BCCDR',
      futureEffectiveFees: 0,
      priorityFees: 0,
      processingFees: 0,
      serviceFees: 0,
      tax: { gst: 0, pst: 0 },
      total: 0
    })
  })
})
