import { describe, it, expect, beforeEach } from 'vitest'

/** An office as held by the manage offices sub form. */
const mockOffice = {
  id: '15f88a9b-25c4-47be-93d2-04eb2db31cec',
  isEditing: true,
  actions: [],
  type: OfficeType.RECORDS,
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

describe('getAddressChangeSchema', () => {
  describe('non-staff', () => {
    let schema: ReturnType<typeof getAddressChangeSchema>

    beforeEach(() => {
      schema = getAddressChangeSchema(false)
    })

    it('should use correct default values', () => {
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        authorization: { isAuthorized: false },
        folio: { folioNumber: '' }
      })
    })

    it('should not include staff payment', () => {
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect((result.data as AddressChangeFormSchema).staffPayment).toBeUndefined()
    })

    it('should leave the active office undefined by default', () => {
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect((result.data as AddressChangeFormSchema).activeOffice).toBeUndefined()
    })

    it('should require the authorization confirmation', () => {
      const result = schema.safeParse({ authorization: { isAuthorized: false } })

      expect(result.success).toBe(false)
      expect(result.error?.issues.map(i => i.path.join('.'))).toContain('authorization.isAuthorized')
    })

    it('should pass when authorized', () => {
      const result = schema.safeParse({
        authorization: { isAuthorized: true },
        folio: { folioNumber: 'ABC-123' }
      })

      expect(result.success).toBe(true)
      expect((result.data as AddressChangeFormSchema).folio).toEqual({ folioNumber: 'ABC-123' })
    })

    it('should fail when the folio number is too long', () => {
      const result = schema.safeParse({
        authorization: { isAuthorized: true },
        folio: { folioNumber: 'a'.repeat(51) }
      })

      expect(result.success).toBe(false)
      expect(result.error?.issues.map(i => i.path.join('.'))).toContain('folio.folioNumber')
    })

    it('should accept an office open in the sub form', () => {
      const result = schema.safeParse({
        authorization: { isAuthorized: true },
        activeOffice: mockOffice
      })

      expect(result.success).toBe(true)
      expect((result.data as AddressChangeFormSchema).activeOffice?.type).toBe(OfficeType.RECORDS)
    })

    it('should reject an active office that is not a valid office', () => {
      const result = schema.safeParse({
        authorization: { isAuthorized: true },
        activeOffice: { ...mockOffice, type: 'notAnOffice' }
      })

      expect(result.success).toBe(false)
      expect(result.error?.issues.map(i => i.path.join('.'))).toContain('activeOffice.type')
    })
  })

  describe('staff', () => {
    let schema: ReturnType<typeof getAddressChangeSchema>

    beforeEach(() => {
      schema = getAddressChangeSchema(true)
    })

    it('should use correct default values', () => {
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        authorization: { isAuthorized: false },
        staffPayment: {
          option: StaffPaymentOption.NONE,
          bcolAccountNumber: '',
          datNumber: '',
          routingSlipNumber: '',
          folioNumber: '',
          isPriority: false
        }
      })
    })

    it('should not include folio', () => {
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect((result.data as AddressChangeFormSchema).folio).toBeUndefined()
    })

    it('should require a staff payment option when one is provided', () => {
      const result = schema.safeParse({
        authorization: { isAuthorized: true },
        staffPayment: {
          option: StaffPaymentOption.NONE,
          bcolAccountNumber: '',
          datNumber: '',
          routingSlipNumber: '',
          folioNumber: '',
          isPriority: false
        }
      })

      expect(result.success).toBe(false)
      expect(result.error?.issues.map(i => i.path.join('.'))).toContain('staffPayment.option')
    })

    it('should pass with a no fee staff payment', () => {
      const result = schema.safeParse({
        authorization: { isAuthorized: true },
        staffPayment: {
          option: StaffPaymentOption.NO_FEE,
          bcolAccountNumber: '',
          datNumber: '',
          routingSlipNumber: '',
          folioNumber: '',
          isPriority: false
        }
      })

      expect(result.success).toBe(true)
    })
  })
})
