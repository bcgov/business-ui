import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockToday = '2025-12-15T12:00:00.000Z'
const mockInSixMonths = '2026-06-15'

describe('getDodSchema', () => {
  const schema = getDodSchema()

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(mockToday))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should use correct default values', () => {
    const data = {}
    const result = schema.safeParse(data)

    const expectedDefaults = {
      addToLedger: false,
      certify: { isCertified: false, legalName: '' },
      courtOrder: { hasPoa: false, courtOrderNumber: '' },
      folio: { folioNumber: '' },
      delay: {
        option: DelayOption.SIX_MONTHS,
        date: mockInSixMonths
      }
    }

    expect(result.success).toBe(true)
    expect(result.data).toEqual(expectedDefaults)
  })
})
