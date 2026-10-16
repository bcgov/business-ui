import { describe, it, expect, beforeEach } from 'vitest'

describe('getAnnualReportSchema', () => {
  describe('non-staff', () => {
    let schema: ReturnType<typeof getAnnualReportSchema>

    beforeEach(() => {
      schema = getAnnualReportSchema(false)
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
      expect((result.data as AnnualReportFormSchema).staffPayment).toBeUndefined()
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
      expect((result.data as AnnualReportFormSchema).folio).toEqual({ folioNumber: 'ABC-123' })
    })

    it('should fail when the folio number is too long', () => {
      const result = schema.safeParse({
        authorization: { isAuthorized: true },
        folio: { folioNumber: 'a'.repeat(51) }
      })

      expect(result.success).toBe(false)
      expect(result.error?.issues.map(i => i.path.join('.'))).toContain('folio.folioNumber')
    })
  })

  describe('staff', () => {
    let schema: ReturnType<typeof getAnnualReportSchema>

    beforeEach(() => {
      schema = getAnnualReportSchema(true)
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
      expect((result.data as AnnualReportFormSchema).folio).toBeUndefined()
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
