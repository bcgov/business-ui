/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from 'vitest'

/** The registered office as held by the manage offices sub form. */
const mockOffice = {
  id: '15f88a9b-25c4-47be-93d2-04eb2db31cec',
  isEditing: true,
  actions: [],
  type: OfficeType.REGISTERED,
  address: {
    deliveryAddress: {
      id: '3226284',
      street: '5670 YEW STREET',
      streetAdditional: '',
      city: 'VANCOUVER',
      region: 'BC',
      postalCode: 'V6M 3Y3',
      country: 'CA',
      locationDescription: ''
    },
    mailingAddress: {
      id: '3226283',
      street: '5670 YEW STREET',
      streetAdditional: '',
      city: 'VANCOUVER',
      region: 'BC',
      postalCode: 'V6M 3Y3',
      country: 'CA',
      locationDescription: ''
    },
    sameAs: true
  }
}

describe('getCoopAddressChangeSchema', () => {
  describe('non-staff', () => {
    let schema: ReturnType<typeof getCoopAddressChangeSchema>

    beforeEach(() => {
      schema = getCoopAddressChangeSchema(false)
    })

    it('should parse empty input to defaults', () => {
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect((result.data as any).folio).toEqual({ folioNumber: '' })
    })

    it('should not include a staff payment', () => {
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect((result.data as any).staffPayment).toBeUndefined()
    })

    it('should fail when the folio number is too long', () => {
      const result = schema.safeParse({ folio: { folioNumber: 'a'.repeat(51) } })

      expect(result.success).toBe(false)
      expect(result.error!.issues.map(i => i.path.join('.'))).toContain('folio.folioNumber')
    })

    it('should leave the active office sub form empty', () => {
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect(result.data!.activeOffice).toBeUndefined()
      // the page guards on this key - an open sub form blocks save/submit
      expect(Object.keys(schema.shape)).toContain('activeOffice')
    })

    it('should accept a cleared active office sub form', () => {
      const result = schema.safeParse({ activeOffice: null })

      expect(result.success).toBe(true)
      expect(result.data!.activeOffice).toBeNull()
    })

    it('should accept the registered office open in the sub form', () => {
      const result = schema.safeParse({ activeOffice: mockOffice })

      expect(result.success).toBe(true)
      expect((result.data as any).activeOffice?.type).toBe(OfficeType.REGISTERED)
    })

    it('should reject an active office that is not a valid office', () => {
      const result = schema.safeParse({ activeOffice: { ...mockOffice, type: 'notAnOffice' } })

      expect(result.success).toBe(false)
      expect(result.error!.issues.map(i => i.path.join('.'))).toContain('activeOffice.type')
    })
  })

  describe('staff', () => {
    let schema: ReturnType<typeof getCoopAddressChangeSchema>

    beforeEach(() => {
      schema = getCoopAddressChangeSchema(true)
    })

    it('should parse empty input to defaults', () => {
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect((result.data as any).staffPayment).toEqual(getDefaultStaffPayment())
    })

    it('should not include a folio number', () => {
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect((result.data as any).folio).toBeUndefined()
    })

    it('should require a staff payment option when one is provided', () => {
      const result = schema.safeParse({ staffPayment: getDefaultStaffPayment() })

      expect(result.success).toBe(false)
      expect(result.error!.issues.map(i => i.path.join('.'))).toContain('staffPayment.option')
    })
  })
})
