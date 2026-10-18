/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from 'vitest'

describe('getChangeOfDirectorsSchema (defaults)', () => {
  describe('non-staff', () => {
    let schema: ReturnType<typeof getChangeOfDirectorsSchema>

    beforeEach(() => {
      schema = getChangeOfDirectorsSchema(false)
    })

    it('should parse empty input to defaults', () => {
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect(result.data!.codDate).toBe('')
      expect((result.data as any).certify).toEqual({ isCertified: false })
    })

    it('should not include authorization', () => {
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect((result.data as any).authorization).toBeUndefined()
    })
  })

  describe('staff', () => {
    let schema: ReturnType<typeof getChangeOfDirectorsSchema>

    beforeEach(() => {
      schema = getChangeOfDirectorsSchema(true)
    })

    it('should parse empty input to defaults', () => {
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect(result.data!.codDate).toBe('')
      expect((result.data as any).authorization).toBeDefined()
      expect((result.data as any).authorization.isAuthorized).toBe(false)
    })

    it('should not include certify', () => {
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect((result.data as any).certify).toBeUndefined()
    })
  })
})

describe('getChangeOfDirectorsValidationSchema (validation)', () => {
  const today = getToday('America/Vancouver')
  let schema: ReturnType<typeof getChangeOfDirectorsValidationSchema>

  beforeEach(() => {
    schema = getChangeOfDirectorsValidationSchema()
  })

  const getIssues = (result: ReturnType<typeof schema.safeParse>) => result.error?.issues ?? []
  const getPaths = (result: ReturnType<typeof schema.safeParse>) =>
    getIssues(result).map(i => i.path.join('.'))

  describe('codDate', () => {
    it('should pass with today\'s date', () => {
      const result = schema.safeParse({ codDate: today })

      expect(result.success).toBe(true)
    })

    it('should fail when empty', () => {
      const result = schema.safeParse({ codDate: '' })

      expect(result.success).toBe(false)
      expect(getPaths(result)).toContain('codDate')
    })

    it('should fail when in the future', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)
      const future = futureDate.toISOString().split('T')[0]!

      const result = schema.safeParse({ codDate: future })

      expect(result.success).toBe(false)
      expect(getPaths(result)).toContain('codDate')
    })

    it('should pass a date in the past', () => {
      const result = schema.safeParse({ codDate: '2020-01-15' })

      expect(result.success).toBe(true)
    })
  })

  describe('codDate with minDate', () => {
    it('should pass when codDate equals minDate', () => {
      const schemaWithMin = getChangeOfDirectorsValidationSchema('2024-01-01')
      const result = schemaWithMin.safeParse({ codDate: '2024-01-01' })

      expect(result.success).toBe(true)
    })

    it('should pass when codDate is after minDate', () => {
      const schemaWithMin = getChangeOfDirectorsValidationSchema('2024-01-01')
      const result = schemaWithMin.safeParse({ codDate: '2024-06-15' })

      expect(result.success).toBe(true)
    })

    it('should fail when codDate is before minDate', () => {
      const schemaWithMin = getChangeOfDirectorsValidationSchema('2024-06-01')
      const result = schemaWithMin.safeParse({ codDate: '2024-05-31' })

      expect(result.success).toBe(false)
      expect(getPaths(result)).toContain('codDate')
    })
  })
})
