import { describe, test, expect } from 'vitest'

describe('business corp info utils', () => {
  describe('getCorpInfoObject', () => {
    test('should return the correct object for a known corp type code', () => {
      const result = getCorpInfoObject(CorpTypeCd.BENEFIT_COMPANY)

      expect(result).not.toBeNull()
      expect(result).toBeTypeOf('object')

      expect(result?.corpTypeCd).toBe(CorpTypeCd.BENEFIT_COMPANY)
      expect(result?.fullDesc).toBe('BC Benefit Company')
      expect(result?.corpClass).toBe(CorpClass.BC)
    })

    test('should return null for a corp type code that does not exist', () => {
      const result = getCorpInfoObject('INVALID_CODE' as CorpTypeCd)
      expect(result).toBeNull()
    })
  })

  describe('getCorpFullDescription', () => {
    test('should return the correct full description for a known corp type code', () => {
      const result = getCorpFullDescription(CorpTypeCd.BC_CCC)
      expect(result).toBe('BC Community Contribution Company')
    })

    test('should return an empty string for a corp type code that does not exist', () => {
      const result = getCorpFullDescription('INVALID_CODE' as CorpTypeCd)
      expect(result).toBe('')
    })
  })

  describe('getCorpNumberedDescription', () => {
    test('should return the correct numbered description for a corp type that has one', () => {
      const result = getCorpNumberedDescription(CorpTypeCd.BC_ULC_COMPANY)
      expect(result).toBe('Numbered Unlimited Liability Company')
    })

    test('should return an empty string for a corp type that does NOT have a numberedDesc property', () => {
      // 'SOCIETY' exists but does not have a 'numberedDesc'.
      const result = getCorpNumberedDescription(CorpTypeCd.SOCIETY)
      expect(result).toBe('')
    })

    test('should return an empty string for a corp type code that does not exist', () => {
      const result = getCorpNumberedDescription('INVALID_CODE' as CorpTypeCd)
      expect(result).toBe('')
    })
  })
})
