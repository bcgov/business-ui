import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
// import { flushPromises } from '@vue/test-utils'

mockNuxtImport('useRuntimeConfig', () => {
  return () => (
    {
      public: {
        regSearchApiUrl: 'https://regSearchApiUrl.example.com/',
        xApiKey: 'x-api-key-mock'
      }
    }
  )
})

mockNuxtImport('useKeycloak', () => {
  return () => (
    {
      getToken: vi.fn().mockResolvedValue('mock-token')
    }
  )
})

const onSelectMock = vi.fn()

describe('useComboBox', () => {
  let store: any
  let inputRef: any
  let resultListItems: any

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useConnectAccountStore()

    store.currentAccount = {
      id: '123',
      accountType: 'basic',
      accountStatus: '',
      label: 'some label',
      type: '',
      urlpath: '',
      urlorigin: ''
    }

    inputRef = ref(null)
    resultListItems = ref(null)
    onSelectMock.mockClear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
    vi.resetAllMocks()
    vi.restoreAllMocks()
  })

  it('fetches results and sets values', async () => {
    const _fetch = vi.fn().mockResolvedValue({
      searchResults: {
        results: [
          { name: 'Item 1', identifier: '1' },
          { name: 'Item 2', identifier: '2' }
        ]
      }
    })
    vi.stubGlobal('$fetch', _fetch)
    const { query, results, statusText, loading, getResults } = useComboBox(inputRef, resultListItems, onSelectMock)

    query.value = 'Item'
    getResults()

    expect(loading.value).toEqual(true)
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(_fetch).toHaveBeenCalledOnce()
        expect(results.value).toEqual([
          { name: 'Item 1', identifier: '1' },
          { name: 'Item 2', identifier: '2' }
        ])
        expect(statusText.value).toEqual('2 results')
        expect(loading.value).toEqual(false)

        resolve() // resolve after assertion
      }, 1000) // wait for debounce to complete
    })
  })

  it('sets results to an empty array and updates status text when no results are found', async () => {
    const _fetch = vi.fn().mockResolvedValue({
      searchResults: {
        results: []
      }
    })
    vi.stubGlobal('$fetch', _fetch)
    const { query, results, getResults, statusText } = useComboBox(inputRef, resultListItems, onSelectMock)

    query.value = 'Nonexistent Item'
    getResults()

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(_fetch).toHaveBeenCalledOnce()
        expect(results.value).toEqual([])
        expect(statusText.value).toBe('0 results')
        resolve()
      }, 1000)
    })
  })

  it('handles errors during fetch and sets error flag and status text', async () => {
    const _fetch = vi.fn().mockRejectedValue(new Error('Fetch failed'))
    vi.stubGlobal('$fetch', _fetch)
    const { query, results, getResults, error, statusText } = useComboBox(inputRef, resultListItems, onSelectMock)

    query.value = 'Item'
    getResults()

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(_fetch).toHaveBeenCalledOnce()
        expect(results.value).toEqual([])
        expect(error.value).toBe(true)
        expect(statusText.value).toBe('Error retrieving search results')
        resolve()
      }, 1000)
    })
  })

  it('debounces fetch requests', async () => {
    const _fetch = vi.fn().mockResolvedValue({
      searchResults: {
        results: [{ name: 'Item 1', identifier: '1' }]
      }
    })
    vi.stubGlobal('$fetch', _fetch)
    const { query, getResults } = useComboBox(inputRef, resultListItems, onSelectMock)

    query.value = 'I'
    getResults()

    query.value = 'It'
    getResults()

    query.value = 'Ite'
    getResults()

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(_fetch).toHaveBeenCalledOnce() // Should only call fetch once
        resolve()
      }, 1000)
    })
  })

  it('calls onSelect with the correct item when an item is selected', async () => {
    const _fetch = vi.fn().mockResolvedValue({
      searchResults: {
        results: [{ name: 'Item 1', identifier: '1' }]
      }
    })
    vi.stubGlobal('$fetch', _fetch)
    const { query, results, getResults, emitSearchResult } = useComboBox(inputRef, resultListItems, onSelectMock)

    query.value = 'Item'
    getResults()

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        // @ts-expect-error
        emitSearchResult(results.value[0])
        expect(onSelectMock).toHaveBeenCalledWith({ name: 'Item 1', identifier: '1' })
        resolve()
      }, 1000)
    })
  })

  it('emitSearchResult updates query, resets dropdown, focuses input, and calls onSelect', () => {
    const { query, emitSearchResult, showDropdown } = useComboBox(inputRef, resultListItems, onSelectMock)

    const result = { name: 'Selected Item', identifier: '1' }

    // @ts-expect-error
    emitSearchResult(result)

    expect(query.value).toBe('Selected Item')
    expect(showDropdown.value).toBe(false)
    expect(onSelectMock).toHaveBeenCalledWith(result)
  })
})
