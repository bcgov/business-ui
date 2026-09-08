import { describe, it, expect } from 'vitest'

describe('getAmalgamationCorrectSchema', () => {
  const schema = getAmalgamationCorrectSchema()

  describe('schema defaults', () => {
    it('should generate expected default state via parse({})', () => {
      const result = schema.parse({})
      expect(result).toEqual({
        name: '',
        number: '',
        jurisdiction: {
          country: '',
          region: null
        }
      })
    })
  })

  describe('name', () => {
    it('should fail when empty string', () => {
      const result = schema.safeParse({
        name: '',
        number: 'ABC-123',
        jurisdiction: { country: 'CA', region: 'BC' }
      })

      expect(result.success).toBe(false)
      const issues = result.error!.issues
      expect(issues[0]!.message).toBe('This field is required')
      expect(issues[0]!.path).toEqual(['name'])
    })

    it('should fail when whitespace only', () => {
      const result = schema.safeParse({
        name: '   ',
        number: 'ABC-123',
        jurisdiction: { country: 'CA', region: 'BC' }
      })

      expect(result.success).toBe(false)
      const issues = result.error!.issues
      expect(issues[0]!.message).toBe('This field is required')
      expect(issues[0]!.path).toEqual(['name'])
    })

    it('should fail when fewer than 3 characters', () => {
      const result = schema.safeParse({
        name: 'AB',
        number: 'ABC-123',
        jurisdiction: { country: 'CA', region: 'BC' }
      })

      expect(result.success).toBe(false)
      const issues = result.error!.issues
      expect(issues[0]!.message).toBe('Minimum 3 characters')
      expect(issues[0]!.path).toEqual(['name'])
    })

    it('should pass when equal to or greater than 3 characters', () => {
      const result = schema.safeParse({
        name: 'ABC',
        number: 'ABC-123',
        jurisdiction: { country: 'CA', region: 'BC' }
      })

      expect(result.success).toBe(true)
    })
  })

  describe('number', () => {
    it('should fail when empty string', () => {
      const result = schema.safeParse({
        name: 'Valid Name',
        number: '',
        jurisdiction: { country: 'CA', region: 'BC' }
      })

      expect(result.success).toBe(false)
      const issues = result.error!.issues
      expect(issues[0]!.message).toBe('This field is required')
      expect(issues[0]!.path).toEqual(['number'])
    })

    it('should fail when fewer than 3 characters', () => {
      const result = schema.safeParse({
        name: 'Valid Name',
        number: 'A1',
        jurisdiction: { country: 'CA', region: 'BC' }
      })

      expect(result.success).toBe(false)
      const issues = result.error!.issues
      expect(issues[0]!.message).toBe('Minimum 3 characters')
      expect(issues[0]!.path).toEqual(['number'])
    })

    it('should fail when invalid characters are used', () => {
      const result = schema.safeParse({
        name: 'Valid Name',
        number: 'ABC_123!',
        jurisdiction: { country: 'CA', region: 'BC' }
      })

      expect(result.success).toBe(false)
      const issues = result.error!.issues
      expect(issues[0]!.message).toBe('Corporate number may only contain letters, numbers, and hyphens')
      expect(issues[0]!.path).toEqual(['number'])
    })

    it('should pass with valid alphanumeric characters and hyphens', () => {
      const result = schema.safeParse({
        name: 'Valid Name',
        number: 'BC-123456',
        jurisdiction: { country: 'CA', region: 'BC' }
      })

      expect(result.success).toBe(true)
    })
  })

  describe('jurisdiction', () => {
    it('should fail when jurisdiction country is empty string', () => {
      const result = schema.safeParse({
        name: 'Valid Name',
        number: 'ABC-123',
        jurisdiction: { country: '', region: null }
      })

      expect(result.success).toBe(false)
      const issues = result.error!.issues
      expect(issues[0]!.message).toBe('This field is required')
      expect(issues[0]!.path).toEqual(['jurisdiction', 'country'])
    })

    it('should fail when jurisdiction country is whitespace only', () => {
      const result = schema.safeParse({
        name: 'Valid Name',
        number: 'ABC-123',
        jurisdiction: { country: '   ', region: null }
      })

      expect(result.success).toBe(false)
      const issues = result.error!.issues
      expect(issues[0]!.message).toBe('This field is required')
      expect(issues[0]!.path).toEqual(['jurisdiction', 'country'])
    })

    it('should pass with valid country and null region', () => {
      const result = schema.safeParse({
        name: 'Valid Name',
        number: 'ABC-123',
        jurisdiction: { country: 'US', region: null }
      })

      expect(result.success).toBe(true)
    })

    it('should pass with valid country and valid string region', () => {
      const result = schema.safeParse({
        name: 'Valid Name',
        number: 'ABC-123',
        jurisdiction: { country: 'CA', region: 'ON' }
      })

      expect(result.success).toBe(true)
    })
  })
})

describe('getAmalgamationCorrectStatementSchema', () => {
  const schema = getAmalgamationCorrectStatementSchema()

  it('defaults courtApproval to false when empty', () => {
    const result = schema.parse({})
    expect(result).toEqual({ courtApproval: false })
  })

  it('accepts boolean values', () => {
    expect(schema.parse({ courtApproval: true })).toEqual({ courtApproval: true })
    expect(schema.parse({ courtApproval: false })).toEqual({ courtApproval: false })
  })
})
