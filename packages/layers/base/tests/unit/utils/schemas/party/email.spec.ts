import { describe, it, expect } from 'vitest'

describe('getPartyEmailSchema', () => {
  const schema = getPartyEmailSchema()

  it('should pass with a valid email address', () => {
    const result = schema.safeParse({ email: 'name@gov.bc.ca' })
    expect(result.success).toBe(true)
  })

  it('should fail with the required message when empty', () => {
    const result = schema.safeParse({ email: '' })

    expect(result.success).toBe(false)
    const issues = result.error!.issues
    expect(issues).toHaveLength(1)
    expect(issues[0]!.message).toBe('This field is required')
    expect(issues[0]!.path).toEqual(['email'])
  })

  it('should fail with the invalid email message when not empty but badly formatted', () => {
    const result = schema.safeParse({ email: 'name@gov' })

    expect(result.success).toBe(false)
    const issues = result.error!.issues
    expect(issues).toHaveLength(1)
    expect(issues[0]!.message).toBe('Valid email address is required')
  })

  it('should pass at exactly the 254 character boundary', () => {
    const local = 'a'.repeat(254 - '@gov.bc.ca'.length)
    const email = `${local}@gov.bc.ca`
    expect(email).toHaveLength(254)

    const result = schema.safeParse({ email })
    expect(result.success).toBe(true)
  })

  it('should fail with the max characters message when over 254 characters', () => {
    const local = 'a'.repeat(255 - '@gov.bc.ca'.length)
    const email = `${local}@gov.bc.ca`
    expect(email).toHaveLength(255)

    const result = schema.safeParse({ email })

    expect(result.success).toBe(false)
    const issues = result.error!.issues
    expect(issues).toHaveLength(1)
    expect(issues[0]!.message).toBe('Maximum 254 characters')
  })

  it('should report the max chars message, not the invalid email message, for a too-long badly formatted value', () => {
    const result = schema.safeParse({ email: 'not-an-email-'.repeat(30) })

    expect(result.success).toBe(false)
    const issues = result.error!.issues
    expect(issues).toHaveLength(1)
    expect(issues[0]!.message).toBe('Maximum 254 characters')
  })

  describe('when required is false', () => {
    const optionalSchema = getPartyEmailSchema(false)

    it('should pass when empty', () => {
      const result = optionalSchema.safeParse({ email: '' })
      expect(result.success).toBe(true)
    })

    it('should still fail with the invalid email message when not empty but badly formatted', () => {
      const result = optionalSchema.safeParse({ email: 'name@gov' })

      expect(result.success).toBe(false)
      const issues = result.error!.issues
      expect(issues).toHaveLength(1)
      expect(issues[0]!.message).toBe('Valid email address is required')
    })

    it('should still fail with the max characters message when over 254 characters', () => {
      const local = 'a'.repeat(255 - '@gov.bc.ca'.length)
      const result = optionalSchema.safeParse({ email: `${local}@gov.bc.ca` })

      expect(result.success).toBe(false)
      const issues = result.error!.issues
      expect(issues).toHaveLength(1)
      expect(issues[0]!.message).toBe('Maximum 254 characters')
    })

    it('should pass with a valid email address', () => {
      const result = optionalSchema.safeParse({ email: 'name@gov.bc.ca' })
      expect(result.success).toBe(true)
    })
  })
})
