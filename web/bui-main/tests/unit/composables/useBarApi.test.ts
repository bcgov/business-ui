import { describe, expect, it, afterEach, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { useBarApi } from '~/composables/useBarApi'
import { mockedKeycloak } from '~/tests/mocks/mockedKeycloak'
import { mockNewAccount } from '~/tests/mocks/mockedData'

mockNuxtImport('useRuntimeConfig', () => {
  return () => (
    {
      public: {
        barApiUrl: 'https://business-ar-api.app/v1'
      }
    }
  )
})

describe('useBarApi', () => {
  let accountStore: any

  beforeEach(() => {
    setActivePinia(createPinia())
    accountStore = useAccountStore()
    accountStore.currentAccount = mockNewAccount
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('calls fetch with default values', async () => {
    const _fetch = vi.fn()
    vi.stubGlobal('$fetch', _fetch)

    const endpoint = '/someurl'
    await useBarApi(endpoint)

    expect(useBarApi).toBeTruthy()
    expect(_fetch).toBeCalledTimes(1)
    expect(_fetch).toBeCalledWith(
      'https://business-ar-api.app/v1/someurl',
      expect.objectContaining({
        onRequest: expect.any(Function),
        onResponseError: expect.any(Function)
      })
    )

    const fetchCall = _fetch.mock.calls[0]
    const fetchOptions = fetchCall[1]

    const options = { headers: {} }
    fetchOptions.onRequest({ options })

    expect(options.headers).not.toHaveProperty('Authorization')
    expect(options.headers).not.toHaveProperty('Account-Id')
  })

  it('sets Authorization header with token credentials', async () => {
    const _fetch = vi.fn()
    vi.stubGlobal('$fetch', _fetch)

    const endpoint = '/someurl'
    await useBarApi(endpoint, {}, 'token')

    const fetchCall = _fetch.mock.calls[0]
    const fetchOptions = fetchCall[1]

    const options = { headers: {} }
    fetchOptions.onRequest({ options })

    expect(options.headers).toHaveProperty('Authorization', `Bearer ${mockedKeycloak.token}`)
  })

  it('sets Account-Id header with account credentials', async () => {
    const _fetch = vi.fn()
    vi.stubGlobal('$fetch', _fetch)

    const endpoint = '/someurl'
    await useBarApi(endpoint, {}, 'account')

    const fetchCall = _fetch.mock.calls[0]
    const fetchOptions = fetchCall[1]

    const options = { headers: {} }
    fetchOptions.onRequest({ options })

    expect(options.headers).toHaveProperty('Account-Id', mockNewAccount.id.toString())
  })

  it('sets both headers with all credentials', async () => {
    const _fetch = vi.fn()
    vi.stubGlobal('$fetch', _fetch)

    const endpoint = '/someurl'
    await useBarApi(endpoint, {}, 'all')

    const fetchCall = _fetch.mock.calls[0]
    const fetchOptions = fetchCall[1]

    const options = { headers: {} }
    fetchOptions.onRequest({ options })

    expect(options.headers).toHaveProperty('Authorization', `Bearer ${mockedKeycloak.token}`)
    expect(options.headers).toHaveProperty('Account-Id', mockNewAccount.id.toString())
  })

  it('logs error on response error', async () => {
    const _fetch = vi.fn()
    vi.stubGlobal('$fetch', _fetch)

    const endpoint = '/someurl'
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await useBarApi(endpoint)

    const fetchCall = _fetch.mock.calls[0]
    const fetchOptions = fetchCall[1]

    const errorResponse = { status: 500 }
    fetchOptions.onResponseError({ response: errorResponse })

    // 500 error returns generic error message
    expect(consoleErrorSpy).toBeCalledWith('Internal Server Error, please try again later or contact us for assistance.')
  })

  it('can add other options', async () => {
    const _fetch = vi.fn()
    vi.stubGlobal('$fetch', _fetch)

    const endpoint = '/someurl'

    await useBarApi(
      endpoint,
      {
        method: 'POST',
        body: {
          data: 'Test'
        }
      }
    )

    expect(_fetch).toBeCalledTimes(1)
    expect(_fetch).toBeCalledWith(
      'https://business-ar-api.app/v1/someurl',
      expect.objectContaining({
        method: 'POST',
        body: {
          data: 'Test'
        },
        onRequest: expect.any(Function),
        onResponseError: expect.any(Function)
      })
    )
  })
})
