import { describe, it, expect } from 'vitest'

const bcAddress = {
  street: '123 Main St',
  streetAdditional: '',
  city: 'Victoria',
  region: 'BC',
  postalCode: 'V8V 1V1',
  country: 'CA',
  locationDescription: ''
}

function makeState(overrides?: Partial<typeof bcAddress>) {
  return {
    deliveryAddress: { ...bcAddress, ...overrides },
    mailingAddress: { ...bcAddress, ...overrides },
    sameAs: true
  }
}

describe('getAddressSchema', () => {
  it('should allow any region/country by default', () => {
    const schema = getAddressSchema()
    const result = schema.safeParse(makeState({ region: 'ON' }))
    expect(result.success).toBe(true)
  })

  describe('bcCanadaOnly option', () => {
    it('should pass for a BC, Canada address', () => {
      const schema = getAddressSchema({ bcCanadaOnly: true })
      expect(schema.safeParse(makeState()).success).toBe(true)
    })

    it('should fail for a non-BC region', () => {
      const schema = getAddressSchema({ bcCanadaOnly: true })
      const result = schema.safeParse(makeState({ region: 'ON' }))
      expect(result.success).toBe(false)
      const messages = result.error!.issues.map(i => i.message)
      expect(messages).toContain('Address must be in British Columbia')
    })

    it('should fail for a non-Canada country', () => {
      const schema = getAddressSchema({ bcCanadaOnly: true })
      const result = schema.safeParse(makeState({ country: 'US', region: 'WA', postalCode: '98101' }))
      expect(result.success).toBe(false)
      const messages = result.error!.issues.map(i => i.message)
      expect(messages).toContain('Address must be in Canada')
    })
  })
})

describe('getAddressWithIdSchema', () => {
  it('should enforce BC/Canada when the option is set', () => {
    const schema = getAddressWithIdSchema({ bcCanadaOnly: true })
    const state = makeState({ region: 'AB' })
    const result = schema.safeParse({
      ...state,
      deliveryAddress: { ...state.deliveryAddress, id: '1' },
      mailingAddress: { ...state.mailingAddress, id: '2' }
    })
    expect(result.success).toBe(false)
    expect(result.error!.issues.map(i => i.message)).toContain('Address must be in British Columbia')
  })

  it('should keep default behaviour without the option', () => {
    const schema = getAddressWithIdSchema()
    const state = makeState({ region: 'AB' })
    const result = schema.safeParse({
      ...state,
      deliveryAddress: { ...state.deliveryAddress, id: '1' },
      mailingAddress: { ...state.mailingAddress, id: '2' }
    })
    expect(result.success).toBe(true)
  })
})
