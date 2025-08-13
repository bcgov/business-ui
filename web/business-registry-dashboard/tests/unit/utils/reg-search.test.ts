import { describe, expect, it, vi, afterEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'

import searchAPIPlugin from '~/plugins/search-api'
// Mock the IsAuthorized function to return true
mockNuxtImport('IsAuthorized', () => {
  return vi.fn().mockReturnValue(true)
})

mockNuxtImport('useKeycloak', () => {
  return () => (
    {
      getToken: vi.fn().mockResolvedValue('123')
    }
  )
})

// Mock useConnectAccountStore for the legal-api plugin
mockNuxtImport('useConnectAccountStore', () => {
  return () => (
    {
      currentAccount: {
        id: 1
      }
    }
  )
})

// Add LaunchDarkly mock
const mockGetStoredFlag = vi.fn().mockReturnValue('A,BC,BEN,C,CBEN,CC,CCC,CP,CUL,FI,GP,LL,LLC,LP,PA,S,SP,ULC,XCP,XL,XP,XS')
mockNuxtImport('useConnectLaunchdarklyStore', () => {
  return () => (
    {
      getStoredFlag: mockGetStoredFlag
    }
  )
})

mockNuxtImport('useRuntimeConfig', () => {
  return () => (
    {
      public: {
        regSearchApiUrl: 'https://regSearchApiUrl.example.com',
        registriesSearchApiKey: 'registriesSearchApiKey.example',
        appName: 'TestApp'
      }
    }
  )
})

describe('searchAPIPlugin - regSearch', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should make a fetch request with the correct options', async () => {
    const _fetch = vi.fn().mockResolvedValue({ searchResults: { results: [] } })
    vi.stubGlobal('$fetch', _fetch)

    const mockNuxtApp: any = {
      provide: vi.fn()
    }

    // Register plugin
    searchAPIPlugin(mockNuxtApp)

    const regSearch = mockNuxtApp.provide.mock.calls[0][1].regSearch

    const queryStr = 'test'
    await regSearch(queryStr)

    await flushPromises()

    expect(_fetch).toHaveBeenCalledWith(
      'https://regSearchApiUrl.example.com/businesses/search/facets?' +
      'start=0&rows=20&categories=legalType:A,BC,BEN,C,CBEN,CC,CCC,CP,CUL,FI,GP,LL,LLC,LP,PA,S,SP,ULC,XCP,XL,XP,XS&query=value:test',
      {
        headers: {
          Authorization: 'Bearer 123',
          'x-apikey': 'registriesSearchApiKey.example',
          'Account-Id': 1,
          'App-Name': 'TestApp'
        }
      }
    )
  })
})
