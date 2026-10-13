import { describe, it, expect, beforeEach } from 'vitest'

describe('getConsentContinuationOutSchema', () => {
  describe('non-staff', () => {
    let schema: ReturnType<typeof getConsentContinuationOutSchema>

    beforeEach(() => {
      schema = getConsentContinuationOutSchema(false)
    })

    it('should use correct default values', () => {
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        documentDelivery: { completingPartyEmail: '' },
        folio: { folioNumber: '' }
      })
    })

    it('should not include staff payment', () => {
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect((result.data as ConsentContinuationOutFormSchema).staffPayment).toBeUndefined()
    })

    it('should pass with an optional completing party email and a folio number', () => {
      const result = schema.safeParse({
        documentDelivery: { completingPartyEmail: 'extra@example.com' },
        folio: { folioNumber: 'ABC-123' }
      })

      expect(result.success).toBe(true)
      expect((result.data as ConsentContinuationOutFormSchema).documentDelivery).toEqual({
        completingPartyEmail: 'extra@example.com'
      })
    })

    it('should fail when the completing party email is invalid', () => {
      const result = schema.safeParse({
        documentDelivery: { completingPartyEmail: 'not-an-email' }
      })

      expect(result.success).toBe(false)
      expect(result.error?.issues.map(i => i.path.join('.'))).toContain('documentDelivery.completingPartyEmail')
    })

    it('should fail when the folio number is too long', () => {
      const result = schema.safeParse({
        folio: { folioNumber: 'a'.repeat(51) }
      })

      expect(result.success).toBe(false)
      expect(result.error?.issues.map(i => i.path.join('.'))).toContain('folio.folioNumber')
    })
  })

  describe('staff', () => {
    let schema: ReturnType<typeof getConsentContinuationOutSchema>

    beforeEach(() => {
      schema = getConsentContinuationOutSchema(true)
    })

    it('should use correct default values', () => {
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        documentDelivery: { completingPartyEmail: '' },
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
      expect((result.data as ConsentContinuationOutFormSchema).folio).toBeUndefined()
    })

    it('should require a staff payment option when one is provided', () => {
      const result = schema.safeParse({
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
