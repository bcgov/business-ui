/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'

// NB: the payment sections are covered by the base layer (withPaymentSection)
describe('getCoopAnnualReportSchema', () => {
  it('should parse a client form to a folio number only', () => {
    const result = getCoopAnnualReportSchema(false).safeParse({})

    expect(result.success).toBe(true)
    expect((result.data as any).folio).toEqual({ folioNumber: '' })
    expect((result.data as any).staffPayment).toBeUndefined()
  })

  it('should parse a staff form to a staff payment only', () => {
    const result = getCoopAnnualReportSchema(true).safeParse({})

    expect(result.success).toBe(true)
    expect((result.data as any).staffPayment).toEqual(getDefaultStaffPayment())
    expect((result.data as any).folio).toBeUndefined()
  })
})
