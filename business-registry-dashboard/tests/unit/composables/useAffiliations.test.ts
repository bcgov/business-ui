import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { mockAffiliationResponse } from '~~/tests/mocks/mockedData'

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

mockNuxtImport('useI18n', () => {
  return () => (
    {
      t: (key: string) => key,
      locale: {
        value: 'en-CA'
      }
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
            { key: 'identifier', label: 'labels.number' },
            { key: 'legalType', label: 'labels.type' },
            { key: 'state', label: 'labels.status' },
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
            { key: 'identifier', label: 'labels.number' },
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

  describe('affiliation filtering', () => {
    describe('filter by name', () => {
      it('should filter a name request object', async () => {
        const _fetch = vi.fn().mockResolvedValue(mockAffiliationResponse)
        vi.stubGlobal('$fetch', _fetch)

        const { affiliations, filteredResults } = useAffiliations()
        await flushPromises()

        affiliations.filters.businessName = 'SOME TEST NAME 321'

        expect(filteredResults.value).toHaveLength(1)
        expect(filteredResults.value[0]?.nameRequest?.names?.some(item => item.name === 'SOME TEST NAME 321')).toEqual(true)
      })

      it('should filter a business object', async () => {
        const _fetch = vi.fn().mockResolvedValue(mockAffiliationResponse)
        vi.stubGlobal('$fetch', _fetch)

        const { affiliations, filteredResults } = useAffiliations()
        await flushPromises()

        affiliations.filters.businessName = '0871505 B.C. LTD.'

        expect(filteredResults.value).toHaveLength(1)
        expect(filteredResults.value).toEqual([
          {
            businessIdentifier: 'BC0871505',
            name: '0871505 B.C. LTD.',
            corpType: { code: 'BEN' },
            corpSubType: { code: 'BEN' },
            adminFreeze: false,
            goodStanding: true,
            status: 'ACTIVE'
          }
        ])
      })
    })

    describe('filter by number', () => {
      it('should filter a name request object', async () => {
        const _fetch = vi.fn().mockResolvedValue(mockAffiliationResponse)
        vi.stubGlobal('$fetch', _fetch)

        const { affiliations, filteredResults } = useAffiliations()
        await flushPromises()

        affiliations.filters.businessNumber = 'NR 3819593'

        expect(filteredResults.value).toHaveLength(1)
        expect(filteredResults.value[0]?.nameRequest?.names?.some(item => item.name === 'SOME TEST NAME 321')).toEqual(true)
      })

      it('should filter a business object', async () => {
        const _fetch = vi.fn().mockResolvedValue(mockAffiliationResponse)
        vi.stubGlobal('$fetch', _fetch)

        const { affiliations, filteredResults } = useAffiliations()
        await flushPromises()

        affiliations.filters.businessNumber = 'BC0871227'

        expect(filteredResults.value).toHaveLength(1)
        expect(filteredResults.value).toEqual([
          {
            businessIdentifier: 'BC0871227',
            name: 'SEVERIN LIMITED COMPANY CORP.',
            corpType: { code: 'BC' },
            corpSubType: { code: 'BC' },
            adminFreeze: false,
            goodStanding: true,
            status: 'HISTORICAL'
          }
        ])
      })
    })

    describe('filter by type', () => {
      it('should filter an Amalgamation Application', async () => {
        const _fetch = vi.fn().mockResolvedValue(mockAffiliationResponse)
        vi.stubGlobal('$fetch', _fetch)

        const { affiliations, filteredResults } = useAffiliations()
        await flushPromises()

        affiliations.filters.type = 'Amalgamation Application'

        expect(filteredResults.value).toHaveLength(1)
        expect(filteredResults.value.every(item => affiliationType(item) === 'Amalgamation Application')).toEqual(true)
      })

      it('should filter a BC Limited Company', async () => {
        const _fetch = vi.fn().mockResolvedValue(mockAffiliationResponse)
        vi.stubGlobal('$fetch', _fetch)

        const { affiliations, filteredResults } = useAffiliations()
        await flushPromises()

        affiliations.filters.type = 'BC Limited Company'

        expect(filteredResults.value).toHaveLength(3)
        expect(filteredResults.value.every(item => affiliationType(item) === 'BC Limited Company')).toEqual(true)
      })
    })

    describe('filter by status', () => {
      it('should filter by draft', async () => {
        const _fetch = vi.fn().mockResolvedValue(mockAffiliationResponse)
        vi.stubGlobal('$fetch', _fetch)

        const { affiliations, filteredResults } = useAffiliations()
        await flushPromises()

        affiliations.filters.status = 'Draft'

        expect(filteredResults.value).toHaveLength(2)
        expect(filteredResults.value.every(item => affiliationStatus(item) === 'Draft')).toEqual(true)
      })

      it('should filter by historical', async () => {
        const _fetch = vi.fn().mockResolvedValue(mockAffiliationResponse)
        vi.stubGlobal('$fetch', _fetch)

        const { affiliations, filteredResults } = useAffiliations()
        await flushPromises()

        affiliations.filters.status = 'Historical'

        expect(filteredResults.value).toHaveLength(2)
        expect(filteredResults.value.every(item => affiliationStatus(item) === 'Historical')).toEqual(true)
      })
    })

    describe('statusOptions', () => {
      it('should be created based off the results objects', async () => {
        const _fetch = vi.fn().mockResolvedValue(mockAffiliationResponse)
        vi.stubGlobal('$fetch', _fetch)

        const { statusOptions } = useAffiliations()
        await flushPromises()

        expect(statusOptions.value).toEqual(['Draft', 'Historical', 'Active'])
      })
    })

    describe('typeOptions', () => {
      it('should be created based off the results objects', async () => {
        const _fetch = vi.fn().mockResolvedValue(mockAffiliationResponse)
        vi.stubGlobal('$fetch', _fetch)

        const { typeOptions } = useAffiliations()
        await flushPromises()

        expect(typeOptions.value).toEqual([
          'Amalgamation Application',
          'BC Limited Company',
          'BC Benefit Company',
          'Registration'
        ])
      })
    })

    describe('hasFilters', () => {
      it('should be false by default', async () => {
        const _fetch = vi.fn().mockResolvedValue(mockAffiliationResponse)
        vi.stubGlobal('$fetch', _fetch)

        const { hasFilters } = useAffiliations()
        await flushPromises()

        expect(hasFilters.value).toEqual(false)
      })

      it('should be true with a name filter active', async () => {
        const _fetch = vi.fn().mockResolvedValue(mockAffiliationResponse)
        vi.stubGlobal('$fetch', _fetch)

        const { hasFilters, affiliations } = useAffiliations()
        await flushPromises()

        expect(hasFilters.value).toEqual(false)

        affiliations.filters.businessName = 'test'

        expect(hasFilters.value).toEqual(true)
      })

      it('should be true with a number filter active', async () => {
        const _fetch = vi.fn().mockResolvedValue(mockAffiliationResponse)
        vi.stubGlobal('$fetch', _fetch)

        const { hasFilters, affiliations } = useAffiliations()
        await flushPromises()

        expect(hasFilters.value).toEqual(false)

        affiliations.filters.businessNumber = 'test'

        expect(hasFilters.value).toEqual(true)
      })

      it('should be true with a type filter active', async () => {
        const _fetch = vi.fn().mockResolvedValue(mockAffiliationResponse)
        vi.stubGlobal('$fetch', _fetch)

        const { hasFilters, affiliations } = useAffiliations()
        await flushPromises()

        expect(hasFilters.value).toEqual(false)

        affiliations.filters.type = 'test'

        expect(hasFilters.value).toEqual(true)
      })

      it('should be true with a status filter active', async () => {
        const _fetch = vi.fn().mockResolvedValue(mockAffiliationResponse)
        vi.stubGlobal('$fetch', _fetch)

        const { hasFilters, affiliations } = useAffiliations()
        await flushPromises()

        expect(hasFilters.value).toEqual(false)

        affiliations.filters.status = 'test'

        expect(hasFilters.value).toEqual(true)
      })
    })

    describe('resetFilters', () => {
      it('should reset all filters', async () => {
        const _fetch = vi.fn().mockResolvedValue(mockAffiliationResponse)
        vi.stubGlobal('$fetch', _fetch)

        const { hasFilters, affiliations, resetFilters } = useAffiliations()
        await flushPromises()

        expect(hasFilters.value).toEqual(false)

        affiliations.filters.businessName = 'test'
        affiliations.filters.businessNumber = 'test'
        affiliations.filters.type = 'test'
        affiliations.filters.status = 'test'

        expect(hasFilters.value).toEqual(true)

        resetFilters()

        expect(hasFilters.value).toEqual(false)
      })
    })
  })
})
