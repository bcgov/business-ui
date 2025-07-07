import { describe, test, expect } from 'vitest'

describe('zod schemas - address vlaidation', () => {
  describe('getRequiredAddressSchema', () => {
    const schema = getRequiredAddressSchema()

    const validAddress = {
      street: '123 Main St',
      city: 'Victoria',
      region: 'BC',
      postalCode: 'V8V 1A1',
      country: 'CA'
    }

    test('should pass with a valid address', () => {
      const result = schema.safeParse(validAddress)
      expect(result.success).toBe(true)
    })

    test('should fail if a required field is missing', () => {
      const invalidAddress = { ...validAddress, street: '' }
      const result = schema.safeParse(invalidAddress)

      expect(result.success).toBe(false)
      const streetError = result.error?.issues.find(i => i.path[0] === 'street')
      expect(streetError?.message).toBe('This field is required')
    })

    test('should fail if region is missing for Canada', () => {
      const invalidAddress = { ...validAddress, region: '' }
      const result = schema.safeParse(invalidAddress)

      expect(result.success).toBe(false)
      const regionError = result.error?.issues.find(i => i.path[0] === 'region')
      expect(regionError?.message).toBe('This field is required')
    })

    test('should fail if region is missing for the US', () => {
      const invalidAddress = { ...validAddress, country: 'US', region: '' }
      const result = schema.safeParse(invalidAddress)

      expect(result.success).toBe(false)
      const regionError = result.error?.issues.find(i => i.path[0] === 'region')
      expect(regionError?.message).toBe('This field is required')
    })

    test('should pass if region is missing for a country other than CA or US', () => {
      const otherCountryAddress = { ...validAddress, country: 'FR', region: '' }
      const result = schema.safeParse(otherCountryAddress)
      expect(result.success).toBe(true)
    })

    test('should fail if region has more than 2 characters', () => {
      const invalidAddress = { ...validAddress, region: 'ABC' }
      const result = schema.safeParse(invalidAddress)

      expect(result.success).toBe(false)
      const regionError = result.error?.issues.find(i => i.path[0] === 'region')
      expect(regionError?.message).toBe('Maximum 2 characters')
    })
  })

  describe('getNotRequiredAddressSchema', () => {
    const schema = getNotRequiredAddressSchema()

    test('should pass if all fields are empty strings or optional fields are missing', () => {
      const emptyAddress = {
        street: '',
        city: '',
        postalCode: '',
        country: ''
      }
      const result = schema.safeParse(emptyAddress)
      expect(result.success).toBe(true)
    })

    test('should fail if region has more than 2 characters', () => {
      const invalidAddress = {
        street: '',
        city: '',
        postalCode: '',
        country: '',
        region: 'ABC'
      }
      const result = schema.safeParse(invalidAddress)

      expect(result.success).toBe(false)
      const regionError = result.error?.issues.find(i => i.path[0] === 'region')
      expect(regionError?.message).toBe('Maximum 2 characters')
    })

    test('should pass even if country is provided but region is not', () => {
      const partialAddress = {
        street: '123 Main St',
        city: 'Victoria',
        postalCode: 'V8V 1A1',
        country: 'CA',
        region: ''
      }
      const result = schema.safeParse(partialAddress)
      expect(result.success).toBe(true)
    })
  })
})
