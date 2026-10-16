// @vitest-environment node
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'

describe('date util', () => {
  describe('getToday', () => {
    beforeEach(() => {
      const mockDate = new Date('2025-06-24T02:00:00.000Z')
      vi.setSystemTime(mockDate)
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    test('should return the current date in UTC by default, in ISO format', () => {
      const result = getToday()
      expect(result).toBe('2025-06-24')
    })

    test('should return the correct date for a specified timezone', () => {
      const result = getToday('America/Vancouver')
      expect(result).toBe('2025-06-23')
    })

    test('should return the date in a custom format when provided', () => {
      const result = getToday('UTC', 'LLLL dd, yyyy')
      expect(result).toBe('June 24, 2025')
    })

    test.skip('should return the date in a custom format for a specific timezone', () => {
      const result = getToday('America/Vancouver', 'D')
      expect(result).toBe('6/23/2025')
    })

    test('should throw an error for an invalid timezone', () => {
      const invalidCall = () => getToday('Earth')
      expect(invalidCall).toThrow(/Invalid timezone/)
    })
  })

  describe('toApiDateTime', () => {
    test('should convert a pacific standard time date to UTC', () => {
      expect(toApiDateTime('2021-01-01')).toBe('2021-01-01T08:00:00+00:00')
    })

    test('should convert a pacific daylight time date to UTC', () => {
      expect(toApiDateTime('2021-07-01')).toBe('2021-07-01T07:00:00+00:00')
    })

    test('should convert a date in a given timezone', () => {
      expect(toApiDateTime('2021-07-01', 'UTC')).toBe('2021-07-01T00:00:00+00:00')
    })

    test('should return undefined for an invalid date', () => {
      expect(toApiDateTime('not-a-date')).toBeUndefined()
    })
  })
})
