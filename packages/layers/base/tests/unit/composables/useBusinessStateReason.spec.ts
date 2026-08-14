import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const baseBusiness = {
  legalName: 'Test Business Inc.',
  legalType: 'BC',
  identifier: 'BC1234567',
  state: EntityState.HISTORICAL,
  stateFiling: 'https://legal-api.test/api/v2/businesses/BC1234567/filings/12345'
} as BusinessDataPublic

const mockGetPublicStateFiling = vi.fn()

mockNuxtImport('useBusinessService', () => {
  return vi.fn(() => {
    return {
      getPublicStateFiling: mockGetPublicStateFiling
    }
  })
})

describe('useBusinessStateReason', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useBusinessStore().$reset()
  })

  it('returns empty string when the business is not historical', async () => {
    useBusinessStore().business = { ...baseBusiness, state: EntityState.ACTIVE }
    const { getStateReason } = useBusinessStateReason()
    expect(await getStateReason()).toBe('')
    expect(mockGetPublicStateFiling).not.toHaveBeenCalled()
  })

  it('returns the amalgamation reason without fetching the state filing', async () => {
    useBusinessStore().business = {
      ...baseBusiness,
      stateFiling: undefined,
      amalgamatedInto: {
        amalgamationDate: '2026-08-13T07:00:00+00:00',
        identifier: 'BC7654321'
      }
    }
    const { getStateReason } = useBusinessStateReason()
    expect(await getStateReason()).toBe('Amalgamation – August 13, 2026 – BC7654321')
    expect(mockGetPublicStateFiling).not.toHaveBeenCalled()
  })

  it('falls back to Unknown Company when the amalgamated identifier is missing', async () => {
    useBusinessStore().business = {
      ...baseBusiness,
      stateFiling: undefined,
      amalgamatedInto: { amalgamationDate: '2026-08-13T07:00:00+00:00' }
    }
    const { getStateReason } = useBusinessStateReason()
    expect(await getStateReason()).toBe('Amalgamation – August 13, 2026 – Unknown Company')
  })

  it.each([
    ['administrative', 'Administrative Dissolution'],
    ['involuntary', 'Dissolved for Failure to File'],
    ['voluntary', 'Voluntary Dissolution']
  ])('returns the %s dissolution reason', async (subType, expected) => {
    useBusinessStore().business = { ...baseBusiness }
    mockGetPublicStateFiling.mockResolvedValue({
      filing: {
        header: { name: 'dissolution', effectiveDate: '2026-01-16T04:22:50+00:00' },
        dissolution: { type: subType, dissolutionDate: '2026-01-15' }
      }
    })
    const { getStateReason } = useBusinessStateReason()
    expect(await getStateReason()).toBe(`${expected} – January 15, 2026`)
    expect(mockGetPublicStateFiling).toHaveBeenCalledWith('BC1234567', '12345')
  })

  it('uses the firm dissolution reason for firms', async () => {
    useBusinessStore().business = { ...baseBusiness, identifier: 'FM1234567', legalType: 'SP' } as BusinessDataPublic
    mockGetPublicStateFiling.mockResolvedValue({
      filing: {
        header: { name: 'dissolution', effectiveDate: '2026-01-16T04:22:50+00:00' },
        dissolution: { type: 'voluntary', dissolutionDate: '2026-01-15' }
      }
    })
    const { getStateReason } = useBusinessStateReason()
    expect(await getStateReason()).toBe('Dissolution – January 15, 2026')
  })

  it('falls back to the effective date when dissolutionDate is missing', async () => {
    useBusinessStore().business = { ...baseBusiness }
    mockGetPublicStateFiling.mockResolvedValue({
      filing: {
        header: { name: 'dissolution', effectiveDate: '2026-01-16T04:22:50+00:00' },
        dissolution: { type: 'voluntary' }
      }
    })
    const { getStateReason } = useBusinessStateReason()
    expect(await getStateReason()).toBe('Voluntary Dissolution – January 15, 2026')
  })

  it('returns the put back off reason with its expiry date', async () => {
    useBusinessStore().business = { ...baseBusiness }
    mockGetPublicStateFiling.mockResolvedValue({
      filing: {
        header: { name: 'putBackOff', effectiveDate: '2026-01-16T04:22:50+00:00' },
        putBackOff: { reason: 'Limited Restoration Expired', expiryDate: '2026-01-15' }
      }
    })
    const { getStateReason } = useBusinessStateReason()
    expect(await getStateReason()).toBe('Limited Restoration Expired – January 15, 2026')
  })

  it('returns the continuation out reason with a date time', async () => {
    useBusinessStore().business = { ...baseBusiness }
    mockGetPublicStateFiling.mockResolvedValue({
      filing: {
        header: { name: 'continuationOut', effectiveDate: '2026-01-16T04:22:50+00:00' }
      }
    })
    const { getStateReason } = useBusinessStateReason()
    expect(await getStateReason()).toBe('Continuation Out – January 15, 2026 at 8:22 pm Pacific time')
  })

  it('falls back to the filing name for other state filing types', async () => {
    useBusinessStore().business = { ...baseBusiness }
    mockGetPublicStateFiling.mockResolvedValue({
      filing: {
        header: { name: 'amalgamationOut', effectiveDate: '2026-01-16T04:22:50+00:00' }
      }
    })
    const { getStateReason } = useBusinessStateReason()
    expect(await getStateReason()).toBe('Amalgamation Out – January 15, 2026 at 8:22 pm Pacific time')
  })

  it('returns empty string when the state filing fetch fails', async () => {
    useBusinessStore().business = { ...baseBusiness }
    mockGetPublicStateFiling.mockRejectedValue(new Error('nope'))
    const { getStateReason } = useBusinessStateReason()
    expect(await getStateReason()).toBe('')
  })

  it('setTombstoneStateReason appends the reason to the tombstone details', async () => {
    useBusinessStore().business = {
      ...baseBusiness,
      stateFiling: undefined,
      amalgamatedInto: {
        amalgamationDate: '2026-08-13T07:00:00+00:00',
        identifier: 'BC7654321'
      }
    }
    const { businessTombstone, resetTombstone } = useBusinessTombstone()
    resetTombstone()
    businessTombstone.value.details = [{ badge: { label: 'HISTORICAL' } }]
    const { setTombstoneStateReason } = useBusinessStateReason()
    await setTombstoneStateReason()
    expect(businessTombstone.value.details).toEqual([
      { badge: { label: 'HISTORICAL' } },
      { text: 'Amalgamation – August 13, 2026 – BC7654321' }
    ])
  })
})
