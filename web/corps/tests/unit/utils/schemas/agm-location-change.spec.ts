/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'

describe('getAgmLocationChangeSchema (defaults)', () => {
  describe('non-staff', () => {
    const schema = getAgmLocationChangeSchema(false)

    it('should parse empty input to defaults', () => {
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect(result.data!.year).toBe('')
      expect(result.data!.reason).toBe('')
      expect(result.data!.agmLocation).toBe('')
      expect((result.data as any).certify).toEqual({ isCertified: false })
    })

    it('should not include staffPayment', () => {
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect((result.data as any).staffPayment).toBeUndefined()
    })
  })

  describe('staff', () => {
    const schema = getAgmLocationChangeSchema(true)

    it('should parse empty input to defaults', () => {
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect(result.data!.year).toBe('')
      expect((result.data as any).staffPayment).toEqual(expect.objectContaining({
        option: StaffPaymentOption.NONE,
        isPriority: false
      }))
    })

    it('should not include certify', () => {
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect((result.data as any).certify).toBeUndefined()
    })
  })
})

describe('getAgmLocationChangeValidationSchema (validation)', () => {
  const schema = getAgmLocationChangeValidationSchema()

  const getIssues = (result: ReturnType<typeof schema.safeParse>) => result.error?.issues ?? []
  const getPaths = (result: ReturnType<typeof schema.safeParse>) =>
    getIssues(result).map(i => i.path.join('.'))

  const valid = { year: '2025', reason: 'Some reason', agmLocation: 'Calgary, Alberta, Canada' }

  describe('year', () => {
    it('should fail when empty', () => {
      const result = schema.safeParse({ ...valid, year: '' })

      expect(result.success).toBe(false)
      expect(getPaths(result)).toContain('year')
    })

    it('should fail when not a 4-digit number', () => {
      const result = schema.safeParse({ ...valid, year: 'abcd' })

      expect(result.success).toBe(false)
      expect(getPaths(result)).toContain('year')
    })

    it('should fail for a 3-digit year', () => {
      const result = schema.safeParse({ ...valid, year: '202' })

      expect(result.success).toBe(false)
      expect(getPaths(result)).toContain('year')
    })

    it('should pass for a valid 4-digit year', () => {
      const result = schema.safeParse({ ...valid, year: '2025' })

      expect(result.success).toBe(true)
    })
  })

  describe('reason', () => {
    it('should fail when empty', () => {
      const result = schema.safeParse({ ...valid, reason: '' })

      expect(result.success).toBe(false)
      expect(getPaths(result)).toContain('reason')
    })

    it('should fail when over 2000 characters', () => {
      const result = schema.safeParse({ ...valid, reason: 'a'.repeat(2001) })

      expect(result.success).toBe(false)
      expect(getPaths(result)).toContain('reason')
    })

    it('should pass at exactly 2000 characters', () => {
      const result = schema.safeParse({ ...valid, reason: 'a'.repeat(2000) })

      expect(result.success).toBe(true)
    })
  })

  describe('agmLocation', () => {
    it('should fail when empty', () => {
      const result = schema.safeParse({ ...valid, agmLocation: '' })

      expect(result.success).toBe(false)
      expect(getPaths(result)).toContain('agmLocation')
    })

    it('should fail when over 400 characters', () => {
      const result = schema.safeParse({ ...valid, agmLocation: 'a'.repeat(401) })

      expect(result.success).toBe(false)
      expect(getPaths(result)).toContain('agmLocation')
    })

    it('should pass at exactly 400 characters', () => {
      const result = schema.safeParse({ ...valid, agmLocation: 'a'.repeat(400) })

      expect(result.success).toBe(true)
    })
  })

  describe('valid full input', () => {
    it('should pass with all valid fields', () => {
      const result = schema.safeParse(valid)

      expect(result.success).toBe(true)
      expect(result.data!.year).toBe('2025')
      expect(result.data!.reason).toBe('Some reason')
      expect(result.data!.agmLocation).toBe('Calgary, Alberta, Canada')
    })
  })
})
