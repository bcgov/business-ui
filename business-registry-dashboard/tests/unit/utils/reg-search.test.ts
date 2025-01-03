import { describe, expect, it, vi, afterEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'

mockNuxtImport('useKeycloak', () => {
  return () => (
    {
      getToken: vi.fn().mockResolvedValue('123')
    }
  )
})

mockNuxtImport('useConnectAccountStore', () => {
  return () => (
    {
      currentAccount: {
        id: 1
      }
    }
  )
})

mockNuxtImport('useRuntimeConfig', () => {
  return () => (
    {
      public: {
        regSearchApiUrl: 'https://regSearchApiUrl.example.com',
        xApiKey: 'xApiKey.example'
      }
    }
  )
})

describe('regSearch', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should make a fetch request with the correct options', async () => {
    const _fetch = vi.fn().mockResolvedValue({ searchResults: { results: [] } })
    vi.stubGlobal('$fetch', _fetch)

    const queryStr = 'test'
    await regSearch(queryStr)

    await flushPromises()

    expect(_fetch).toHaveBeenCalledWith(
      'https://regSearchApiUrl.example.com/businesses/search/facets?' +
      'start=0&rows=20&categories=legalType:A,BC,BEN,C,CBEN,CC,CCC,CP,CUL,FI,GP,LL,LLC,LP,PA,S,SP,ULC,XCP,XL,XP,XS&query=value:test',
      {
        headers: {
          Authorization: 'Bearer 123',
          'x-apikey': 'xApiKey.example',
          'Account-Id': 1
        }
      }
    )
  })
})
