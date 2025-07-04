import { describe, test, expect } from 'vitest'

describe('formatAddressUi util', () => {
  const apiAddress: ApiAddress = {
    streetAddress: '123 Main St',
    streetAddressAdditional: 'Suite 456',
    addressCity: 'Victoria',
    addressRegion: 'BC',
    postalCode: 'V8V 1A1',
    addressCountry: 'CA',
    deliveryInstructions: 'Leave with concierge'
  }

  const expectedUiAddress: UiAddress = {
    street: '123 Main St',
    streetAdditional: 'Suite 456',
    city: 'Victoria',
    region: 'BC',
    postalCode: 'V8V 1A1',
    country: 'CA',
    locationDescription: 'Leave with concierge'
  }

  test('should correctly map ApiAddress to UiAddress', () => {
    const result = formatAddressUi(apiAddress)
    expect(result).toEqual(expectedUiAddress)
  })

  test('should return a UiAddress with all empty strings if input is undefined', () => {
    const result = formatAddressUi(undefined)
    const emptyUiAddress: UiAddress = {
      street: '',
      streetAdditional: '',
      city: '',
      region: '',
      postalCode: '',
      country: '',
      locationDescription: ''
    }
    expect(result).toEqual(emptyUiAddress)
  })

  test('should correctly handle a partial ApiAddress with missing fields', () => {
    const partialApiAddress: Partial<ApiAddress> = {
      streetAddress: '456 Oak Bay Ave',
      addressCity: 'Victoria',
      addressCountry: 'CA'
    }

    const result = formatAddressUi(partialApiAddress as ApiAddress)

    expect(result.street).toBe('456 Oak Bay Ave')
    expect(result.city).toBe('Victoria')
    expect(result.streetAdditional).toBe('')
    expect(result.postalCode).toBe('')
  })
})
