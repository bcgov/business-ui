import { describe, test, expect } from 'vitest'

describe('validateBusinessAllowedFilings', () => {
  // Mock business data for testing
  const mockBusiness = {
    allowedActions: {
      filing: {
        filingTypes: [
          { name: 'alteration' },
          { name: 'changeOfDirectors' },
          { name: 'annualReport' }
        ]
      }
    }
  } as unknown as BusinessData

  test('should return true when the filing name is in the allowed list', () => {
    const isAllowed = validateBusinessAllowedFilings(mockBusiness, 'alteration')
    expect(isAllowed).toBe(true)
  })

  test('should return false when the filing name is NOT in the allowed list', () => {
    const isAllowed = validateBusinessAllowedFilings(mockBusiness, 'changeOfOfficers')
    expect(isAllowed).toBe(false)
  })

  test('should return false when the allowed filings list is empty', () => {
    const businessWithNoFilings = {
      allowedActions: {
        filing: {
          filingTypes: []
        }
      }
    } as unknown as BusinessData
    const isAllowed = validateBusinessAllowedFilings(businessWithNoFilings, 'alteration')
    expect(isAllowed).toBe(false)
  })

  test('should handle missing properties and return false', () => {
    const businessMissingFilingTypes = { allowedActions: { filing: {} } } as BusinessData
    const businessMissingFiling = { allowedActions: {} } as BusinessData
    const businessMissingActions = {} as BusinessData

    expect(validateBusinessAllowedFilings(businessMissingFilingTypes, 'alteration')).toBe(false)
    expect(validateBusinessAllowedFilings(businessMissingFiling, 'alteration')).toBe(false)
    expect(validateBusinessAllowedFilings(businessMissingActions, 'alteration')).toBe(false)
  })
})
