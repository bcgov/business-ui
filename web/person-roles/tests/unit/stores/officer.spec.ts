import { describe, test, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import type { Row } from '@tanstack/vue-table'

const mockLegalApi = {
  getBusiness: vi.fn(),
  getParties: vi.fn(),
  getPendingTask: vi.fn(),
  getAndValidateDraftFiling: vi.fn()
}
const mockAuthApi = {
  getAuthInfo: vi.fn()
}
mockNuxtImport('useLegalApi', () => () => mockLegalApi)
mockNuxtImport('useAuthApi', () => () => mockAuthApi)

const mockModal = {
  openBaseErrorModal: vi.fn(),
  openOfficerFilingNotAllowedModal: vi.fn()
}
mockNuxtImport('useModal', () => () => mockModal)
mockNuxtImport('useRuntimeConfig', () => () => ({ public: {} }))

mockNuxtImport('useConnectAccountStore', () => () => ({ currentAccount: { id: 123 } }))
mockNuxtImport('useConnectDetailsHeaderStore', () => () => (
  { loading: false, title: {}, subtitles: [], sideDetails: [] })
)

// mockNuxtImport('validateBusinessAllowedFilings', () => () => mockAllowedFilings)
mockNuxtImport('getRequiredAddressSchema', () => () => ({ safeParse: () => ({ success: true }) }))

vi.mock('~~/app/utils/business/validate/allowed-filings', () => ({
  validateBusinessAllowedFilings: vi.fn().mockReturnValue(false)
}))

vi.mock('~~/app/utils/zod-schemas/addresses', () => ({
  getRequiredAddressSchema: vi.fn()
}))

const mockNuxtAppHook = vi.fn()
mockNuxtImport('useNuxtApp', () => () => ({
  callHook: mockNuxtAppHook,
  $i18n: { t: (key: string) => key }
}))

describe('useOfficerStore', () => {
  let store: ReturnType<typeof useOfficerStore>

  beforeEach(() => {
    vi.resetAllMocks()
    const pinia = createPinia()
    setActivePinia(pinia)
    store = useOfficerStore()
    store.$reset()
  })

  test('initializes with the correct default state', () => {
    expect(store.initializing).toBe(false)
    expect(store.addingOfficer).toBe(false)
    expect(store.officerTableState).toEqual([])
    expect(store.initialOfficers).toEqual([])
    expect(store.hasChanges).toBe(false)
  })

  describe('initOfficerStore', () => {
    const businessId = 'BC123'
    const mockBusiness = { identifier: businessId, legalName: 'Test Inc.' } as BusinessData
    const mockParties = [{ officer: { id: 1, firstName: 'Initial' }, roles: [] }] as unknown as OrgPerson[]

    // Starting a new filing (no draftId)
    describe('when starting a new filing', () => {
      test('should fully initialize state if filing is allowed and no pending tasks exist', async () => {
        // mock API calls and permissions
        mockLegalApi.getBusiness.mockResolvedValue(mockBusiness)
        mockLegalApi.getPendingTask.mockResolvedValue(undefined) // No pending tasks
        vi.mocked(validateBusinessAllowedFilings).mockReturnValue(true) // Filing is allowed
        mockAuthApi.getAuthInfo.mockResolvedValue({ contacts: [], corpType: {} })
        mockLegalApi.getParties.mockResolvedValue(mockParties)

        // init store
        await store.initOfficerStore(businessId)

        // assert
        expect(store.initializing).toBe(false)
        expect(store.activeBusiness.legalName).toBe('Test Inc.')
        expect(store.initialOfficers).toHaveLength(1)
        expect(store.initialOfficers[0]!.firstName).toBe('Initial')
        expect(store.officerTableState[0]!.state.officer.firstName).toBe('Initial')
        expect(mockModal.openBaseErrorModal).not.toHaveBeenCalled()
      })

      test('should show modal and return early if filing is not allowed', async () => {
        // mock that the filing is NOT allowed
        mockLegalApi.getBusiness.mockResolvedValue(mockBusiness)
        mockLegalApi.getPendingTask.mockResolvedValue(undefined)
        vi.mocked(validateBusinessAllowedFilings).mockReturnValue(false)

        // init store
        await store.initOfficerStore(businessId)

        // assert
        expect(mockModal.openBaseErrorModal).toHaveBeenCalled()
        expect(mockLegalApi.getParties).not.toHaveBeenCalled() // should return early
        expect(store.officerTableState).toHaveLength(0)
      })

      test('should show modal and return early if a pending task exists', async () => {
        // mock that a pending task exists
        mockLegalApi.getBusiness.mockResolvedValue(mockBusiness)
        mockLegalApi.getPendingTask.mockResolvedValue({ task: {} })
        vi.mocked(validateBusinessAllowedFilings).mockReturnValue(true)

        // init store
        await store.initOfficerStore(businessId)

        // assert
        expect(mockModal.openBaseErrorModal).toHaveBeenCalled()
        expect(mockLegalApi.getParties).not.toHaveBeenCalled() // should return early
      })

      test('should initialize with an empty state for a business with no officers', async () => {
        // mock no parties
        mockLegalApi.getBusiness.mockResolvedValue(mockBusiness)
        mockLegalApi.getPendingTask.mockResolvedValue(undefined)
        mockAuthApi.getAuthInfo.mockResolvedValue({ contacts: [], corpType: {} })
        mockLegalApi.getParties.mockResolvedValue([]) // No parties
        vi.mocked(validateBusinessAllowedFilings).mockReturnValue(true)

        // init store
        await store.initOfficerStore(businessId)

        // assert
        expect(store.initialOfficers).toHaveLength(0)
        expect(store.officerTableState).toHaveLength(0)
        expect(mockModal.openBaseErrorModal).not.toHaveBeenCalled()
      })
    })

    // Loading from a draft filing
    describe('when loading a draft filing', () => {
      const draftId = 'draft123'

      test('should load and populate state from a valid draft', async () => {
        const draftState = [{ state: { officer: { firstName: 'Draft Officer' } } }] as OfficerTableState[]
        const draftResponse = { isValid: true, data: { filing: { changeOfOfficers: draftState } } }

        // mocks
        mockLegalApi.getAndValidateDraftFiling.mockResolvedValue(draftResponse)
        mockLegalApi.getBusiness.mockResolvedValue(mockBusiness)
        mockLegalApi.getParties.mockResolvedValue(mockParties) // Still fetches initial parties
        mockAuthApi.getAuthInfo.mockResolvedValue({ contacts: [], corpType: {} })

        // init store
        await store.initOfficerStore(businessId, draftId)

        // assert
        expect(store.officerTableState[0]!.state.officer.firstName).toBe('Draft Officer')
        expect(store.officerDraftTableState[0]!.state.officer.firstName).toBe('Draft Officer')
        expect(store.initialOfficers[0]!.firstName).toBe('Initial') // Initial state is still loaded for history
      })

      test('should show an error modal and return early if the draft is invalid', async () => {
        // mock an invalid draft response
        mockLegalApi.getAndValidateDraftFiling.mockResolvedValue({ isValid: false, data: null })

        // init store
        await store.initOfficerStore(businessId, draftId)

        // assert
        expect(mockModal.openBaseErrorModal).toHaveBeenCalled()
        expect(mockLegalApi.getBusiness).not.toHaveBeenCalled() // Should return early after draft check
        expect(store.officerTableState).toHaveLength(0)
      })

      test('should show an error modal if fetching the draft fails', async () => {
        // mock api error
        const apiError = new Error('API Error')
        mockLegalApi.getAndValidateDraftFiling.mockRejectedValue(apiError)

        // init store
        await store.initOfficerStore(businessId, draftId)

        // assert
        expect(mockModal.openBaseErrorModal).toHaveBeenCalledWith(
          apiError,
          'modal.error.getDraftFiling',
          expect.any(Array)
        )
        expect(store.officerTableState).toHaveLength(0)
      })
    })

    // error handling
    test('should show a generic error modal if an API call fails', async () => {
      // mock api error
      const apiError = new Error('Network Failed')
      mockLegalApi.getBusiness.mockRejectedValue(apiError)

      // init store
      await store.initOfficerStore(businessId)

      // assert
      expect(mockModal.openBaseErrorModal).toHaveBeenCalledWith(apiError, expect.any(String), expect.any(Array))
      expect(store.initializing).toBe(false)
    })
  })

  describe('Actions and State Changes', () => {
    test('addNewOfficer adds a new officer to the table state', () => {
      // mock the address validation to succeed
      // @ts-expect-error - safeParse return type requires data object
      vi.mocked(getRequiredAddressSchema).mockReturnValue({ safeParse: () => ({ success: true }) })
      const newOfficer = { firstName: 'Test' } as Officer

      // add officer
      store.addNewOfficer(newOfficer)

      // assert
      expect(store.officerTableState).toHaveLength(1)
      expect(store.officerTableState[0]!.state.officer.firstName).toBe('Test')
      expect(store.officerTableState[0]!.state.actions).toContain('added')
    })

    test('addNewOfficer resets mailing address if validation fails', () => {
      // mock the address validation to FAIL
      // @ts-expect-error - safeParse return type requires data object
      vi.mocked(getRequiredAddressSchema).mockReturnValue({ safeParse: () => ({ success: false }) })
      const newOfficer = { firstName: 'Test', mailingAddress: { street: 'invalid' } } as Officer

      // add officer
      store.addNewOfficer(newOfficer)

      // assert
      expect(store.officerTableState).toHaveLength(1)
      // mailing address should be reset to empty string
      expect(store.officerTableState[0]!.state.officer.mailingAddress.street).toBe('')
    })

    test('removeOfficer marks an existing officer as removed', () => {
      const existingOfficer = { id: '1', firstName: 'Carol', roles: [{ roleType: 'CEO', cessationDate: null }] }
      const row = {
        index: 0,
        original: { state: { officer: existingOfficer, actions: [] }, history: [] }
      } as unknown as Row<OfficerTableState>
      store.officerTableState = [row.original]

      store.removeOfficer(row)

      expect(store.officerTableState[0]!.state.actions).toContain('removed')
      expect(store.officerTableState[0]!.state!.officer!.roles[0]!.cessationDate).toBeDefined()
    })

    test('removeOfficer deletes a newly added officer from the table', () => {
      const newOfficer = { firstName: 'Temp' }
      const row = {
        index: 0,
        original: { state: { officer: newOfficer, actions: ['added'] }, history: [] }
      } as unknown as Row<OfficerTableState>
      store.officerTableState = [row.original]

      store.removeOfficer(row)

      expect(store.officerTableState).toHaveLength(0)
    })

    test('undoOfficer reverts an officer to its previous state', () => {
      const originalState = { officer: { firstName: 'Original' }, actions: [] }
      const editedState = { officer: { firstName: 'Edited' }, actions: ['name'] }
      const row = {
        index: 0,
        original: { state: editedState, history: [originalState] }
      } as unknown as Row<OfficerTableState>
      store.officerTableState = [row.original]

      store.undoOfficer(row)

      expect(store.officerTableState[0]!.state.officer.firstName).toBe('Original')
      expect(store.officerTableState[0]!.history).toEqual([]) // history is cleared
    })

    test('editOfficer updates an officer and their actions', () => {
      // mock the address validation to succeed
      // @ts-expect-error - safeParse return type requires data object
      vi.mocked(getRequiredAddressSchema).mockReturnValue({ safeParse: () => ({ success: true }) })
      const originalOfficer = { id: '1', firstName: 'Carol' } as Officer
      const row = { index: 0, original: { state: { officer: originalOfficer, actions: [] }, history: [] } }
      store.officerTableState = [row.original]
      const newData = { ...originalOfficer, firstName: 'Caroline' }

      store.editOfficer(newData, row as unknown as Row<OfficerTableState>)

      expect(store.officerTableState[0]!.state.officer.firstName).toBe('Caroline')
      expect(store.officerTableState[0]!.state.actions).toContain('name')
      expect(store.officerTableState[0]!.history).toHaveLength(1)
    })

    test('initOfficerEdit sets the editState and expands the row', () => {
      const officer = { firstName: 'Carol' } as Officer
      const row = { index: 1, original: { state: { officer, actions: [] }, history: [] } }

      store.initOfficerEdit(row as unknown as Row<OfficerTableState>)

      expect(store.editState.firstName).toBe('Carol')
      expect(store.expanded).toEqual({ 1: true })
    })

    test('cancelOfficerEdit resets the editState and expanded state', () => {
      store.editState = { firstName: 'Editing' } as Officer
      store.expanded = { 0: true }

      store.cancelOfficerEdit()

      expect(store.editState).toEqual({})
      expect(store.expanded).toBeUndefined()
    })

    test('checkHasActiveForm should return true and call hook if adding an officer', async () => {
      store.addingOfficer = true

      const result = await store.checkHasActiveForm('submit')

      expect(result).toBe(true)
      expect(mockNuxtAppHook).toHaveBeenCalledOnce()
      expect(mockNuxtAppHook).toHaveBeenCalledWith('app:officer-form:incomplete', expect.any(Object))
    })

    test('checkHasActiveForm should return true and call hook if editing an officer', async () => {
      store.editState = { id: '123' } as Officer

      const result = await store.checkHasActiveForm('save')

      expect(result).toBe(true)
      expect(mockNuxtAppHook).toHaveBeenCalledOnce()
    })

    test('checkHasActiveForm should return false and not call hook if no form is active', async () => {
      store.addingOfficer = false
      store.editState = {} as Officer

      const result = await store.checkHasActiveForm('change')

      expect(result).toBe(false)
      expect(mockNuxtAppHook).not.toHaveBeenCalled()
    })
  })

  describe('$reset', () => {
    test('should reset all properties to their initial values', () => {
      store.addingOfficer = true
      store.initialOfficers = [{ firstName: 'Test' }] as unknown as Officer[]
      store.officerTableState = [{ state: {} }] as unknown as OfficerTableState[]
      store.activeBusiness = { legalName: 'Test Inc' } as unknown as BusinessData
      store.folioNumber = '123'

      store.$reset()

      expect(store.addingOfficer).toBe(false)
      expect(store.initialOfficers).toEqual([])
      expect(store.officerTableState).toEqual([])
      expect(store.activeBusiness).toEqual({})
      expect(store.folioNumber).toEqual('')
    })
  })

  describe('Computed Properties', () => {
    describe('hasChanges', () => {
      test('should be true if an officer has been edited', () => {
        store.officerTableState = [{ state: { actions: ['name'] } }] as unknown as OfficerTableState[]
        expect(store.hasChanges).toBe(true)
      })

      test('should be true if an officer has been added', () => {
        store.initialOfficers = []
        store.officerTableState = [{ state: { actions: ['added'] } }] as unknown as OfficerTableState[]
        expect(store.hasChanges).toBe(true)
      })

      test('should be true if table state differs from draft state', () => {
        const officer = { firstName: 'Carol' }
        store.officerDraftTableState = [{ state: { officer, actions: [] } }] as unknown as OfficerTableState[]
        store.officerTableState = [
          { state: { officer: { ...officer, firstName: 'Caroline' }, actions: ['name'] } }
        ] as unknown as OfficerTableState[]
        expect(store.hasChanges).toBe(true)
      })
    })

    describe('disableActions', () => {
      test('should be true if adding an officer', () => {
        store.addingOfficer = true
        expect(store.disableActions).toBe(true)
      })

      test('should be true if a row is expanded for editing', () => {
        store.expanded = { 0: true }
        expect(store.disableActions).toBe(true)
      })
    })
  })
})
