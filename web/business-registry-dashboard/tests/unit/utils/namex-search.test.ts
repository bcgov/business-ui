import { describe, expect, it, vi, afterEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'

// Import namex-search-api plugin
import namexSearchAPIPlugin from '~/plugins/search-api'

// Mocks for keycloak and runtime config
mockNuxtImport('useKeycloak', () => {
  return () => ({
    getToken: vi.fn().mockResolvedValue('123')
  })
})

// Mock for `useRuntimeConfig`
mockNuxtImport('useRuntimeConfig', () => {
  return () => ({
    public: {
      namexApiGwUrl: 'https://namexApiUrl.example.com',
      appName: 'TestApp',
      namexApiKey: 'ABC123'
    }
  })
})

// Mock for accessing account store
mockNuxtImport('useConnectAccountStore', () => {
  return () => ({
    currentAccount: { id: '456' }
  })
})

describe('namexSearchAPIPlugin - namexSearch', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should make a fetch request with the correct options', async () => {
    const mockFetch = vi.fn().mockResolvedValue([])
    vi.stubGlobal('$fetch', mockFetch)

    // Prepare a fake Nuxt app context
    const mockNuxtApp: any = {
      provide: vi.fn()
    }

    // Register the plugin
    namexSearchAPIPlugin(mockNuxtApp)

    // Extract the plugin function
    const namexSearch = mockNuxtApp.provide.mock.calls[0][1].namexSearch

    const queryStr = 'test'
    await namexSearch(queryStr)

    await flushPromises()

    expect(mockFetch).toHaveBeenCalledWith(
      'https://namexApiUrl.example.com/requests/search',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer 123',
          'App-Name': 'TestApp',
          'Account-Id': '456',
          'X-Apikey': 'ABC123'
        }),
        params: {
          query: queryStr,
          start: 0,
          rows: 20
        }
      })
    )
  })
})
