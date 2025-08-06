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

mockNuxtImport('useRuntimeConfig', () => {
  return () => (
    {
      public: {
        namexApiGwUrl: 'https://namexApiUrl.example.com'
      }
    }
  )
})

describe('namexSearch', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should make a fetch request with the correct options', async () => {
    const _fetch = vi.fn().mockResolvedValue([])
    vi.stubGlobal('$fetch', _fetch)

    const queryStr = 'test'
    await namexSearch(queryStr)

    await flushPromises()

    expect(_fetch).toHaveBeenCalledWith(
      'https://namexApiUrl.example.com/requests/search',
      {
        headers: {
          Authorization: 'Bearer 123'
        },
        params: {
          query: queryStr,
          start: 0,
          rows: 20
        }
      }
    )
  })
})
