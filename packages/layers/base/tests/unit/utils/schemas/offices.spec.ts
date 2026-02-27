import { describe, it, expect } from 'vitest'

describe('getOfficesSchema', () => {
  const schema = getOfficesSchema()

  it('should return correct defaults', () => {
    const result = schema.safeParse({})

    expect(result.success).toBe(true)
    expect(result.data!.actions).toEqual([])
    expect(result.data!.type).toBe(OfficeType.REGISTERED)
    expect(result.data!.address.sameAs).toBe(false)
    expect(result.data!.address.deliveryAddress.country).toBe('CA')
    expect(result.data!.address.deliveryAddress.street).toBe('')
  })

  describe('actions', () => {
    it('should pass when actions is an empty array', () => {
      const result = schema.safeParse({ actions: [] })
      expect(result.success).toBe(true)
    })

    it('should pass with valid ActionTypes', () => {
      const result = schema.safeParse({ actions: [ActionType.ADDED, ActionType.ADDRESS_CHANGED] })
      expect(result.success).toBe(true)
    })

    it('should fail with invalid ActionTypes', () => {
      const result = schema.safeParse({ actions: ['INVALID_ACTION'] })
      expect(result.success).toBe(false)
    })
  })

  describe('type', () => {
    it('should pass with a valid OfficeType', () => {
      const result = schema.safeParse({ type: OfficeType.REGISTERED })
      expect(result.success).toBe(true)
    })

    it('should fail with an invalid OfficeType', () => {
      const result = schema.safeParse({ type: 'invalid-type' })
      expect(result.success).toBe(false)
    })
  })
})

describe('getActiveOfficesSchema', () => {
  const activeSchema = getActiveOfficesSchema()

  it('should pass when null', () => {
    const result = activeSchema.safeParse(null)
    expect(result.success).toBe(true)
    expect(result.data).toBeNull()
  })

  it('should pass when undefined', () => {
    const result = activeSchema.safeParse(undefined)
    expect(result.success).toBe(true)
    expect(result.data).toBeUndefined()
  })

  it('should pass when valid office object', () => {
    const result = activeSchema.safeParse({ type: OfficeType.RECORDS })
    expect(result.success).toBe(true)
    expect(result.data?.type).toBe(OfficeType.RECORDS)
  })
})
