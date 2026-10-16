import { describe, it, expect, beforeEach } from 'vitest'

describe('getConsentAmalgamationOutSchema', () => {
  describe('non-staff', () => {
    let schema: ReturnType<typeof getConsentAmalgamationOutSchema>

    beforeEach(() => {
      schema = getConsentAmalgamationOutSchema(false)
    })

    it('should use correct default values', () => {
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        authorization: { isAuthorized: false },
        documentDelivery: { completingPartyEmail: '' },
        folio: { folioNumber: '' }
      })
    })

    it('should not include staff payment', () => {
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect((result.data as ConsentAmalgamationOutFormSchema).staffPayment).toBeUndefined()
    })

    it('should pass with an optional completing party email and a folio number', () => {
      const result = schema.safeParse({
        authorization: { isAuthorized: true },
        documentDelivery: { completingPartyEmail: 'extra@example.com' },
        folio: { folioNumber: 'ABC-123' }
      })

      expect(result.success).toBe(true)
      expect((result.data as ConsentAmalgamationOutFormSchema).documentDelivery).toEqual({
        completingPartyEmail: 'extra@example.com'
      })
    })

    it('should fail when the authorization is not confirmed', () => {
      const result = schema.safeParse({ authorization: { isAuthorized: false } })

      expect(result.success).toBe(false)
      expect(result.error?.issues.map(i => i.path.join('.'))).toContain('authorization.isAuthorized')
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
    let schema: ReturnType<typeof getConsentAmalgamationOutSchema>

    beforeEach(() => {
      schema = getConsentAmalgamationOutSchema(true)
    })

    it('should use correct default values', () => {
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        authorization: { isAuthorized: false },
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
      expect((result.data as ConsentAmalgamationOutFormSchema).folio).toBeUndefined()
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

  describe('consent to amalgamate out specifics', () => {
    it('should not include a detail comment - the filer creates no ledger comment', () => {
      const staffResult = getConsentAmalgamationOutSchema(true).safeParse({})
      const clientResult = getConsentAmalgamationOutSchema(false).safeParse({})

      expect(staffResult.data).not.toHaveProperty('detail')
      expect(clientResult.data).not.toHaveProperty('detail')
    })

    it('should not include a completing party confirmation - the corps authorization applies', () => {
      const result = getConsentAmalgamationOutSchema(false).safeParse({})

      expect(result.data).not.toHaveProperty('completingParty')
      expect(result.data).toHaveProperty('authorization')
    })
  })
})
