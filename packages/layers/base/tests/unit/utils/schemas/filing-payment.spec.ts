import { describe, it, expect } from 'vitest'
import { z } from 'zod'

describe('getDefaultStaffPayment', () => {
  it('should return the no selection staff payment', () => {
    expect(getDefaultStaffPayment()).toEqual({
      option: StaffPaymentOption.NONE,
      bcolAccountNumber: '',
      datNumber: '',
      routingSlipNumber: '',
      folioNumber: '',
      isPriority: false
    })
  })

  it('should return a new object on each call', () => {
    expect(getDefaultStaffPayment()).not.toBe(getDefaultStaffPayment())
  })
})

describe('withPaymentSection', () => {
  const base = z.object({ authorization: z.object({ isAuthorized: z.boolean() }).default(() => ({
    isAuthorized: false
  })) })

  it('should add the staff payment section for staff', () => {
    const parsed = withPaymentSection(base, true).parse({})

    expect(parsed).toEqual({
      authorization: { isAuthorized: false },
      staffPayment: getDefaultStaffPayment()
    })
  })

  it('should add the folio section for a client', () => {
    const parsed = withPaymentSection(base, false).parse({})

    expect(parsed).toEqual({
      authorization: { isAuthorized: false },
      folio: { folioNumber: '' }
    })
  })

  it('should keep the base schema validation', () => {
    const result = withPaymentSection(base, false).safeParse({ authorization: { isAuthorized: 'nope' } })

    expect(result.success).toBe(false)
  })

  it('should validate the staff payment section', () => {
    const staffPayment = { ...getDefaultStaffPayment(), option: StaffPaymentOption.FAS }

    const result = withPaymentSection(base, true).safeParse({ staffPayment })

    expect(result.success).toBe(false)
    expect(result.error!.issues[0]!.path).toEqual(['staffPayment', 'routingSlipNumber'])
  })
})

describe('getStaffPaymentSectionShape / getFolioSectionShape', () => {
  it('should default the staff payment to the no selection literal', () => {
    const parsed = z.object(getStaffPaymentSectionShape()).parse({})

    expect(parsed.staffPayment).toEqual(getDefaultStaffPayment())
  })

  it('should default the folio to an empty folio number', () => {
    const parsed = z.object(getFolioSectionShape()).parse({})

    expect(parsed.folio).toEqual({ folioNumber: '' })
  })
})
