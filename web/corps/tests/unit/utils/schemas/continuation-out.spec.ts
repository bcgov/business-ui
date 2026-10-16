import { describe, it, expect, beforeEach } from 'vitest'

describe('getContinuationOutSchema', () => {
  let schema: ReturnType<typeof getContinuationOutSchema>

  beforeEach(() => {
    schema = getContinuationOutSchema()
  })

  it('should use correct default values', () => {
    const result = schema.safeParse({})

    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      documentDelivery: { completingPartyEmail: '' }
    })
  })

  it('should not include a folio number or staff payment - the filing is staff only and free', () => {
    const result = schema.safeParse({})

    expect(result.success).toBe(true)
    expect(result.data).not.toHaveProperty('folio')
    expect(result.data).not.toHaveProperty('staffPayment')
  })

  it('should pass with an optional completing party email', () => {
    const result = schema.safeParse({
      documentDelivery: { completingPartyEmail: 'extra@example.com' }
    })

    expect(result.success).toBe(true)
    expect(result.data?.documentDelivery).toEqual({ completingPartyEmail: 'extra@example.com' })
  })

  it('should fail when the completing party email is invalid', () => {
    const result = schema.safeParse({
      documentDelivery: { completingPartyEmail: 'not-an-email' }
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues.map(i => i.path.join('.'))).toContain('documentDelivery.completingPartyEmail')
  })
})
