import { describe, expect, it } from 'vitest'

describe('isoCountriesList Util', () => {
  describe('isoCountriesList', () => {
    it('contains the correct number of entries', () => {
      expect(isoCountriesList.length).toBe(249)
    })

    it('has the correct structure for all entries', () => {
      isoCountriesList.forEach((country) => {
        expect(country).toHaveProperty('alpha_2')
        expect(country).toHaveProperty('alpha_3')
        expect(country).toHaveProperty('flag')
        expect(country).toHaveProperty('name')
        expect(country).toHaveProperty('numeric')
      })
    })
  })

  describe('countrySubdivisions', () => {
    it('should have subdivisions for Canada and the US', () => {
      expect(countrySubdivisions).toHaveProperty('ca')
      expect(countrySubdivisions).toHaveProperty('us')
    })

    it('should have correct data structure for Canadian subdivisions', () => {
      countrySubdivisions.ca.forEach((item) => {
        expect(item).toHaveProperty('code')
        expect(item).toHaveProperty('name')
      })
      expect(countrySubdivisions.ca[0].code).toBe('AB')
      expect(countrySubdivisions.ca[0].name).toBe('Alberta')
    })

    it('should have correct data structure for US subdivisions', () => {
      countrySubdivisions.us.forEach((item) => {
        expect(item).toHaveProperty('code')
        expect(item).toHaveProperty('name')
      })
      expect(countrySubdivisions.us[0].code).toBe('AL')
      expect(countrySubdivisions.us[0].name).toBe('Alabama')
    })
  })
})
