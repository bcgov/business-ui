import { describe, it, expect } from 'vitest'

describe('getCorrectionSchema', () => {
  it('should produce a valid staff schema with expected shape', () => {
    const schema = getCorrectionSchema(true)
    const result = schema.safeParse({})

    expect(result.success).toBe(true)
    // Staff should have courtOrder + staffPayment
    expect(result.data).toHaveProperty('courtOrder')
    expect(result.data).toHaveProperty('staffPayment')
    // Staff should NOT have certify + completingParty
    expect(result.data).not.toHaveProperty('certify')
    expect(result.data).not.toHaveProperty('completingParty')
  })

  it('should produce a valid client schema with expected shape', () => {
    const schema = getCorrectionSchema(false)
    const result = schema.safeParse({})

    expect(result.success).toBe(true)
    // Client should have certify + completingParty + staffPayment
    expect(result.data).toHaveProperty('certify')
    expect(result.data).toHaveProperty('completingParty')
    expect(result.data).toHaveProperty('staffPayment')
    // Client should NOT have courtOrder
    expect(result.data).not.toHaveProperty('courtOrder')
  })

  it('should include common fields in both schemas', () => {
    for (const isStaff of [true, false]) {
      const schema = getCorrectionSchema(isStaff)
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty('comment')
      expect(result.data).toHaveProperty('documentDelivery')
      expect(result.data).toHaveProperty('staffPayment')
    }
  })
})
