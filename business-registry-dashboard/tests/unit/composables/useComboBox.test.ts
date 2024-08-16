import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { enI18n } from '~~/tests/mocks/i18n'

const onSelectMock = vi.fn()
const TestComponent = defineComponent({
  props: {
    searchFn: {
      type: Function as unknown as () => (query: string) => Promise<any[]>,
      required: true
    },
    idAttr: {
      type: String,
      default: 'identifier'
    },
    valueAttr: {
      type: String,
      default: 'name'
    }
  },
  setup (props) {
    const inputRef = ref(null)
    const resultListItems = ref(null)

    const comboBox = useComboBox(inputRef, resultListItems, props.searchFn, onSelectMock, props.valueAttr)

    return {
      ...comboBox,
      inputRef,
      resultListItems
    }
  },
  template: '<div/>'
})

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

describe('useComboBox', () => {
  let store: any

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

    onSelectMock.mockClear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
    vi.resetAllMocks()
    vi.restoreAllMocks()
  })

  it('fetches results and sets values', async () => {
    const mockSearchFn = (): Promise<any[]> => {
      return Promise.resolve([
        { identifier: '1', name: 'Item 1' },
        { identifier: '2', name: 'Item 2' }
      ])
    }

    const wrapper = await mountSuspended(TestComponent, {
      props: {
        searchFn: mockSearchFn
      },
      global: {
        plugins: [enI18n]
      }
    })

    const { query, results, statusText, loading, getResults } = wrapper.setupState

    query.value = 'Item'
    getResults()

    expect(loading.value).toEqual(true)
    await new Promise<void>((resolve) => {
      setTimeout(() => {
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
    const mockSearchFn = (): Promise<any[]> => {
      return Promise.resolve([])
    }

    const wrapper = await mountSuspended(TestComponent, {
      props: {
        searchFn: mockSearchFn
      },
      global: {
        plugins: [enI18n]
      }
    })

    const { query, results, statusText, getResults } = wrapper.setupState

    query.value = 'Nonexistent Item'
    getResults()

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(results.value).toEqual([])
        expect(statusText.value).toBe('0 results')
        resolve()
      }, 1000)
    })
  })

  it('handles errors during fetch and sets error flag and status text', async () => {
    const mockSearchFn = (): Promise<any[]> => {
      return Promise.reject(new Error('Fetch failed'))
    }

    const wrapper = await mountSuspended(TestComponent, {
      props: {
        searchFn: mockSearchFn
      },
      global: {
        plugins: [enI18n]
      }
    })

    const { query, results, statusText, getResults, error } = wrapper.setupState

    query.value = 'Item'
    getResults()

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(results.value).toEqual([])
        expect(error.value).toBe(true)
        expect(statusText.value).toBe('Error retrieving search results, please try again later.')
        resolve()
      }, 1000)
    })
  })

  it('debounces fetch requests', async () => {
    const mockSearchFn = vi.fn().mockResolvedValue([
      { identifier: '1', name: 'Item 1' },
      { identifier: '2', name: 'Item 2' }
    ])

    const wrapper = await mountSuspended(TestComponent, {
      props: {
        searchFn: mockSearchFn
      },
      global: {
        plugins: [enI18n]
      }
    })

    const { query, getResults } = wrapper.setupState

    query.value = 'I'
    getResults()

    query.value = 'It'
    getResults()

    query.value = 'Ite'
    getResults()

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(mockSearchFn).toHaveBeenCalledOnce() // Should only call fetch once
        resolve()
      }, 1000)
    })
  })

  it('calls onSelect with the correct item when an item is selected', async () => {
    const mockSearchFn = (): Promise<any[]> => {
      return Promise.resolve([
        { identifier: '1', name: 'Item 1' },
        { identifier: '2', name: 'Item 2' }
      ])
    }

    const wrapper = await mountSuspended(TestComponent, {
      props: {
        searchFn: mockSearchFn
      },
      global: {
        plugins: [enI18n]
      }
    })

    const { query, results, getResults, emitSearchResult } = wrapper.setupState

    query.value = 'Item'
    getResults()

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        emitSearchResult(results.value[0])
        expect(onSelectMock).toHaveBeenCalledWith({ name: 'Item 1', identifier: '1' })
        resolve()
      }, 1000)
    })
  })

  it('emitSearchResult updates query, resets dropdown and calls onSelect', async () => {
    const mockSearchFn = (): Promise<any[]> => {
      return Promise.resolve([
        { identifier: '1', name: 'Item 1' },
        { identifier: '2', name: 'Item 2' }
      ])
    }

    const wrapper = await mountSuspended(TestComponent, {
      props: {
        searchFn: mockSearchFn
      },
      global: {
        plugins: [enI18n]
      }
    })

    const { query, emitSearchResult, showDropdown } = wrapper.setupState

    const result = { name: 'Selected Item', identifier: '1' }

    emitSearchResult(result)

    expect(query.value).toBe('Selected Item')
    expect(showDropdown.value).toBe(false)
    expect(onSelectMock).toHaveBeenCalledWith(result)
  })

  it('does not search on empty query', async () => {
    const mockSearchFn = vi.fn().mockResolvedValue([
      { identifier: '1', name: 'Item 1' },
      { identifier: '2', name: 'Item 2' }
    ])

    const wrapper = await mountSuspended(TestComponent, {
      props: {
        searchFn: mockSearchFn
      },
      global: {
        plugins: [enI18n]
      }
    })

    const { query, results, getResults } = wrapper.setupState

    query.value = '' // Simulate empty query
    getResults()

    expect(results.value).toEqual([]) // Ensure results are reset
    expect(mockSearchFn).not.toHaveBeenCalled() // Ensure search function is not called
  })

  // TODO: test keyboard events
})
