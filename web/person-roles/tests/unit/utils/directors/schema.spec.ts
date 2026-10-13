import { describe, it, expect, beforeEach } from 'vitest'

describe('getDirectorsSchema', () => {
  describe('corps convention (authorization), non-staff', () => {
    let schema: ReturnType<typeof getDirectorsSchema>

    beforeEach(() => {
      schema = getDirectorsSchema(false, 'authorization')
    })

    it('should use correct default values', () => {
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        authorization: { isAuthorized: false },
        folio: { folioNumber: '' }
      })
    })

    it('should leave the active party undefined by default', () => {
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect((result.data as DirectorsFormSchema).activeParty).toBeUndefined()
      expect((result.data as DirectorsFormSchema).staffPayment).toBeUndefined()
    })

    it('should require the authorization confirmation', () => {
      const result = schema.safeParse({ authorization: { isAuthorized: false } })

      expect(result.success).toBe(false)
      expect(result.error?.issues.map(i => i.path.join('.'))).toContain('authorization.isAuthorized')
    })

    it('should fail when the folio number is too long', () => {
      const result = schema.safeParse({
        authorization: { isAuthorized: true },
        folio: { folioNumber: 'a'.repeat(51) }
      })

      expect(result.success).toBe(false)
      expect(result.error?.issues.map(i => i.path.join('.'))).toContain('folio.folioNumber')
    })

    it('should default an active party to the director role', () => {
      const result = schema.safeParse({
        authorization: { isAuthorized: true },
        activeParty: {}
      })

      expect(result.success).toBe(true)
      expect((result.data as DirectorsFormSchema).activeParty?.roles)
        .toEqual([{ roleType: RoleTypeUi.DIRECTOR }])
    })
  })

  describe('coops convention (certified-by), non-staff', () => {
    let schema: ReturnType<typeof getDirectorsSchema>

    beforeEach(() => {
      schema = getDirectorsSchema(false, 'certified-by')
    })

    it('should have no authorization section', () => {
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ folio: { folioNumber: '' } })
    })

    it('should pass without an authorization confirmation', () => {
      const result = schema.safeParse({ folio: { folioNumber: 'ABC-123' } })

      expect(result.success).toBe(true)
      expect((result.data as DirectorsFormSchema).folio).toEqual({ folioNumber: 'ABC-123' })
    })
  })

  describe('staff', () => {
    it('should carry the staff payment defaults instead of a folio', () => {
      const result = getDirectorsSchema(true, 'authorization').safeParse({})

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        authorization: { isAuthorized: false },
        staffPayment: getDefaultStaffPayment()
      })
    })

    it('should require a staff payment option when one is provided', () => {
      const result = getDirectorsSchema(true, 'certified-by').safeParse({
        staffPayment: getDefaultStaffPayment()
      })

      expect(result.success).toBe(false)
      expect(result.error?.issues.map(i => i.path.join('.'))).toContain('staffPayment.option')
    })
  })
})
