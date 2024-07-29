import { describe, expect, it, afterEach, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { mockedKeycloak } from '~/tests/mocks/mockedKeycloak'
import { mockNewAccount } from '~/tests/mocks/mockedData'
import payApi from '~/services/pay-api'

// Mock data
const mockFeeData: FeeData = {
  entityType: 'BC',
  filingTypeCode: 'BCANN',
  futureEffective: false,
  priority: true,
  waiveFees: false
}

mockNuxtImport('useRuntimeConfig', () => {
  return () => (
    {
      public: {
        payApiURL: 'https://pay.api./v1'
      }
    }
  )
})

describe('Pay API Service', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const accountStore = useAccountStore()
    accountStore.currentAccount = mockNewAccount
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('creates the correct fee info URL', () => {
    const url = payApi.constructFeeInfoURL(mockFeeData)
    expect(url).toBe('https://pay.api./v1/fees/BC/BCANN')
  })

  it('gets the correct query parameters', () => {
    const queryParams = payApi.getPayFeesApiQueryParams(mockFeeData)
    expect(queryParams).toEqual({
      waiveFees: undefined,
      futureEffective: undefined,
      priority: true
    })
  })

  it('calls $fetch with correct options', async () => {
    const _fetch = vi.fn()
    vi.stubGlobal('$fetch', _fetch)

    await payApi.fetchFee(mockFeeData)

    expect(_fetch).toHaveBeenCalledWith('https://pay.api./v1/fees/BC/BCANN', {
      query: {
        waiveFees: undefined,
        futureEffective: undefined,
        priority: true
      },
      headers: {
        Authorization: `Bearer ${mockedKeycloak.token}`,
        'Account-Id': mockNewAccount.id.toString()
      }
    })
  })
})
