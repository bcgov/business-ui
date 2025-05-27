import { describe, expect, it } from 'vitest'

describe('Date Utilities', () => {
  describe('dateStringToDate', () => {
    it('converts a date string to a Date object', () => {
      const dateString = '2024-04-26'
      const date = dateStringToDate(dateString)
      expect(date).toEqual(new Date(2024, 3, 26))
    })

    it('returns null for an invalid date string', () => {
      const dateString = 'invalid-date'
      const date = dateStringToDate(dateString)
      expect(date).toBeNull()
    })
  })

  describe('dateToString', () => {
    it('formats a Date object to a string', () => {
      const date = new Date(2024, 3, 26)
      const formattedDate = dateToString(date, 'YYYY-MM-DD')
      expect(formattedDate).toBe('2024-04-26')
    })
  })

  describe('datetimeStringToDateString', () => {
    it('converts a datetime string to a date string', () => {
      const datetimeString = '2024-04-26T10:30:00+00:00'
      const dateString = datetimeStringToDateString(datetimeString)
      expect(dateString).toBe('2024-04-26')
    })
  })

  describe('addOneYear', () => {
    it('adds one year to a date string', () => {
      const dateString = '2024-04-26'
      const newDateString = addOneYear(dateString)
      expect(newDateString).toBe('2025-04-26')
    })
  })
})
