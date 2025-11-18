import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('getCourtOrderPoaSchema', () => {
  const schema = getCourtOrderPoaSchema()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('courtOrderNumber', () => {
    it('should pass when undefined', () => {
      const result = schema.safeParse({ courtOrderNumber: undefined })
      expect(result.success).toBe(true)
    })

    it('should pass when empty string', () => {
      const result = schema.safeParse({ courtOrderNumber: '' })
      expect(result.success).toBe(true)
    })

    it('should pass when equal to min length', () => {
      const result = schema.safeParse({ courtOrderNumber: '12345' })
      expect(result.success).toBe(true)
    })

    it('should pass when equal to max length', () => {
      const result = schema.safeParse({ courtOrderNumber: 'a'.repeat(20) })
      expect(result.success).toBe(true)
    })

    it('should fail validation and return correct message when too short', () => {
      const result = schema.safeParse({ courtOrderNumber: '1234' })

      expect(result.success).toBe(false)

      const issues = result.error!.issues
      expect(issues).toHaveLength(1)
      expect(issues[0]!.message).toBe('Minimum 5 characters')
    })

    it('should fail validation and return correct message when too long', () => {
      const result = schema.safeParse({ courtOrderNumber: 'a'.repeat(21) })

      expect(result.success).toBe(false)

      const issues = result.error!.issues
      expect(issues).toHaveLength(1)
      expect(issues[0]!.message).toBe('Maximum 20 characters')
    })
  })

  describe('hasPoa', () => {
    it('should pass when undefined', () => {
      const result = schema.safeParse({ hasPoa: undefined })
      expect(result.success).toBe(true)
    })

    it('should pass when true', () => {
      const result = schema.safeParse({ hasPoa: true })
      expect(result.success).toBe(true)
    })

    it('should pass when false', () => {
      const result = schema.safeParse({ hasPoa: false })
      expect(result.success).toBe(true)
    })
  })
})
