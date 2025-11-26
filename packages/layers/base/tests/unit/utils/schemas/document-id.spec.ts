import { describe, it, expect } from 'vitest'

describe('getDocumentIdSchema', () => {
  describe('documentIdNumber basic validation', () => {
    const schema = getDocumentIdSchema()

    it('should pass when undefined', () => {
      const result = schema.safeParse({ documentIdNumber: undefined })
      expect(result.success).toBe(true)
    })

    it('should pass when empty string', () => {
      const result = schema.safeParse({ documentIdNumber: '' })
      expect(result.success).toBe(true)
    })

    it('should pass when equal to min length (8 chars)', () => {
      const result = schema.safeParse({ documentIdNumber: '12345678' })
      expect(result.success).toBe(true)
    })

    it('should fail when too short', () => {
      const result = schema.safeParse({ documentIdNumber: '1234567' })
      expect(result.success).toBe(false)
      const issues = result.error!.issues
      expect(issues).toHaveLength(1)
      expect(issues[0].message).toContain('Minimum') // or exact message if known
      expect(issues[0].path).toEqual(['documentIdNumber'])
    })
  })

  describe('superRefine with statusCode', () => {
    it('should fail when statusCode is 400', () => {
      const schema = getDocumentIdSchema(400)
      const result = schema.safeParse({ documentIdNumber: '12345678' })
      expect(result.success).toBe(false)
      const issues = result.error!.issues
      expect(issues).toHaveLength(1)
      expect(issues[0].message).toBe('The number entered is not recognized in our system.')
      expect(issues[0].path).toEqual(['documentIdNumber'])
    })

    it('should fail when statusCode is 200', () => {
      const schema = getDocumentIdSchema(200)
      const result = schema.safeParse({ documentIdNumber: '12345678' })
      expect(result.success).toBe(false)
      const issues = result.error!.issues
      expect(issues).toHaveLength(1)
      expect(issues[0].message).toBe('A document record already exists with this document ID.')
      expect(issues[0].path).toEqual(['documentIdNumber'])
    })

    it('should pass when statusCode is 404', () => {
      const schema = getDocumentIdSchema(404)
      const result = schema.safeParse({ documentIdNumber: '12345678' })
      expect(result.success).toBe(true)
    })

    it('should pass when statusCode is undefined', () => {
      const schema = getDocumentIdSchema(undefined)
      const result = schema.safeParse({ documentIdNumber: '12345678' })
      expect(result.success).toBe(true)
    })
  })
})
