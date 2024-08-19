import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'

let mockAuthenticated = true
mockNuxtImport('useNuxtApp', () => {
  return () => (
    {
      $keycloak: {
        authenticated: mockAuthenticated,
        token: 'mock-token'
      }
    }
  )
})

mockNuxtImport('useRuntimeConfig', () => {
  return () => (
    {
      public: {
        authApiUrl: 'https://authApiUrl.example.com/'
      }
    }
  )
})

const mockWindowSize = vi.fn()
mockNuxtImport('useWindowSize', () => {
  return () => (
    {
      width: mockWindowSize
    }
  )
})

describe('useAffiliations', () => {
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
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
    vi.resetAllMocks()
    mockAuthenticated = true
  })

  it('should fetch and set affiliations correctly', async () => {
    const _fetch = vi.fn().mockResolvedValue({
      entities: [
        { identifier: '123' },
        { identifier: '456' },
        { identifier: '789' },
        { identifier: '321' }
      ]
    })
    vi.stubGlobal('$fetch', _fetch)

    // watch should trigger getAffiliatedEntities
    const { affiliations } = useAffiliations()

    // wait for getAffiliatedEntities to finish
    await flushPromises()

    expect(_fetch).toHaveBeenCalledOnce()
    // results mapped to business object
    expect(affiliations.results).toEqual([
      {
        businessIdentifier: '123',
        corpType: { code: undefined },
        adminFreeze: false,
        goodStanding: true
      },
      {
        businessIdentifier: '456',
        corpType: { code: undefined },
        adminFreeze: false,
        goodStanding: true
      },
      {
        businessIdentifier: '789',
        corpType: { code: undefined },
        adminFreeze: false,
        goodStanding: true
      },
      {
        businessIdentifier: '321',
        corpType: { code: undefined },
        adminFreeze: false,
        goodStanding: true
      }
    ])
    expect(affiliations.count).toEqual(4)
  })

  it('should handle an empty API response correctly', async () => {
    const _fetch = vi.fn().mockResolvedValue({ entities: [] })
    vi.stubGlobal('$fetch', _fetch)

    const { affiliations } = useAffiliations()

    await flushPromises()

    expect(_fetch).toHaveBeenCalledOnce()
    expect(affiliations.results).toEqual([])
    expect(affiliations.count).toEqual(0)
  })

  it('should not fetch affiliations if the user is not authenticated', async () => {
    mockAuthenticated = false

    const _fetch = vi.fn()
    vi.stubGlobal('$fetch', _fetch)

    useAffiliations()

    await flushPromises()

    expect(_fetch).not.toHaveBeenCalled()
  })

  it('should not fetch affiliations if currentAccount ID is missing', async () => {
    const _fetch = vi.fn()
    vi.stubGlobal('$fetch', _fetch)

    store.currentAccount.id = ''

    useAffiliations()

    await flushPromises()

    expect(_fetch).not.toHaveBeenCalled()
  })

  it.skip('should handle fetch errors', async () => { // TODO: implement after adding better error handling
    const _fetch = vi.fn().mockRejectedValue(new Error('API Error'))
    vi.stubGlobal('$fetch', _fetch)

    const { affiliations } = useAffiliations()

    await flushPromises()

    expect(_fetch).toHaveBeenCalledOnce()
    expect(affiliations.results).toEqual([]) // Should remain empty
    expect(affiliations.count).toEqual(0)
  })

  it('should reset affiliations correctly', async () => {
    const _fetch = vi.fn().mockResolvedValue({
      entities: [
        { identifier: '123' },
        { identifier: '456' },
        { identifier: '789' },
        { identifier: '321' }
      ]
    })
    vi.stubGlobal('$fetch', _fetch)

    const { affiliations, resetAffiliations } = useAffiliations()

    await flushPromises()

    expect(_fetch).toHaveBeenCalledOnce()

    expect(affiliations.results).toHaveLength(4)

    resetAffiliations()

    expect(affiliations.results).toEqual([])
    expect(affiliations.count).toEqual(0)
  })

  it('should call getAffiliatedEntities when currentAccount ID changes', async () => {
    const _fetch = vi.fn().mockResolvedValue({ entities: [] })
    vi.stubGlobal('$fetch', _fetch)

    useAffiliations()

    await flushPromises()
    expect(_fetch).toHaveBeenCalledOnce()

    // trigger the watcher by changing currentAccount.id
    store.currentAccount.id = '456'

    await flushPromises()

    expect(_fetch).toHaveBeenCalledTimes(2)
  })

  describe('affiliation columns', () => {
    it('should set default columns on large screens', async () => {
      const _fetch = vi.fn().mockResolvedValue({ entities: [] })
      vi.stubGlobal('$fetch', _fetch)
      mockWindowSize.mockReturnValue(1480)

      const { visibleColumns, optionalColumns, selectedColumns } = useAffiliations()

      await new Promise<void>((resolve) => { // required to wait for watcher to run
        setTimeout(() => {
          expect(visibleColumns.value).toEqual([
            { key: 'legalName', label: 'Name' },
            { key: 'identifier', label: 'Number' },
            { key: 'legalType', label: 'Type' },
            { key: 'state', label: 'Status' },
            { key: 'actions', label: 'Actions' }
          ])
          expect(selectedColumns.value).toEqual(optionalColumns)
          resolve()
        }, 1000)
      })
    })

    it('should set default columns on medium screens', async () => {
      const _fetch = vi.fn().mockResolvedValue({ entities: [] })
      vi.stubGlobal('$fetch', _fetch)
      mockWindowSize.mockReturnValue(1000)

      const { visibleColumns, optionalColumns, selectedColumns } = useAffiliations()

      await new Promise<void>((resolve) => { // required to wait for watcher to run
        setTimeout(() => {
          expect(visibleColumns.value).toEqual([
            { key: 'legalName', label: 'Name' },
            { key: 'identifier', label: 'Number' },
            { key: 'actions', label: 'Actions' }
          ])
          expect(selectedColumns.value).toEqual([optionalColumns[0]])
          resolve()
        }, 1000)
      })
    })

    it('should set default columns on small screens', async () => {
      const _fetch = vi.fn().mockResolvedValue({ entities: [] })
      vi.stubGlobal('$fetch', _fetch)
      mockWindowSize.mockReturnValue(600)

      const { visibleColumns, selectedColumns } = useAffiliations()

      await new Promise<void>((resolve) => { // required to wait for watcher to run
        setTimeout(() => {
          expect(visibleColumns.value).toEqual([
            { key: 'legalName', label: 'Name' },
            { key: 'actions', label: 'Actions' }
          ])
          expect(selectedColumns.value).toEqual([])
          resolve()
        }, 1000)
      })
    })

    describe('setColumns', () => {
      it('should set all columns when all optional columns are selected', () => {
        const { visibleColumns, optionalColumns, setColumns } = useAffiliations()

        setColumns()

        expect(visibleColumns.value).toEqual([
          { key: 'legalName', label: 'Name' },
          ...optionalColumns,
          { key: 'actions', label: 'Actions' }
        ])
      })

      it('should set only name and actions columns when no optional columns are selected', () => {
        const { visibleColumns, selectedColumns, setColumns } = useAffiliations()

        selectedColumns.value = []

        setColumns()

        expect(visibleColumns.value).toEqual([
          { key: 'legalName', label: 'Name' },
          { key: 'actions', label: 'Actions' }
        ])
      })

      it('should set only selected optional columns', () => {
        const { visibleColumns, optionalColumns, selectedColumns, setColumns } = useAffiliations()

        selectedColumns.value = [optionalColumns[0]!, optionalColumns[2]!] // Select first and last optional column

        setColumns()

        expect(visibleColumns.value).toEqual([
          { key: 'legalName', label: 'Name' },
          optionalColumns[0], // identifier
          optionalColumns[2], // state
          { key: 'actions', label: 'Actions' }
        ])
      })
    })
  })
})
