import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { mockAffiliationResponse } from '~~/tests/mocks/mockedData'

let mockAuthenticated = true
const mockAuthApi = vi.fn()
mockNuxtImport('useNuxtApp', () => {
  return () => (
    {
      $keycloak: {
        authenticated: mockAuthenticated,
        token: 'mock-token'
      },
      $authApi: mockAuthApi,
      $legalApi: vi.fn()
    }
  )
})

mockNuxtImport('useToast', () => {
  return () => (
    {
      add: vi.fn()
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

const mockEntities = {
  entities: [
    { identifier: '123' },
    { identifier: '456' },
    { identifier: '789' },
    { identifier: '321' }
  ]
}

describe('useAffiliationsStore', () => {
  let store: any

  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
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

  describe('loadAffiliations', () => {
    it('should fetch and set affiliations correctly', async () => {
      mockAuthApi.mockResolvedValue(mockEntities)

      const affStore = useAffiliationsStore()

      await affStore.loadAffiliations()

      // wait for getAffiliatedEntities to finish
      await flushPromises()

      expect(mockAuthApi).toHaveBeenCalledOnce()
      // results mapped to business object
      expect(affStore.affiliations.results).toEqual([
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
      expect(affStore.affiliations.count).toEqual(4)
    })

    it('should handle an empty API response correctly', async () => {
      mockAuthApi.mockResolvedValue({ entities: [] })
      const affStore = useAffiliationsStore()

      await affStore.loadAffiliations()

      await flushPromises()

      expect(mockAuthApi).toHaveBeenCalledOnce()
      expect(affStore.affiliations.results).toEqual([])
      expect(affStore.affiliations.count).toEqual(0)
    })

    it('should not fetch affiliations if the user is not authenticated', async () => {
      mockAuthApi.mockResolvedValue({ entities: [] })
      mockAuthenticated = false

      const affStore = useAffiliationsStore()

      await affStore.loadAffiliations()

      await flushPromises()

      expect(mockAuthApi).not.toHaveBeenCalled()
    })

    it('should not fetch affiliations if currentAccount ID is missing', async () => {
      mockAuthApi.mockResolvedValue({ entities: [] })
      store.currentAccount.id = ''

      const affStore = useAffiliationsStore()

      await affStore.loadAffiliations()

      await flushPromises()

      expect(mockAuthApi).not.toHaveBeenCalled()
    })

    it.skip('should handle fetch errors', async () => { // TODO: implement after adding better error handling
      const _fetch = vi.fn().mockRejectedValue(new Error('API Error'))
      vi.stubGlobal('$fetch', _fetch)

      const affStore = useAffiliationsStore()

      await affStore.loadAffiliations()

      await flushPromises()

      expect(_fetch).toHaveBeenCalledOnce()
      expect(affStore.affiliations.results).toEqual([]) // Should remain empty
      expect(affStore.affiliations.count).toEqual(0)
    })

    it.skip('should reset affiliations', async () => { // TODO: figure out why spy isnt being called
      mockAuthApi.mockResolvedValue({ entities: [] })

      const affStore = useAffiliationsStore()

      const resetAffiliationsSpy = vi.spyOn(affStore, 'resetAffiliations')

      await affStore.loadAffiliations()

      expect(resetAffiliationsSpy).toHaveBeenCalledTimes(1)
    })

    it('should set loading to true initially and false after API call', async () => {
      mockAuthApi.mockResolvedValue({ entities: [] })

      const affStore = useAffiliationsStore()

      const loadingSpy = vi.spyOn(affStore.affiliations, 'loading', 'set')
      await affStore.loadAffiliations()

      expect(loadingSpy).toHaveBeenCalledWith(true)
      expect(loadingSpy).toHaveBeenCalledWith(false)
    })
  })

  // it.only('should call test2', () => {
  //   const testStore = useTestStore()
  //   const test2Spy = vi.spyOn(testStore, 'test2')
  //   testStore.test1()
  //   expect(test2Spy).toHaveBeenCalledOnce()
  // })

  it('resetAffiliations should reset affiliations correctly', async () => {
    mockAuthApi.mockResolvedValue(mockEntities)

    const affStore = useAffiliationsStore()

    await affStore.loadAffiliations()

    await flushPromises()

    expect(mockAuthApi).toHaveBeenCalledOnce()

    expect(affStore.affiliations.results).toHaveLength(4)
    expect(affStore.affiliations.count).toEqual(4)

    affStore.resetAffiliations()

    expect(affStore.affiliations.results).toEqual([])
    expect(affStore.affiliations.count).toEqual(0)
  })

  it('should call loadAffiliations when currentAccount ID changes', async () => {
    mockAuthApi.mockResolvedValue(mockEntities)

    const affStore = useAffiliationsStore()

    await affStore.loadAffiliations()

    await flushPromises()
    expect(mockAuthApi).toHaveBeenCalledOnce()

    // trigger the watcher by changing currentAccount.id
    store.currentAccount.id = '456'

    await flushPromises()

    expect(mockAuthApi).toHaveBeenCalledTimes(2)
  })

  describe('affiliation columns', () => {
    it('should set default columns on large screens', async () => {
      mockWindowSize.mockReturnValue(1480)

      const affStore = useAffiliationsStore()

      await new Promise<void>((resolve) => { // required to wait for watcher to run
        setTimeout(() => {
          expect(affStore.visibleColumns).toEqual([
            { key: 'legalName', label: 'Name' },
            { key: 'identifier', label: 'labels.number' },
            { key: 'legalType', label: 'labels.type' },
            { key: 'state', label: 'labels.status' },
            { key: 'actions', label: 'Actions' }
          ])
          expect(affStore.selectedColumns).toEqual(affStore.optionalColumns)
          resolve()
        }, 1000)
      })
    })

    it('should set default columns on medium screens', async () => {
      mockWindowSize.mockReturnValue(1000)

      const affStore = useAffiliationsStore()

      await new Promise<void>((resolve) => { // required to wait for watcher to run
        setTimeout(() => {
          expect(affStore.visibleColumns).toEqual([
            { key: 'legalName', label: 'Name' },
            { key: 'identifier', label: 'labels.number' },
            { key: 'actions', label: 'Actions' }
          ])
          expect(affStore.selectedColumns).toEqual([affStore.optionalColumns[0]])
          resolve()
        }, 1000)
      })
    })

    it('should set default columns on small screens', async () => {
      mockWindowSize.mockReturnValue(600)

      const affStore = useAffiliationsStore()

      await new Promise<void>((resolve) => { // required to wait for watcher to run
        setTimeout(() => {
          expect(affStore.visibleColumns).toEqual([
            { key: 'legalName', label: 'Name' },
            { key: 'actions', label: 'Actions' }
          ])
          expect(affStore.selectedColumns).toEqual([])
          resolve()
        }, 1000)
      })
    })

    describe('setColumns', () => {
      it('should set all columns when all optional columns are selected', () => {
        const affStore = useAffiliationsStore()

        affStore.setColumns()

        expect(affStore.visibleColumns).toEqual([
          { key: 'legalName', label: 'Name' },
          ...affStore.optionalColumns,
          { key: 'actions', label: 'Actions' }
        ])
      })

      it('should set only name and actions columns when no optional columns are selected', () => {
        const affStore = useAffiliationsStore()

        affStore.selectedColumns = []

        affStore.setColumns()

        expect(affStore.visibleColumns).toEqual([
          { key: 'legalName', label: 'Name' },
          { key: 'actions', label: 'Actions' }
        ])
      })

      it('should set only selected optional columns', () => {
        const affStore = useAffiliationsStore()

        affStore.selectedColumns = [affStore.optionalColumns[0]!, affStore.optionalColumns[2]!] // Select first and last optional column

        affStore.setColumns()

        expect(affStore.visibleColumns).toEqual([
          { key: 'legalName', label: 'Name' },
          affStore.optionalColumns[0], // identifier
          affStore.optionalColumns[2], // state
          { key: 'actions', label: 'Actions' }
        ])
      })
    })
  })

  describe('affiliation filtering', () => {
    describe('filter by name', () => {
      it('should filter a name request object', async () => {
        mockAuthApi.mockResolvedValue(mockAffiliationResponse)

        const affStore = useAffiliationsStore()
        await affStore.loadAffiliations()

        await flushPromises()

        affStore.affiliations.filters.businessName = 'SOME TEST NAME 321'

        expect(affStore.filteredResults).toHaveLength(1)
        expect(affStore.filteredResults[0]?.nameRequest?.names?.some(item => item.name === 'SOME TEST NAME 321')).toEqual(true)
      })

      it('should filter a business object', async () => {
        mockAuthApi.mockResolvedValue(mockAffiliationResponse)

        const affStore = useAffiliationsStore()
        await affStore.loadAffiliations()

        await flushPromises()

        affStore.affiliations.filters.businessName = '0871505 B.C. LTD.'

        expect(affStore.filteredResults).toHaveLength(1)
        expect(affStore.filteredResults).toEqual([
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
        mockAuthApi.mockResolvedValue(mockAffiliationResponse)

        const affStore = useAffiliationsStore()
        await affStore.loadAffiliations()

        await flushPromises()

        affStore.affiliations.filters.businessNumber = 'NR 3819593'

        expect(affStore.filteredResults).toHaveLength(1)
        expect(affStore.filteredResults[0]?.nameRequest?.names?.some(item => item.name === 'SOME TEST NAME 321')).toEqual(true)
      })

      it('should filter a business object', async () => {
        mockAuthApi.mockResolvedValue(mockAffiliationResponse)

        const affStore = useAffiliationsStore()
        await affStore.loadAffiliations()

        await flushPromises()

        affStore.affiliations.filters.businessNumber = 'BC0871227'

        expect(affStore.filteredResults).toHaveLength(1)
        expect(affStore.filteredResults).toEqual([
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
        mockAuthApi.mockResolvedValue(mockAffiliationResponse)

        const affStore = useAffiliationsStore()
        await affStore.loadAffiliations()

        await flushPromises()

        affStore.affiliations.filters.type = 'Amalgamation Application'

        expect(affStore.filteredResults).toHaveLength(1)
        expect(affStore.filteredResults.every(item => affiliationType(item) === 'Amalgamation Application')).toEqual(true)
      })

      it('should filter a BC Limited Company', async () => {
        mockAuthApi.mockResolvedValue(mockAffiliationResponse)

        const affStore = useAffiliationsStore()
        await affStore.loadAffiliations()

        await flushPromises()

        affStore.affiliations.filters.type = 'BC Limited Company'

        expect(affStore.filteredResults).toHaveLength(3)
        expect(affStore.filteredResults.every(item => affiliationType(item) === 'BC Limited Company')).toEqual(true)
      })
    })

    describe('filter by status', () => {
      it('should filter by draft', async () => {
        mockAuthApi.mockResolvedValue(mockAffiliationResponse)

        const affStore = useAffiliationsStore()
        await affStore.loadAffiliations()

        await flushPromises()

        affStore.affiliations.filters.status = 'Draft'

        expect(affStore.filteredResults).toHaveLength(2)
        expect(affStore.filteredResults.every(item => affiliationStatus(item) === 'Draft')).toEqual(true)
      })

      it('should filter by historical', async () => {
        mockAuthApi.mockResolvedValue(mockAffiliationResponse)

        const affStore = useAffiliationsStore()
        await affStore.loadAffiliations()

        await flushPromises()

        affStore.affiliations.filters.status = 'Historical'

        expect(affStore.filteredResults).toHaveLength(2)
        expect(affStore.filteredResults.every(item => affiliationStatus(item) === 'Historical')).toEqual(true)
      })
    })

    describe('statusOptions', () => {
      it('should be created based off the results objects', async () => {
        mockAuthApi.mockResolvedValue(mockAffiliationResponse)

        const affStore = useAffiliationsStore()
        await affStore.loadAffiliations()

        await flushPromises()

        expect(affStore.statusOptions).toEqual(['Draft', 'Historical', 'Active'])
      })
    })

    describe('typeOptions', () => {
      it('should be created based off the results objects', async () => {
        mockAuthApi.mockResolvedValue(mockAffiliationResponse)

        const affStore = useAffiliationsStore()
        await affStore.loadAffiliations()

        await flushPromises()

        expect(affStore.typeOptions).toEqual([
          'Amalgamation Application',
          'BC Limited Company',
          'BC Benefit Company',
          'Registration'
        ])
      })
    })

    describe('hasFilters', () => {
      it('should be false by default', async () => {
        mockAuthApi.mockResolvedValue(mockAffiliationResponse)

        const affStore = useAffiliationsStore()
        await affStore.loadAffiliations()

        await flushPromises()

        expect(affStore.hasFilters).toEqual(false)
      })

      it('should be true with a name filter active', async () => {
        mockAuthApi.mockResolvedValue(mockAffiliationResponse)

        const affStore = useAffiliationsStore()
        await affStore.loadAffiliations()

        await flushPromises()

        expect(affStore.hasFilters).toEqual(false)

        affStore.affiliations.filters.businessName = 'test'

        expect(affStore.hasFilters).toEqual(true)
      })

      it('should be true with a number filter active', async () => {
        mockAuthApi.mockResolvedValue(mockAffiliationResponse)

        const affStore = useAffiliationsStore()
        await affStore.loadAffiliations()

        await flushPromises()

        expect(affStore.hasFilters).toEqual(false)

        affStore.affiliations.filters.businessNumber = 'test'

        expect(affStore.hasFilters).toEqual(true)
      })

      it('should be true with a type filter active', async () => {
        mockAuthApi.mockResolvedValue(mockAffiliationResponse)

        const affStore = useAffiliationsStore()
        await affStore.loadAffiliations()

        await flushPromises()

        expect(affStore.hasFilters).toEqual(false)

        affStore.affiliations.filters.type = 'test'

        expect(affStore.hasFilters).toEqual(true)
      })

      it('should be true with a status filter active', async () => {
        mockAuthApi.mockResolvedValue(mockAffiliationResponse)

        const affStore = useAffiliationsStore()
        await affStore.loadAffiliations()

        await flushPromises()

        expect(affStore.hasFilters).toEqual(false)

        affStore.affiliations.filters.status = 'test'

        expect(affStore.hasFilters).toEqual(true)
      })
    })

    describe('resetFilters', () => {
      it('should reset all filters', async () => {
        mockAuthApi.mockResolvedValue(mockAffiliationResponse)

        const affStore = useAffiliationsStore()
        await affStore.loadAffiliations()

        await flushPromises()

        expect(affStore.hasFilters).toEqual(false)

        affStore.affiliations.filters.businessName = 'test'
        affStore.affiliations.filters.businessNumber = 'test'
        affStore.affiliations.filters.type = 'test'
        affStore.affiliations.filters.status = 'test'

        expect(affStore.hasFilters).toEqual(true)

        affStore.resetFilters()

        expect(affStore.hasFilters).toEqual(false)
      })
    })
  })
})
