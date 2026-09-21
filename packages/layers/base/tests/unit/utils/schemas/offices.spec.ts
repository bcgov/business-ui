import { describe, it, expect } from 'vitest'

const mockOffice = {
  id: '15f88a9b-25c4-47be-93d2-04eb2db31cec',
  isEditing: false,
  actions: [],
  type: 'custodialOffice',
  address: {
    deliveryAddress: {
      id: '3226284',
      street: '5670 YEW STREET',
      streetAdditional: '',
      city: 'VANCOUVER',
      region: 'BC',
      postalCode: 'V6M 3Y3',
      country: 'CA',
      locationDescription: ''
    },
    mailingAddress: {
      id: '3226283',
      street: '5670 YEW STREET',
      streetAdditional: '',
      city: 'VANCOUVER',
      region: 'BC',
      postalCode: 'V6M 3Y3',
      country: 'CA',
      locationDescription: ''
    },
    sameAs: true
  }
}

describe('getOfficesSchema', () => {
  const schema = getOfficesSchema()

  describe('actions', () => {
    it('should pass when actions is an empty array', () => {
      const result = schema.safeParse(mockOffice)
      expect(result.success).toBe(true)
    })

    it('should pass with valid ActionTypes', () => {
      const result = schema.safeParse({ ...mockOffice, actions: [ActionType.ADDED, ActionType.ADDRESS_CHANGED] })
      expect(result.success).toBe(true)
    })

    it('should fail with invalid ActionTypes', () => {
      const result = schema.safeParse({ ...mockOffice, actions: ['INVALID_ACTION'] })
      expect(result.success).toBe(false)
    })
  })

  describe('type', () => {
    it('should pass with a valid OfficeType', () => {
      Object.values(OfficeType).forEach((type) => {
        const result = schema.safeParse({ ...mockOffice, type })
        expect(result.success).toBe(true)
      })
    })

    it('should fail with an invalid OfficeType', () => {
      const result = schema.safeParse({ ...mockOffice, type: 'invalid-type' })
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
    const result = activeSchema.safeParse({ ...mockOffice, type: OfficeType.RECORDS })
    expect(result.success).toBe(true)
    expect(result.data?.type).toBe(OfficeType.RECORDS)
  })
})
