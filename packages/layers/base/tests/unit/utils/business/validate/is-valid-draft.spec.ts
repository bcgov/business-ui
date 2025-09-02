import { describe, test, expect } from 'vitest'

describe('isValidDraft util', () => {
  const filingName = 'changeOfOfficers'

  test('should return true for a valid draft filing with the correct data', () => {
    const validDraft = {
      filing: {
        header: { status: FilingStatus.DRAFT },
        changeOfOfficers: { relationships: [] }
      }
    }
    expect(isValidDraft(filingName, validDraft)).toBe(true)
  })

  test('should return false if the filing status is not DRAFT', () => {
    const completedFiling = {
      filing: {
        header: { status: FilingStatus.COMPLETED },
        changeOfOfficers: { relationships: [] }
      }
    }
    expect(isValidDraft(filingName, completedFiling)).toBe(false)
  })

  test('should return false if the specific filing data key is missing', () => {
    const missingDataFiling = {
      filing: {
        header: { status: FilingStatus.DRAFT }
        // Missing the 'changeOfOfficers' key
      }
    }
    expect(isValidDraft(filingName, missingDataFiling)).toBe(false)
  })

  test('should return false if the top-level "filing" key is missing', () => {
    const invalidPayload = { header: { status: FilingStatus.DRAFT } }
    expect(isValidDraft(filingName, invalidPayload)).toBe(false)
  })

  test('should return false if the "header" key is missing', () => {
    const invalidPayload = {
      filing: {
        changeOfOfficers: {}
      }
    }
    expect(isValidDraft(filingName, invalidPayload)).toBe(false)
  })

  test('should return false for null or undefined input', () => {
    expect(isValidDraft(filingName, null)).toBe(false)
    expect(isValidDraft(filingName, undefined)).toBe(false)
  })

  test('should return false for non-object input', () => {
    expect(isValidDraft(filingName, 'a string')).toBe(false)
    expect(isValidDraft(filingName, 123)).toBe(false)
  })
})
