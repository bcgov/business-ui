import { describe, expect, test } from 'vitest'

describe('isoCountriesList util', () => {
  test('every country has all base properties', () => {
    for (const country of isoCountriesList) {
      expect(country).toHaveProperty('alpha_2')
      expect(country).toHaveProperty('alpha_3')
      expect(country).toHaveProperty('name')
      expect(country).toHaveProperty('numeric')
      expect(country).toHaveProperty('flag')

      expect(typeof country.alpha_2).toBe('string')
      expect(typeof country.name).toBe('string')
    }
  })

  test('has correct subdivisions, CA and US', () => {
    expect(countrySubdivisions).toBeTypeOf('object')
    expect(countrySubdivisions).toHaveProperty('ca')
    expect(countrySubdivisions).toHaveProperty('us')

    expect(Array.isArray(countrySubdivisions.ca)).toBe(true)
    expect(Array.isArray(countrySubdivisions.us)).toBe(true)
  })

  test('sorted length should match original length', () => {
    expect(iscCountriesListSortedByName.length).toBe(isoCountriesList.length)
  })
})
