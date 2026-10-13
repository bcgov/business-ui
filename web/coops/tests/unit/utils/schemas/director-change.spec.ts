/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from 'vitest'

describe('getCoopDirectorChangeSchema', () => {
  describe('non-staff', () => {
    let schema: ReturnType<typeof getCoopDirectorChangeSchema>

    beforeEach(() => {
      schema = getCoopDirectorChangeSchema(false)
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

    it('should leave the active party sub form empty', () => {
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect(result.data!.activeParty).toBeUndefined()
      // the page guards on this key - an open sub form blocks save/submit
      expect(Object.keys(schema.shape)).toContain('activeParty')
    })

    it('should accept a cleared active party sub form', () => {
      const result = schema.safeParse({ activeParty: null })

      expect(result.success).toBe(true)
      expect(result.data!.activeParty).toBeNull()
    })

    it('should reject an incomplete director in the active party sub form', () => {
      const result = schema.safeParse({ activeParty: { name: { partyType: PartyType.PERSON } } })

      expect(result.success).toBe(false)
      expect(result.error!.issues.every(i => i.path[0] === 'activeParty')).toBe(true)
    })
  })

  describe('staff', () => {
    let schema: ReturnType<typeof getCoopDirectorChangeSchema>

    beforeEach(() => {
      schema = getCoopDirectorChangeSchema(true)
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
  })
})
