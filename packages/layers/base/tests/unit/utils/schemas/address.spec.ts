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

  describe("bcCanadaOnly: 'delivery' option", () => {
    it('should enforce BC, Canada on the delivery address only', () => {
      const schema = getAddressSchema({ bcCanadaOnly: 'delivery' })
      const state = { ...makeState(), sameAs: false }
      state.mailingAddress = { ...state.mailingAddress, region: 'ON' }
      expect(schema.safeParse(state).success).toBe(true)

      state.deliveryAddress = { ...state.deliveryAddress, region: 'ON' }
      const result = schema.safeParse(state)
      expect(result.success).toBe(false)
      expect(result.error!.issues.map(i => i.path.join('.'))).toContain('deliveryAddress.region')
    })

    it('should raise the delivery errors on the mailing address while sameAs is checked', () => {
      // the delivery inputs are hidden and mirror the mailing address when 'same as' is checked
      const schema = getAddressSchema({ bcCanadaOnly: 'delivery' })
      const state = makeState({ country: 'US', region: 'WA', postalCode: '98101' })
      const result = schema.safeParse(state)
      expect(result.success).toBe(false)
      const issues = result.error!.issues.map(i => [i.path.join('.'), i.message])
      expect(issues).toContainEqual([
        'mailingAddress.country',
        'Delivery Address must be in Canada. Uncheck "same as" to enter a different Delivery Address.'
      ])
      expect(issues).toContainEqual([
        'mailingAddress.region',
        'Delivery Address must be in British Columbia. Uncheck "same as" to enter a different Delivery Address.'
      ])
      expect(issues.map(i => i[0])).not.toContain('deliveryAddress.region')
    })

    it('should ignore the delivery address while sameAs is checked', () => {
      // stale delivery data is overwritten by the mailing address on submit
      const schema = getAddressSchema({ bcCanadaOnly: 'delivery' })
      const state = makeState()
      state.deliveryAddress = { ...state.deliveryAddress, region: 'ON' }
      expect(schema.safeParse(state).success).toBe(true)
    })

    it('should allow a non-BC mailing address when sameAs is unchecked', () => {
      const schema = getAddressSchema({ bcCanadaOnly: 'delivery' })
      const state = { ...makeState(), sameAs: false }
      state.mailingAddress = { ...state.mailingAddress, country: 'US', region: 'WA', postalCode: '98101' }
      expect(schema.safeParse(state).success).toBe(true)
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

  it('should raise the delivery errors on the mailing address while sameAs is checked', () => {
    const schema = getAddressWithIdSchema({ bcCanadaOnly: 'delivery' })
    const state = makeState({ region: 'AB' })
    const result = schema.safeParse({
      ...state,
      deliveryAddress: { ...state.deliveryAddress, id: '1' },
      mailingAddress: { ...state.mailingAddress, id: '2' }
    })
    expect(result.success).toBe(false)
    expect(result.error!.issues.map(i => i.path.join('.'))).toEqual(['mailingAddress.region'])
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
