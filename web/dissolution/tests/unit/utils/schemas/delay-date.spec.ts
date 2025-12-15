import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const todayMockDate = '2025-12-15T12:00:00.000Z'
const todayMockIso = '2025-12-15'
const yesterdayMockIso = '2025-12-14'
const tomorrowMockIso = '2025-12-16'

describe('getDelayDateSchema', () => {
  const schema = getDelayDateSchema()

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(todayMockDate))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should pass with no date when SIX_MONTHS DelayOption is selected', () => {
    const data = {
      option: DelayOption.SIX_MONTHS,
      date: ''
    }
    const result = schema.safeParse(data)
    expect(result.success).toEqual(true)
    expect(result.data).toEqual(data)
  })

  it('should fail with no date and CUSTOM DelayOption is selected', () => {
    const data = {
      option: DelayOption.CUSTOM,
      date: ''
    }
    const result = schema.safeParse(data)
    expect(result).toMatchObject({
      success: false,
      error: {
        issues: expect.arrayContaining([
          expect.objectContaining({
            path: ['date'],
            message: 'This field is required'
          })
        ])
      }
    })
  })

  it('should fail when date is in invalid format (MM/DD/YYYY)', () => {
    const data = {
      option: DelayOption.CUSTOM,
      date: '12/16/2025'
    }
    const result = schema.safeParse(data)
    expect(result).toMatchObject({
      success: false,
      error: {
        issues: expect.arrayContaining([
          expect.objectContaining({
            path: ['date'],
            message: 'Date must be in YYYY-MM-DD format.'
          })
        ])
      }
    })
  })

  it('should fail when date format is correct but invalid (e.g., Feb 30th)', () => {
    const data = {
      option: DelayOption.CUSTOM,
      date: '2025-02-30'
    }
    const result = schema.safeParse(data)
    expect(result).toMatchObject({
      success: false,
      error: {
        issues: expect.arrayContaining([
          expect.objectContaining({
            path: ['date'],
            message: 'Please enter a valid date.'
          })
        ])
      }
    })
  })

  it('should fail when date is today', () => {
    const data = {
      option: DelayOption.CUSTOM,
      date: todayMockIso
    }
    const result = schema.safeParse(data)
    expect(result).toMatchObject({
      success: false,
      error: {
        issues: expect.arrayContaining([
          expect.objectContaining({
            path: ['date'],
            message: 'The delay date must be a valid date after today.'
          })
        ])
      }
    })
  })

  it('should fail when date is less than today', () => {
    const data = {
      option: DelayOption.CUSTOM,
      date: yesterdayMockIso
    }
    const result = schema.safeParse(data)
    expect(result).toMatchObject({
      success: false,
      error: {
        issues: expect.arrayContaining([
          expect.objectContaining({
            path: ['date'],
            message: 'The delay date must be a valid date after today.'
          })
        ])
      }
    })
  })

  it('should pass when date is tomorrow', () => {
    const data = {
      option: DelayOption.CUSTOM,
      date: tomorrowMockIso
    }
    expect(schema.safeParse(data).success).toEqual(true)
  })

  it('should ignore an invalid date if SIX_MONTHS DelayOption is selected', () => {
    const data = {
      option: DelayOption.SIX_MONTHS,
      date: '2025-02-30'
    }
    expect(schema.safeParse(data).success).toEqual(true)
  })

  it('should fail a partial date', () => {
    const data = {
      option: DelayOption.CUSTOM,
      date: '2025-12-1'
    }
    const result = schema.safeParse(data)
    expect(result).toMatchObject({
      success: false,
      error: {
        issues: expect.arrayContaining([
          expect.objectContaining({
            message: 'Date must be in YYYY-MM-DD format.'
          })
        ])
      }
    })
  })
})
