import { describe, it, expect } from 'vitest'

describe('getCourtOrderPoaSchema', () => {
  const schema = getCourtOrderPoaSchema()

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

    it('should fail when true (requires courtOrderNumber)', () => {
      const result = schema.safeParse({ hasPoa: true })
      expect(result.success).toBe(false)
    })

    it('should pass when false', () => {
      const result = schema.safeParse({ hasPoa: false })
      expect(result.success).toBe(true)
    })
  })

  describe('superRefine', () => {
    it('should pass when hasPoa is false and courtOrderNumber is empty', () => {
      const result = schema.safeParse({ hasPoa: false, courtOrderNumber: '' })
      expect(result.success).toBe(true)
    })

    it('should pass when hasPoa is undefined and courtOrderNumber is undefined', () => {
      const result = schema.safeParse({ hasPoa: undefined, courtOrderNumber: undefined })
      expect(result.success).toBe(true)
    })

    it('should fail when hasPoa is true and missing courtOrderNumber', () => {
      const result = schema.safeParse({ hasPoa: true, courtOrderNumber: '' })
      const issues = result.error!.issues
      expect(issues).toHaveLength(1)
      expect(issues[0]!.message).toBe('This field is required')
      expect(issues[0]!.path).toEqual(['courtOrderNumber'])
      expect(result.success).toBe(false)
    })

    it('should fail when hasPoa is true and courtOrderNumber is too short', () => {
      const result = schema.safeParse({ hasPoa: true, courtOrderNumber: '1234' })
      const issues = result.error!.issues
      expect(issues).toHaveLength(1)
      expect(issues[0]!.message).toBe('Minimum 5 characters')
      expect(issues[0]!.path).toEqual(['courtOrderNumber'])
      expect(result.success).toBe(false)
    })

    it('should fail when hasPoa is true and courtOrderNumber is too long', () => {
      const result = schema.safeParse({ hasPoa: true, courtOrderNumber: 'a'.repeat(21) })
      const issues = result.error!.issues
      expect(issues).toHaveLength(1)
      expect(issues[0]!.message).toBe('Maximum 20 characters')
      expect(issues[0]!.path).toEqual(['courtOrderNumber'])
      expect(result.success).toBe(false)
    })

    it('should pass when hasPoa is true and courtOrderNumber is between 5 and 20 characters', () => {
      const result1 = schema.safeParse({ hasPoa: true, courtOrderNumber: '12345' })
      const result2 = schema.safeParse({ hasPoa: true, courtOrderNumber: 'a'.repeat(20) })
      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
    })
  })
})
