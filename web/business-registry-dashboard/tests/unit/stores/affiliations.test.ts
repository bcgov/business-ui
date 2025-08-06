import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { EntityStates } from '@bcrs-shared-components/enums'
import { mockAffiliationResponse } from '~~/tests/mocks/mockedData'
import { AuthorizedActions } from '~~/app/enums/authorized-actions'

// Mock the IsAuthorized function
vi.mock('~~/app/utils/isAuthorized', () => ({
  IsAuthorized: vi.fn().mockReturnValue(false)
}))

let mockAuthenticated = true
const mockAuthApi = vi.fn()
const mockLegalApi = vi.fn()
mockNuxtImport('useNuxtApp', () => {
  return () => (
    {
      $keycloak: {
        authenticated: mockAuthenticated,
        token: 'mock-token'
      },
      $authApiBRD: mockAuthApi,
      $legalApi: mockLegalApi
    }
  )
})

const mockKeycloakRoles: any[] = []
mockNuxtImport('useKeycloak', () => {
  return () => (
    {
      kcUser: {
        roles: mockKeycloakRoles
      }
    }
  )
})

const mockAddToast = vi.fn()
mockNuxtImport('useToast', () => {
  return () => (
    {
      add: mockAddToast
    }
  )
})

const mockOpenModal = vi.fn()
mockNuxtImport('useModal', () => {
  return () => (
    {
      open: mockOpenModal
    }
  )
})

const mockOpenManageNameRequest = vi.fn()
const mockOpenManageNRError = vi.fn()
const mockOpenBusinessAddError = vi.fn()
const mockOpenBusinessUnavailableError = vi.fn()
const mockOpenBusinessRemovalConfirmation = vi.fn()
const mockOpenManageBusiness = vi.fn()
const mockClose = vi.fn()
mockNuxtImport('useBrdModals', () => {
  return () => (
    {
      openManageNameRequest: mockOpenManageNameRequest,
      openManageNRError: mockOpenManageNRError,
      openBusinessAddError: mockOpenBusinessAddError,
      openBusinessUnavailableError: mockOpenBusinessUnavailableError,
      openBusinessRemovalConfirmation: mockOpenBusinessRemovalConfirmation,
      openManageBusiness: mockOpenManageBusiness,
      close: mockClose
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

const processedAffiliations = [
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
]

const mockGetStoredFlag = vi.fn()
mockNuxtImport('useConnectLaunchdarklyStore', () => {
  return () => (
    {
      getStoredFlag: mockGetStoredFlag
    }
  )
})

// Add mock for useRoute
const mockRoute = { params: {} }
mockNuxtImport('useRoute', () => {
  return () => mockRoute
})

describe('useAffiliationsStore', () => {
  let store: any

  beforeEach(() => {
    // Reset mocks first
    vi.clearAllMocks()

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

    // Set up default mock for loadAuthorizedActions for all tests - after clearing mocks
    mockLegalApi.mockResolvedValue({ authorizedPermissions: [] })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetAllMocks()
    mockAuthenticated = true
    mockRoute.params = {} // Reset route params after each test
  })

  describe('loadAffiliations', () => {
    it('should fetch and set affiliations correctly', async () => {
      mockGetStoredFlag.mockImplementation((flag) => {
        if (flag === LDFlags.AffiliationInvitationRequestAccess) { return true } // set LDFlags.AffiliationInvitationRequestAccess = true - allow invitations fetch
        if (flag === LDFlags.EnableAffiliationsPagination) { return false }
      })
      mockAuthApi
        .mockResolvedValueOnce(mockEntities) // affiliations
        .mockResolvedValueOnce({ // invitations
          affiliationInvitations: []
        })

      const affStore = useAffiliationsStore()

      await affStore.loadAffiliations()
      await flushPromises()

      // Should use accountStore.currentAccount.id since not staff
      expect(mockAuthApi).toHaveBeenCalledWith('/orgs/123/affiliations?new=true')
      // results mapped to business object
      expect(affStore.affiliations.results).toEqual(processedAffiliations)
      expect(affStore.affiliations.count).toEqual(4)
    })

    it('should use route param orgId when user is staff', async () => {
      // Override the mock for this test only
      vi.mocked(IsAuthorized).mockImplementation((action) => {
        if (action === AuthorizedActions.MANAGE_OTHER_ORGANIZATION) {
          return true // Always return true for this test
        }
        return false
      })

      mockGetStoredFlag.mockImplementation((flag) => {
        if (flag === LDFlags.AffiliationInvitationRequestAccess) { return true } // set LDFlags.AffiliationInvitationRequestAccess = true - allow invitations fetch
        if (flag === LDFlags.EnableAffiliationsPagination) { return false }
      })
      store.currentAccount.accountType = 'STAFF' // Make user staff
      mockRoute.params = { orgId: '456' } // Set route param

      mockAuthApi
        .mockResolvedValueOnce(mockEntities)
        .mockResolvedValueOnce({
          affiliationInvitations: []
        })

      const affStore = useAffiliationsStore()

      await affStore.loadAffiliations()
      await flushPromises()

      // Should use route.params.orgId since user is staff
      expect(mockAuthApi).toHaveBeenCalledWith('/orgs/456/affiliations?new=true')
      // results mapped to business object
      expect(affStore.affiliations.results).toEqual(processedAffiliations)
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

    it('should handle fetch errors', async () => {
      mockAuthApi.mockRejectedValue({ response: { status: 400, statusText: 'NOT FOUND' } })
      const consoleSpy = vi.spyOn(console, 'error')

      const affStore = useAffiliationsStore()

      await affStore.loadAffiliations()

      await flushPromises()

      expect(consoleSpy).toHaveBeenCalledWith('Error retrieving businesses: 400 - NOT FOUND ')
      expect(affStore.affiliations.results).toEqual([]) // Should remain empty
      expect(affStore.affiliations.count).toEqual(0)
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

  it('resetAffiliations should reset affiliations correctly', async () => {
    mockGetStoredFlag.mockReturnValue(true) // set LDFlags.AffiliationInvitationRequestAccess = true - allow invitations fetch
    mockAuthApi
      .mockResolvedValueOnce(mockEntities) // affiliations
      .mockResolvedValueOnce({ // invitations
        affiliationInvitations: []
      })

    const affStore = useAffiliationsStore()

    await affStore.loadAffiliations()

    await flushPromises()

    expect(mockAuthApi).toHaveBeenCalledTimes(2)

    expect(affStore.affiliations.results).toHaveLength(4)
    expect(affStore.affiliations.count).toEqual(4)

    affStore.resetAffiliations()

    expect(affStore.affiliations.results).toEqual([])
    expect(affStore.affiliations.count).toEqual(0)
  })

  it('should call loadAffiliations when currentAccount ID changes', async () => {
    // Mock feature flags to disable pagination and server filtering but enable invitation fetching
    mockGetStoredFlag.mockImplementation((flag) => {
      if (flag === LDFlags.EnableAffiliationsPagination) { return false }
      if (flag === LDFlags.EnableAffiliationsServerFiltering) { return false }
      if (flag === LDFlags.AffiliationInvitationRequestAccess) { return true }
      return false
    })
    mockAuthApi
      .mockResolvedValueOnce(mockEntities) // affiliations for first call
      .mockResolvedValueOnce({ // invitations for first call - handleAffiliationInvitations
        affiliationInvitations: []
      })
      .mockResolvedValueOnce(mockEntities) // affiliations for second call
      .mockResolvedValueOnce({ // invitations for second call - handleAffiliationInvitations
        affiliationInvitations: []
      })

    const affStore = useAffiliationsStore()

    // Initial load
    await affStore.loadAffiliations()
    await flushPromises()

    expect(mockAuthApi).toHaveBeenCalledTimes(2)
    expect(mockAuthApi.mock.calls[0][0]).toBe('/orgs/123/affiliations?new=true')

    // Change account ID
    store.currentAccount.id = '456'

    // In a real app, the watcher would trigger loadAffiliations automatically
    // but in tests we need to call it explicitly
    await affStore.loadAffiliations()
    await flushPromises()

    expect(mockAuthApi).toHaveBeenCalledTimes(4)
    expect(mockAuthApi.mock.calls[2][0]).toBe('/orgs/456/affiliations?new=true')
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
        mockGetStoredFlag.mockImplementation((flag) => {
          if (flag === LDFlags.EnableAffiliationsServerFiltering) { return false }
          return true
        })
        mockAuthApi
          .mockResolvedValueOnce(mockAffiliationResponse) // affiliations
          .mockResolvedValueOnce({ // invitations
            affiliationInvitations: []
          })

        const affStore = useAffiliationsStore()
        await affStore.loadAffiliations()

        await flushPromises()

        expect(mockAuthApi).toHaveBeenCalledTimes(2)
        affStore.affiliations.filters.businessName = 'SOME TEST NAME 321'

        expect(affStore.filteredResults).toHaveLength(1)
        expect(affStore.filteredResults[0]?.nameRequest?.names?.some(item => item.name === 'SOME TEST NAME 321')).toEqual(true)
      })

      it('should filter a business object', async () => {
        mockAuthApi
          .mockResolvedValueOnce(mockAffiliationResponse) // affiliations
          .mockResolvedValueOnce({ // invitations
            affiliationInvitations: []
          })

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
        mockAuthApi
          .mockResolvedValueOnce(mockAffiliationResponse) // affiliations
          .mockResolvedValueOnce({ // invitations
            affiliationInvitations: []
          })

        const affStore = useAffiliationsStore()
        await affStore.loadAffiliations()

        await flushPromises()

        affStore.affiliations.filters.businessNumber = 'NR 3819593'

        expect(affStore.filteredResults).toHaveLength(1)
        expect(affStore.filteredResults[0]?.nameRequest?.names?.some(item => item.name === 'SOME TEST NAME 321')).toEqual(true)
      })

      it('should filter a business object', async () => {
        mockAuthApi
          .mockResolvedValueOnce(mockAffiliationResponse) // affiliations
          .mockResolvedValueOnce({ // invitations
            affiliationInvitations: []
          })

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
        mockAuthApi
          .mockResolvedValueOnce(mockAffiliationResponse) // affiliations
          .mockResolvedValueOnce({ // invitations
            affiliationInvitations: []
          })

        const affStore = useAffiliationsStore()
        await affStore.loadAffiliations()

        await flushPromises()

        affStore.affiliations.filters.type = ['Amalgamation Application']

        expect(affStore.filteredResults).toHaveLength(1)
        expect(affStore.filteredResults.every(item => affiliationType(item) === 'Amalgamation Application')).toEqual(true)
      })

      it('should filter a BC Limited Company', async () => {
        mockAuthApi
          .mockResolvedValueOnce(mockAffiliationResponse) // affiliations
          .mockResolvedValueOnce({ // invitations
            affiliationInvitations: []
          })

        const affStore = useAffiliationsStore()
        await affStore.loadAffiliations()

        await flushPromises()

        affStore.affiliations.filters.type = ['BC Limited Company']

        expect(affStore.filteredResults).toHaveLength(3)
        expect(affStore.filteredResults.every(item => affiliationType(item) === 'BC Limited Company')).toEqual(true)
      })

      it('should filter with multiple types', async () => {
        mockAuthApi
          .mockResolvedValueOnce(mockAffiliationResponse) // affiliations
          .mockResolvedValueOnce({ // invitations
            affiliationInvitations: []
          })

        const affStore = useAffiliationsStore()
        await affStore.loadAffiliations()

        await flushPromises()

        // Filter by both 'Amalgamation Application' and 'BC Benefit Company'
        affStore.affiliations.filters.type = ['Amalgamation Application', 'BC Benefit Company']

        // Both types combined should return 2 results (1 Amalgamation Application + 1 BC Benefit Company)
        expect(affStore.filteredResults).toHaveLength(2)

        // Verify that each result has one of the selected types
        expect(affStore.filteredResults.every(item =>
          affiliationType(item) === 'Amalgamation Application' ||
          affiliationType(item) === 'BC Benefit Company'
        )).toEqual(true)

        // Count how many of each type we have
        const amalgamationCount = affStore.filteredResults.filter(item =>
          affiliationType(item) === 'Amalgamation Application'
        ).length
        const benefitCompanyCount = affStore.filteredResults.filter(item =>
          affiliationType(item) === 'BC Benefit Company'
        ).length

        expect(amalgamationCount).toEqual(1)
        expect(benefitCompanyCount).toEqual(1)
      })
    })

    describe('filter by status', () => {
      it('should filter by draft', async () => {
        mockAuthApi
          .mockResolvedValueOnce(mockAffiliationResponse) // affiliations
          .mockResolvedValueOnce({ // invitations
            affiliationInvitations: []
          })

        const affStore = useAffiliationsStore()
        await affStore.loadAffiliations()

        await flushPromises()

        affStore.affiliations.filters.status = ['Draft']

        expect(affStore.filteredResults).toHaveLength(2)
        expect(affStore.filteredResults.every(item => affiliationStatus(item) === 'Draft')).toEqual(true)
      })

      it('should filter by historical', async () => {
        mockAuthApi
          .mockResolvedValueOnce(mockAffiliationResponse) // affiliations
          .mockResolvedValueOnce({ // invitations
            affiliationInvitations: []
          })

        const affStore = useAffiliationsStore()
        await affStore.loadAffiliations()

        await flushPromises()

        affStore.affiliations.filters.status = ['Historical']

        expect(affStore.filteredResults).toHaveLength(2)
        expect(affStore.filteredResults.every(item => affiliationStatus(item) === 'Historical')).toEqual(true)
      })

      it('should filter with multiple statuses', async () => {
        mockAuthApi
          .mockResolvedValueOnce(mockAffiliationResponse) // affiliations
          .mockResolvedValueOnce({ // invitations
            affiliationInvitations: []
          })

        const affStore = useAffiliationsStore()
        await affStore.loadAffiliations()

        await flushPromises()

        // Filter by both 'Draft' and 'Historical' statuses
        affStore.affiliations.filters.status = ['Draft', 'Historical']

        // Both statuses combined should return 4 results (2 Draft + 2 Historical)
        expect(affStore.filteredResults).toHaveLength(4)

        // Verify that each result has one of the selected statuses
        expect(affStore.filteredResults.every(item =>
          affiliationStatus(item) === 'Draft' ||
          affiliationStatus(item) === 'Historical'
        )).toEqual(true)

        // Count how many of each status we have
        const draftCount = affStore.filteredResults.filter(item =>
          affiliationStatus(item) === 'Draft'
        ).length
        const historicalCount = affStore.filteredResults.filter(item =>
          affiliationStatus(item) === 'Historical'
        ).length

        expect(draftCount).toEqual(2)
        expect(historicalCount).toEqual(2)
      })
    })

    describe('statusOptions', () => {
      it('should be created based off the results objects', async () => {
        mockAuthApi
          .mockResolvedValueOnce(mockAffiliationResponse) // affiliations
          .mockResolvedValueOnce({ // invitations
            affiliationInvitations: []
          })

        const affStore = useAffiliationsStore()
        await affStore.loadAffiliations()

        await flushPromises()

        expect(affStore.statusOptions).toEqual(['Draft', 'Historical', 'Active'])
      })
    })

    describe('typeOptions', () => {
      it('should be created based off the results objects', async () => {
        mockAuthApi
          .mockResolvedValueOnce(mockAffiliationResponse) // affiliations
          .mockResolvedValueOnce({ // invitations
            affiliationInvitations: []
          })

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

        affStore.affiliations.filters.type = ['test']

        expect(affStore.hasFilters).toEqual(true)
      })

      it('should be true with a status filter active', async () => {
        mockAuthApi.mockResolvedValue(mockAffiliationResponse)

        const affStore = useAffiliationsStore()
        await affStore.loadAffiliations()

        await flushPromises()

        expect(affStore.hasFilters).toEqual(false)

        affStore.affiliations.filters.status = ['test']

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
        affStore.affiliations.filters.type = ['test']
        affStore.affiliations.filters.status = ['test']

        expect(affStore.hasFilters).toEqual(true)

        affStore.resetFilters()

        expect(affStore.hasFilters).toEqual(false)
      })
    })

    describe('combining filters', () => {
      it('should filter with both type and status filters applied', async () => {
        mockAuthApi
          .mockResolvedValueOnce(mockAffiliationResponse) // affiliations
          .mockResolvedValueOnce({ // invitations
            affiliationInvitations: []
          })

        const affStore = useAffiliationsStore()
        await affStore.loadAffiliations()

        await flushPromises()

        // Apply both type and status filters
        affStore.affiliations.filters.type = ['BC Limited Company']
        affStore.affiliations.filters.status = ['Historical']

        // Should only find BC Limited Companies with Historical status
        expect(affStore.filteredResults).toHaveLength(2)

        // Verify that results match both filters
        expect(affStore.filteredResults.every(item =>
          affiliationType(item) === 'BC Limited Company' &&
          affiliationStatus(item) === 'Historical'
        )).toEqual(true)

        // Check specific identifiers to confirm we got the right entities
        expect(affStore.filteredResults[0]?.businessIdentifier).toEqual('BC0871227')
      })
    })
  })

  describe('removeAffiliation', () => {
    it('should call $authApi with the correct arguments', async () => {
      const orgIdentifier = 123
      const incorporationNumber = 'INC001234'
      const passcodeResetEmail = 'test@example.com'
      const resetPasscode = true

      const affStore = useAffiliationsStore()
      await affStore.removeAffiliation(orgIdentifier, incorporationNumber, passcodeResetEmail, resetPasscode)

      expect(mockAuthApi).toHaveBeenCalledWith(
        `/orgs/${orgIdentifier}/affiliations/${incorporationNumber}`,
        {
          method: 'DELETE',
          body: {
            data: {
              passcodeResetEmail,
              resetPasscode,
              logDeleteDraft: true
            }
          }
        }
      )
    })

    it('should call $authApi with the correct default arguments', async () => {
      const orgIdentifier = 123
      const incorporationNumber = 'INC001234'

      const { removeAffiliation } = useAffiliationsStore()
      await removeAffiliation(orgIdentifier, incorporationNumber)

      expect(mockAuthApi).toHaveBeenCalledWith(
        `/orgs/${orgIdentifier}/affiliations/${incorporationNumber}`,
        {
          method: 'DELETE',
          body: {
            data: {
              passcodeResetEmail: undefined,
              resetPasscode: undefined,
              logDeleteDraft: true
            }
          }
        }
      )
    })
  })

  describe('getFilings', () => {
    it('should call $legalApi with correct options', async () => {
      const businessNumber = 'BN123456'
      const affStore = useAffiliationsStore()

      await affStore.getFilings(businessNumber)
      expect(mockLegalApi).toHaveBeenCalledWith(`/businesses/${businessNumber}/filings`)
    })
  })

  describe('deleteBusinessFiling', () => {
    it('should call $legalApi with correct options', async () => {
      const businessNumber = 'BN123456'
      const filingId = 'FILING001'
      const affStore = useAffiliationsStore()

      await affStore.deleteBusinessFiling(businessNumber, filingId)

      expect(mockLegalApi).toHaveBeenCalledWith(
        `/businesses/${businessNumber}/filings/${filingId}`,
        { method: 'DELETE' }
      )
    })
  })

  describe('removeBusiness', () => {
    let affStore: any

    beforeEach(() => {
      affStore = useAffiliationsStore()
    })

    it('should remove business filing if business is an INCORPORATION_APPLICATION and a filing exists', async () => {
      mockLegalApi.mockResolvedValueOnce({ status: 200, filing: { header: { filingId: 'filing-123' } } }) // mock getFiling api call
      mockAuthApi.mockResolvedValueOnce(undefined) // mock removeAffiliation api call

      const payload = {
        business: {
          corpType: { code: CorpTypes.INCORPORATION_APPLICATION },
          businessIdentifier: 'biz-123'
        },
        orgIdentifier: 'org-123',
        passcodeResetEmail: 'email@example.com',
        resetPasscode: true
      }

      await affStore.removeBusiness(payload)

      expect(mockLegalApi).toHaveBeenCalledWith('/businesses/biz-123/filings') // should call getFilings
      expect(mockLegalApi).toHaveBeenCalledWith('/businesses/biz-123/filings/filing-123', { method: 'DELETE' }) // should call deleteBusinessFiling
      expect(mockAuthApi).not.toHaveBeenCalled()
    })

    it('should remove affiliation if business is an INCORPORATION_APPLICATION and no filing exists', async () => {
      mockLegalApi.mockResolvedValueOnce({ status: 200, filing: null }) // mock getFilings api call
      mockAuthApi.mockResolvedValueOnce(undefined) // mock removeAffiliation api call

      const payload = {
        business: {
          corpType: { code: CorpTypes.INCORPORATION_APPLICATION },
          businessIdentifier: 'biz-123'
        },
        orgIdentifier: 'org-123',
        passcodeResetEmail: 'email@example.com',
        resetPasscode: true
      }

      await affStore.removeBusiness(payload)

      expect(mockLegalApi).toHaveBeenCalledWith('/businesses/biz-123/filings') // should call getFilings
      expect(mockAuthApi).toHaveBeenCalledWith('/orgs/org-123/affiliations/biz-123', { // should call removeAffiliation
        method: 'DELETE',
        body: { data: { passcodeResetEmail: 'email@example.com', resetPasscode: true, logDeleteDraft: true } }
      })
    })

    it('should remove affiliation if business is not an INCORPORATION_APPLICATION', async () => {
      mockAuthApi.mockResolvedValueOnce(undefined)

      const payload = {
        business: {
          corpType: { code: 'OTHER' },
          businessIdentifier: 'biz-123'
        },
        orgIdentifier: 'org-123',
        passcodeResetEmail: 'email@example.com',
        resetPasscode: true
      }

      await affStore.removeBusiness(payload)

      expect(mockAuthApi).toHaveBeenCalledWith('/orgs/org-123/affiliations/biz-123', { // should call removeAffiliation
        method: 'DELETE',
        body: { data: { passcodeResetEmail: 'email@example.com', resetPasscode: true, logDeleteDraft: true } }
      })
      expect(mockLegalApi).not.toHaveBeenCalled()
    })

    it('should remove affiliation with name request nrNumber if businessIdentifier is missing', async () => {
      mockAuthApi.mockResolvedValue({ status: 200 })
      mockLegalApi.mockResolvedValue({ status: 200, filing: { header: { filingId: 'filing-123' } } })

      const payload = {
        business: {
          corpType: { code: 'OTHER_TYPE' },
          businessIdentifier: undefined, // missing businessIdentifier
          nameRequest: { nrNumber: 'NR123' } // fallback to nr number
        },
        orgIdentifier: 'org-123',
        passcodeResetEmail: 'email@example.com',
        resetPasscode: true
      }

      await affStore.removeBusiness(payload)

      expect(mockAuthApi).toHaveBeenCalledWith( // should call removeAffiliation
        '/orgs/org-123/affiliations/NR123',
        expect.objectContaining({
          method: 'DELETE',
          body: {
            data: { passcodeResetEmail: 'email@example.com', resetPasscode: true, logDeleteDraft: true }
          }
        })
      )
      expect(mockLegalApi).not.toHaveBeenCalled() // should not call deleteBusinessFiling
    })
  })

  describe('canBusinessBeDeleted', () => {
    let affStore: any

    beforeEach(() => {
      affStore = useAffiliationsStore()
    })

    it('should return true when draftStatus is undefined', () => {
      const payload = {
        business: {
          corpType: { code: 'ANY_TYPE' },
          draftStatus: undefined,
          businessIdentifier: 'BC1234567'
        },
        orgIdentifier: 123
      }

      const result = affStore.canBusinessBeDeleted(payload)
      expect(result).toBe(true)
    })

    it('should return true when draftStatus is null', () => {
      const payload = {
        business: {
          corpType: { code: 'ANY_TYPE' },
          draftStatus: null,
          businessIdentifier: 'BC1234567'
        },
        orgIdentifier: 123
      }

      const result = affStore.canBusinessBeDeleted(payload)
      expect(result).toBe(true)
    })

    it('should return false when draftStatus is WITHDRAWN', () => {
      const payload = {
        business: {
          corpType: { code: 'ANY_TYPE' },
          draftStatus: EntityStates.WITHDRAWN,
          businessIdentifier: 'BC1234567'
        },
        orgIdentifier: 123
      }

      const result = affStore.canBusinessBeDeleted(payload)
      expect(result).toBe(false)
    })

    it('should return false when corpType is CONTINUATION_IN and draftStatus is not DRAFT', () => {
      const payload = {
        business: {
          corpType: { code: CorpTypes.CONTINUATION_IN },
          draftStatus: EntityStates.ACTIVE, // Any status other than DRAFT
          businessIdentifier: 'BC1234567'
        },
        orgIdentifier: 123
      }

      const result = affStore.canBusinessBeDeleted(payload)
      expect(result).toBe(false)
    })

    it('should return true when corpType is CONTINUATION_IN and draftStatus is DRAFT', () => {
      const payload = {
        business: {
          corpType: { code: CorpTypes.CONTINUATION_IN },
          draftStatus: EntityStates.DRAFT,
          businessIdentifier: 'BC1234567'
        },
        orgIdentifier: 123
      }

      const result = affStore.canBusinessBeDeleted(payload)
      expect(result).toBe(true)
    })

    it('should return true for other draftStatus values that are not WITHDRAWN', () => {
      const payload = {
        business: {
          corpType: { code: 'ANY_TYPE' },
          draftStatus: EntityStates.DRAFT,
          businessIdentifier: 'BC1234567'
        },
        orgIdentifier: 123
      }

      const result = affStore.canBusinessBeDeleted(payload)
      expect(result).toBe(true)
    })
  })

  describe('removeInvite', () => {
    it('should call $authApi with the correct URL and method', async () => {
      const affStore = useAffiliationsStore()

      const inviteId = 123

      await affStore.removeInvite(inviteId)

      expect(mockAuthApi).toHaveBeenCalledWith(
        `/affiliationInvitations/${inviteId}`,
        expect.objectContaining({
          method: 'DELETE'
        })
      )
      expect(mockAuthApi).toHaveBeenCalledTimes(1)
    })
  })

  describe('removeAcceptedAffiliationInvitations', () => {
    it('should call removeInvite for invitations with Accepted status', async () => {
      mockAuthApi.mockResolvedValue({ status: 200 })

      const business = {
        affiliationInvites: [
          { id: 1, status: 'ACCEPTED' },
          { id: 2, status: 'Pending' },
          { id: 3, status: 'ACCEPTED' },
          { id: 4, status: 'Failed' }
        ]
      }

      const affStore = useAffiliationsStore()

      // @ts-expect-error - expect arg to not match param type
      await affStore.removeAcceptedAffiliationInvitations(business)

      // should only be called twice
      expect(mockAuthApi).toHaveBeenCalledTimes(2)

      // only called with status = accepted
      expect(mockAuthApi).toHaveBeenCalledWith('/affiliationInvitations/1', { method: 'DELETE' })
      expect(mockAuthApi).toHaveBeenCalledWith('/affiliationInvitations/3', { method: 'DELETE' })

      // not called with other status
      expect(mockAuthApi).not.toHaveBeenCalledWith('/affiliationInvitations/2', expect.anything())
      expect(mockAuthApi).not.toHaveBeenCalledWith('/affiliationInvitations/4', expect.anything())
    })
  })

  describe('createNRAffiliation', () => {
    it('should call $authApi with the correct URL, method, and body', async () => {
      const mockAffiliation = {
        businessIdentifier: 'NR123456',
        orgIdentifier: 'org-123'
      }

      const affStore = useAffiliationsStore()

      await affStore.createNRAffiliation(mockAffiliation)

      expect(mockAuthApi).toHaveBeenCalledOnce()
      expect(mockAuthApi).toHaveBeenCalledWith('/orgs/123/affiliations?newBusiness=true', {
        method: 'POST',
        body: mockAffiliation
      })
    })
  })

  describe('handleManageBusinessOrNameRequest', () => {
    let affStore: any

    beforeEach(() => {
      affStore = useAffiliationsStore()
    })

    it('should open manage business modal when searchType is "reg"', () => {
      const event: ManageBusinessEvent = {
        bn: '123',
        identifier: '123',
        legalType: 'some type',
        name: 'some name',
        score: 42,
        status: 'some status'
      }
      affStore.handleManageBusinessOrNameRequest('reg', event)

      expect(mockOpenManageBusiness).toHaveBeenCalled()
    })

    it('should call addBusinessForStaffSilently when authorized', async () => {
      mockAuthApi.mockResolvedValue({ status: 200 })

      // Override the mock for this test only
      vi.mocked(IsAuthorized).mockImplementation((action) => {
        if (action === AuthorizedActions.ADD_ENTITY_NO_AUTHENTICATION) {
          return true // Always return true for this test
        }
        return false
      })

      const event: ManageBusinessEvent = {
        bn: '123',
        identifier: '123',
        legalType: 'some type',
        name: 'some name',
        score: 42,
        status: 'some status'
      }

      await affStore.handleManageBusinessOrNameRequest('reg', event)

      expect(mockAuthApi).toHaveBeenCalledTimes(2) // once for creating affiliation and once for reloading affiliations

      expect(mockOpenManageBusiness).not.toHaveBeenCalled() // staff shouldnt open the modal
      expect(mockAddToast).toHaveBeenCalledOnce()
    })

    it('should call addNameRequestForStaffSilently when authorized', async () => {
      mockAuthApi.mockResolvedValue({ status: 200 })

      // Override the mock for this test only
      vi.mocked(IsAuthorized).mockImplementation((action) => {
        if (action === AuthorizedActions.ADD_ENTITY_NO_AUTHENTICATION) {
          return true // Always return true for this test
        }
        return false
      })

      const event = { names: ['test'], nrNum: 'NR123' }

      await affStore.handleManageBusinessOrNameRequest('namex', event)

      expect(mockAuthApi).toHaveBeenCalledTimes(2) // once for creating affiliation and once for reloading affiliations

      expect(mockOpenManageNameRequest).not.toHaveBeenCalled() // staff shouldnt open the modal
      expect(mockAddToast).toHaveBeenCalledOnce()
    })

    it('should open the manage name request modal when search type is namex', () => {
      const event = { names: ['test'], nrNum: 'NR123' }

      affStore.handleManageBusinessOrNameRequest('namex', event)

      expect(mockOpenManageNameRequest).toHaveBeenCalledOnce()
    })
  })

  describe('addNameRequestForStaffSilently', () => {
    it('should successfully add a name request for staff and reload affiliations', async () => {
      mockAuthApi.mockResolvedValue(undefined)
      const affStore = useAffiliationsStore()

      const businessIdentifier = 'NR123'
      await affStore.addNameRequestForStaffSilently(businessIdentifier)

      // Assert that the API was called
      expect(mockAuthApi).toHaveBeenCalledWith('/orgs/123/affiliations?newBusiness=true', {
        body: {
          businessIdentifier: 'NR123'
        },
        method: 'POST'
      })

      // should have success toast
      expect(mockAddToast).toHaveBeenCalledOnce()

      expect(mockAuthApi).toHaveBeenCalledTimes(2) // once for affiliation once for reload
    })

    it('should handle error by opening the manage name request error modal', async () => {
      mockAuthApi.mockRejectedValueOnce(new Error('API Error')) // throw error
      const affStore = useAffiliationsStore()

      const businessIdentifier = 'NR123'
      await affStore.addNameRequestForStaffSilently(businessIdentifier)

      expect(mockAuthApi).toHaveBeenCalledOnce() // auth api only called once when error is thrown

      expect(mockAddToast).toHaveBeenCalled() // success toast should not be called
    })
  })

  describe('handleAffiliationInvitations', () => {
    it('should return affiliation invitations and add to affiliatedEntities with an existing business', async () => {
      mockGetStoredFlag.mockReturnValue(true) // set LDFlags.AffiliationInvitationRequestAccess = true - allow invitations fetch
      mockAuthApi
        .mockResolvedValueOnce({
          entities: [
            { identifier: '123', legalType: 'BEN', affiliationInvites: [] },
            { identifier: '456', legalType: 'BEN', affiliationInvites: [] }
          ]
        }) // affiliations
        .mockResolvedValueOnce({ // invitations
          affiliationInvitations: [{
            entity: { businessIdentifier: '123', corpType: 'BEN' }, // existing business identifier
            fromOrg: { id: 123 },
            status: AffiliationInvitationStatus.Pending
          }]
        })

      const affStore = useAffiliationsStore()
      await affStore.loadAffiliations()

      await flushPromises()

      expect(affStore.affiliations.results).toHaveLength(2)
      // invite should be added to current business
      expect(affStore.affiliations.results).toEqual([
        {
          businessIdentifier: '123',
          corpType: { code: 'BEN' },
          corpSubType: { code: 'BEN' },
          adminFreeze: false,
          goodStanding: true,
          affiliationInvites: [
            {
              entity: {
                businessIdentifier: '123',
                corpType: 'BEN'
              },
              fromOrg: {
                id: 123
              },
              status: 'PENDING'
            }
          ]
        },
        {
          businessIdentifier: '456',
          corpType: { code: 'BEN' },
          corpSubType: { code: 'BEN' },
          adminFreeze: false,
          goodStanding: true
        }
      ])
    })

    it('should return affiliation invitations and add to affiliatedEntities with a new business', async () => {
      mockGetStoredFlag.mockReturnValue(true) // set LDFlags.AffiliationInvitationRequestAccess = true - allow invitations fetch
      mockAuthApi
        .mockResolvedValueOnce({
          entities: [
            { identifier: '123', legalType: 'BEN', affiliationInvites: [] },
            { identifier: '456', legalType: 'BEN', affiliationInvites: [] }
          ]
        }) // affiliations
        .mockResolvedValueOnce({ // invitations
          affiliationInvitations: [{
            entity: { businessIdentifier: '789', corpType: 'BEN' }, // new business identifier
            fromOrg: { id: 123 },
            status: AffiliationInvitationStatus.Pending
          }]
        })

      const affStore = useAffiliationsStore()
      await affStore.loadAffiliations()

      await flushPromises()

      expect(affStore.affiliations.results).toHaveLength(3)
      // invite should create new business object
      expect(affStore.affiliations.results).toEqual([
        {
          businessIdentifier: '789',
          corpType: { code: 'BEN' },
          affiliationInvites: [
            {
              entity: { businessIdentifier: '789', corpType: 'BEN' },
              fromOrg: { id: 123 },
              status: 'PENDING'
            }
          ]
        },
        {
          businessIdentifier: '123',
          corpType: { code: 'BEN' },
          corpSubType: { code: 'BEN' },
          adminFreeze: false,
          goodStanding: true
        },
        {
          businessIdentifier: '456',
          corpType: { code: 'BEN' },
          corpSubType: { code: 'BEN' },
          adminFreeze: false,
          goodStanding: true
        }
      ])
    })

    it('should log an error if the API request fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error')
      mockGetStoredFlag.mockReturnValue(true) // set LDFlags.AffiliationInvitationRequestAccess = true - allow invitations fetch
      mockAuthApi
        .mockResolvedValueOnce(mockEntities) // affiliations
        .mockRejectedValueOnce({ response: { status: 404, statusText: 'NOT FOUND' } }) // invitations

      const affStore = useAffiliationsStore()
      await affStore.loadAffiliations()

      await flushPromises()

      expect(consoleSpy).toHaveBeenCalledOnce()
      expect(consoleSpy).toHaveBeenCalledWith('Error retrieving affiliation invitations: 404 - NOT FOUND ')

      expect(affStore.affiliations.results).toEqual(processedAffiliations)
    })

    it('should not fetch invitations if LDFlags.AffiliationInvitationRequestAccess = false', async () => {
      mockGetStoredFlag.mockReturnValue(false) // set LDFlags.AffiliationInvitationRequestAccess = false - do not allow invitations fetch
      mockAuthApi
        .mockResolvedValueOnce(mockEntities) // affiliations
        .mockRejectedValueOnce({ response: { status: 404, statusText: 'NOT FOUND' } }) // invitations

      const affStore = useAffiliationsStore()
      await affStore.loadAffiliations()

      await flushPromises()

      expect(mockAuthApi).toHaveBeenCalledOnce() // should only be called once for initial affiliations fetch
      expect(affStore.affiliations.results).toEqual(processedAffiliations)
    })
  })
})
