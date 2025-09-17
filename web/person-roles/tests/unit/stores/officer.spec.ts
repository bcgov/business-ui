import { describe, test, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import type { Row } from '@tanstack/vue-table'
import { businessBC1234567 } from '~~/tests/mocks'

mockNuxtImport('useRoute', () => {
  return () => ({
    params: {
      businessId: 'BC1234567'
    }
  })
})

const mockLegalApi = {
  getBusiness: vi.fn(),
  getParties: vi.fn(),
  getPendingTask: vi.fn(),
  getAndValidateDraftFiling: vi.fn(),
  getAuthInfo: vi.fn(),
  getTasks: vi.fn()
}
mockNuxtImport('useBusinessApi', () => () => mockLegalApi)

const mockErrorModalOpen = vi.fn()
const mockBaseModalOpen = vi.fn()
mockNuxtImport('useModal', () => {
  return () => ({
    errorModal: {
      open: mockErrorModalOpen
    },
    baseModal: {
      open: mockBaseModalOpen
    }
  })
})
mockNuxtImport('useRuntimeConfig', () => () => (
  {
    public: {
      businessDashboardUrl: 'http://business-dashboard-url/'
    }
  }
))

mockNuxtImport('useConnectAccountStore', () => () => ({ currentAccount: { id: 123 } }))
mockNuxtImport('useConnectTombstone', () => () => ({
  tombstone: {
    value: { loading: false, title: {}, subtitles: [], sideDetails: [] }
  },
  $reset: vi.fn()
}))

vi.mock('@sbc-connect/nuxt-business-base/app/utils/is-filing-allowed', () => ({
  isFilingAllowed: vi.fn().mockReturnValue(false)
}))

vi.mock('@sbc-connect/nuxt-forms/app/utils/zod-schemas/addresses', () => ({
  getRequiredAddressSchema: vi.fn()
}))

const mockNuxtAppHook = vi.fn()
mockNuxtImport('useNuxtApp', () => () => ({
  callHook: mockNuxtAppHook,
  $i18n: { t: (key: string) => key }
}))

const mockGetFeatureFlag = vi.fn()
mockNuxtImport('useConnectLaunchDarkly', () => () => ({
  getFeatureFlag: mockGetFeatureFlag
}))

describe('useOfficerStore', () => {
  let store: ReturnType<typeof useOfficerStore>

  beforeEach(async () => {
    vi.resetAllMocks()
    const pinia = createPinia()
    setActivePinia(pinia)
    store = useOfficerStore()
    store.$reset()
    mockGetFeatureFlag.mockResolvedValue('CC')
  })

  test('initializes with the correct default state', () => {
    expect(store.initializing).toBe(false)
    expect(store.addingOfficer).toBe(false)
    expect(store.officerTableState).toEqual([])
    expect(store.initialOfficers).toEqual([])
  })

  describe('initOfficerStore', () => {
    const businessId = 'BC123'
    const mockBusiness = { identifier: businessId, legalName: 'Test Inc.', legalType: 'CC' } as BusinessData
    const mockParties = [{ officer: { id: 1, firstName: 'Initial' }, roles: [] }] as unknown as OrgPerson[]

    // Starting a new filing (no draftId)
    describe('when starting a new filing', () => {
      test('should fully initialize state if filing is allowed and no pending tasks exist', async () => {
        // mock API calls and permissions
        mockLegalApi.getBusiness.mockResolvedValue(mockBusiness)
        mockLegalApi.getPendingTask.mockResolvedValue(undefined) // No pending tasks
        vi.mocked(isFilingAllowed).mockReturnValue(true) // Filing is allowed
        mockLegalApi.getAuthInfo.mockResolvedValue({ contacts: [], corpType: {} })
        mockLegalApi.getParties.mockResolvedValue(mockParties)

        // init store
        await store.initOfficerStore(businessId)

        // assert
        expect(store.initializing).toBe(false)
        expect(store.activeBusiness.legalName).toBe('Test Inc.')
        expect(store.initialOfficers).toHaveLength(1)
        expect(store.initialOfficers[0]!.firstName).toBe('Initial')
        expect(store.officerTableState[0]!.new.firstName).toBe('Initial')
        expect(mockErrorModalOpen).not.toHaveBeenCalled()
      })

      test('should show modal and return early if filing is not allowed', async () => {
        // mock that the filing is NOT allowed
        mockLegalApi.getBusiness.mockResolvedValue(mockBusiness)
        mockLegalApi.getPendingTask.mockResolvedValue(undefined)
        vi.mocked(isFilingAllowed).mockReturnValue(false)

        // init store
        await store.initOfficerStore(businessId)

        // assert
        expect(mockErrorModalOpen).toHaveBeenCalled()
        expect(mockLegalApi.getParties).not.toHaveBeenCalled() // should return early
        expect(store.officerTableState).toHaveLength(0)
      })

      test('should show modal and return early if a pending task exists', async () => {
        // mock that a pending task exists
        mockLegalApi.getBusiness.mockResolvedValue(mockBusiness)
        mockLegalApi.getPendingTask.mockResolvedValue({ task: {} })
        vi.mocked(isFilingAllowed).mockReturnValue(true)

        // init store
        await store.initOfficerStore(businessId)

        // assert
        expect(mockErrorModalOpen).toHaveBeenCalled()
        expect(mockLegalApi.getParties).not.toHaveBeenCalled() // should return early
      })

      test('should initialize with an empty state for a business with no officers', async () => {
        // mock no parties
        mockLegalApi.getBusiness.mockResolvedValue(businessBC1234567.business)
        mockLegalApi.getPendingTask.mockResolvedValue(undefined)
        mockLegalApi.getAuthInfo.mockResolvedValue({ contacts: [], corpType: {} })
        mockLegalApi.getParties.mockResolvedValue([]) // No parties
        vi.mocked(isFilingAllowed).mockReturnValue(true)

        // init store
        await store.initOfficerStore(businessBC1234567.business.identifier)

        // assert
        expect(store.initialOfficers).toHaveLength(0)
        expect(store.officerTableState).toHaveLength(0)
        expect(mockErrorModalOpen).not.toHaveBeenCalled()
      })
    })

    // Loading from a draft filing
    describe('when loading a draft filing', () => {
      const draftId = 'draft123'

      test('should load and populate state from a valid draft', async () => {
        const draftResponse = {
          isValid: true,
          data: {
            filing: {
              changeOfOfficers: [{ new: { firstName: 'Draft Officer' } }]
            }
          }
        }

        // mocks
        mockLegalApi.getAndValidateDraftFiling.mockResolvedValue(draftResponse)
        mockLegalApi.getBusiness.mockResolvedValue(mockBusiness)
        mockLegalApi.getParties.mockResolvedValue(mockParties) // Still fetches initial parties
        mockLegalApi.getAuthInfo.mockResolvedValue({ contacts: [], corpType: {} })

        // init store
        await store.initOfficerStore(businessId, draftId)

        // assert
        expect(store.officerTableState[0]!.new.firstName).toBe('Draft Officer')
        expect(store.filingDraftState.filing.changeOfOfficers[0]!.new.firstName).toBe('Draft Officer')
        expect(store.initialOfficers[0]!.firstName).toBe('Initial') // Initial state is still loaded for history
      })

      test('should show an error modal and return early if the draft is invalid', async () => {
        // mock an invalid draft response
        mockLegalApi.getAndValidateDraftFiling.mockResolvedValue({ isValid: false, data: null })

        // init store
        await store.initOfficerStore(businessId, draftId)

        // assert
        expect(mockErrorModalOpen).toHaveBeenCalledWith(expect.objectContaining({
          error: expect.any(Error),
          i18nPrefix: 'modal.error.getDraftFiling',
          buttons: expect.any(Array)
        }))
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
        expect(mockErrorModalOpen).toHaveBeenCalledWith(expect.objectContaining({
          error: expect.any(Error),
          i18nPrefix: 'modal.error.getDraftFiling',
          buttons: expect.any(Array)
        }))
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
      expect(mockErrorModalOpen).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(Error),
        i18nPrefix: 'modal.error.initOfficerStore',
        buttons: expect.any(Array)
      }))
      expect(store.initializing).toBe(false)
    })

    test('should show "Page not available" modal if feature flag doesnt match business type', async () => {
      // mock API calls and permissions
      mockGetFeatureFlag.mockResolvedValue('') // add empty response for FF
      mockLegalApi.getBusiness.mockResolvedValue(mockBusiness)
      mockLegalApi.getPendingTask.mockResolvedValue(undefined) // No pending tasks

      // init store
      await store.initOfficerStore(businessId)

      // assert - should open modal
      expect(mockBaseModalOpen).toHaveBeenCalledOnce()
      const callArgs = mockBaseModalOpen.mock.calls[0]![0]

      expect(callArgs.title).toBe('modal.filingNotAvailable.title')
      expect(callArgs.description).toBe('modal.filingNotAvailable.description')
      expect(callArgs.dismissible).toBe(false)

      expect(callArgs.buttons).toHaveLength(1)
      const button = callArgs.buttons[0]
      expect(button.label).toBe('label.goBack')
      expect(button.external).toBe(true)
      expect(button.to).toBe('http://business-dashboard-url/BC1234567?accountid=123')
    })
  })

  describe('Actions and State Changes', () => {
    describe('addNewOfficer', () => {
      test('adds a new officer to the table state', () => {
        // mock the address validation to succeed
        // @ts-expect-error - safeParse return type requires data object
        vi.mocked(getRequiredAddressSchema).mockReturnValue({ safeParse: () => ({ success: true }) })
        const newOfficer = { firstName: 'Test' } as Officer

        // add officer
        store.addNewOfficer(newOfficer)

        // assert
        expect(store.officerTableState).toHaveLength(1)
        expect(store.officerTableState[0]!.new.firstName).toBe('Test')
      })

      test('resets mailing address if validation fails', () => {
        // mock the address validation to FAIL
        // @ts-expect-error - safeParse return type requires data object
        vi.mocked(getRequiredAddressSchema).mockReturnValue({ safeParse: () => ({ success: false }) })
        const newOfficer = { firstName: 'Test', mailingAddress: { street: 'invalid' } } as Officer

        // add officer
        store.addNewOfficer(newOfficer)

        // assert
        expect(store.officerTableState).toHaveLength(1)
        // mailing address should be reset to empty string
        expect(store.officerTableState[0]!.new.mailingAddress.street).toBe('')
      })
    })

    describe('removeOfficer', () => {
      test('marks an existing officer as removed', () => {
        const existingOfficer = { id: '1', firstName: 'Carol', roles: [{ roleType: 'CEO', cessationDate: null }] }
        const row = {
          index: 0,
          original: { new: existingOfficer, old: existingOfficer }
        } as unknown as Row<OfficerTableState>
        store.officerTableState = [row.original]

        store.removeOfficer(row)

        expect(store.officerTableState[0]!.new!.roles[0]!.cessationDate).toBeDefined()
      })

      test('deletes a newly added officer from the table', () => {
        const newOfficer = { firstName: 'Temp' }
        const row = {
          index: 0,
          original: { state: { officer: newOfficer, actions: ['added'] }, history: [] }
        } as unknown as Row<OfficerTableState>
        store.officerTableState = [row.original]

        store.removeOfficer(row)

        expect(store.officerTableState).toHaveLength(0)
      })
    })

    describe('undoOfficer', () => {
      test('reverts an officer to its previous state', () => {
        const originalState = { firstName: 'Original' }
        const editedState = { firstName: 'Edited' }
        const row = {
          index: 0,
          original: { new: editedState, old: originalState }
        } as unknown as Row<OfficerTableState>
        store.officerTableState = [row.original]

        store.undoOfficer(row)

        expect(store.officerTableState[0]!.new.firstName).toBe('Original')
      })
    })

    describe('editOfficer', () => {
      test('updates an officer and their actions', () => {
        // mock the address validation to succeed
        // @ts-expect-error - safeParse return type requires data object
        vi.mocked(getRequiredAddressSchema).mockReturnValue({ safeParse: () => ({ success: true }) })
        const originalOfficer = { id: '1', firstName: 'Carol' } as Officer
        const row = { index: 0, original: { new: originalOfficer } }
        store.officerTableState = [row.original]
        const newData = { ...originalOfficer, firstName: 'Caroline' }

        store.editOfficer(newData, row as unknown as Row<OfficerTableState>)

        expect(store.officerTableState[0]!.new.firstName).toBe('Caroline')
      })
    })

    describe('initOfficerEdit', () => {
      test('sets the editState and expands the row', () => {
        const officer = { firstName: 'Carol' } as Officer
        const row = { index: 1, original: { new: officer } }

        store.initOfficerEdit(row as unknown as Row<OfficerTableState>)

        expect(store.editState.firstName).toBe('Carol')
        expect(store.expanded).toEqual({ 1: true })
      })
    })

    describe('cancelOfficerEdit', () => {
      test('resets the editState and expanded state', () => {
        store.editState = { firstName: 'Editing' } as Officer
        store.expanded = { 0: true }

        store.cancelOfficerEdit()

        expect(store.editState).toEqual({})
        expect(store.expanded).toBeUndefined()
      })
    })

    describe('checkHasActiveForm', () => {
      test('should return true and call hook if adding an officer', async () => {
        store.addingOfficer = true

        const result = await store.checkHasActiveForm('submit')

        expect(result).toBe(true)
        expect(mockNuxtAppHook).toHaveBeenCalledOnce()
        expect(mockNuxtAppHook).toHaveBeenCalledWith('app:officer-form:incomplete', expect.any(Object))
      })

      test('should return true and call hook if editing an officer', async () => {
        store.editState = { id: '123' } as Officer

        const result = await store.checkHasActiveForm('save')

        expect(result).toBe(true)
        expect(mockNuxtAppHook).toHaveBeenCalledOnce()
      })

      test('should return false and not call hook if no form is active', async () => {
        store.addingOfficer = false
        store.editState = {} as Officer

        const result = await store.checkHasActiveForm('change')

        expect(result).toBe(false)
        expect(mockNuxtAppHook).not.toHaveBeenCalled()
      })
    })

    describe('checkHasChanges', () => {
      const initialOfficer = { id: '1', firstName: 'Initial' } as Officer
      const draftOfficer = { id: '1', firstName: 'Draft Version' } as Officer
      const editedOfficer = { id: '1', firstName: 'Edited Version' } as Officer

      const createTableState = (officer: Officer): OfficerTableState => ({
        new: officer
      })

      beforeEach(() => {
        store.initialOfficers = [{ ...initialOfficer }]
        store.officerTableState = [createTableState({ ...initialOfficer })]
        store.filingDraftState = {
          filing: {
            changeOfOfficers: [createTableState(draftOfficer)],
            header: {
              folioNumber: ''
            }
          },
          errors: []
        } as unknown as OfficersDraftFiling
      })

      describe('when "when" is "submit"', () => {
        test('should return false if table state is identical to initial state', () => {
          expect(store.checkHasChanges('submit')).toBe(false)
        })

        test('should return true if table state is different from initial state', () => {
          store.officerTableState = [createTableState(editedOfficer)]
          expect(store.checkHasChanges('submit')).toBe(true)
        })

        test('should return true even if table state matches draft state (but differs from initial)', () => {
          store.filingDraftState.filing.changeOfOfficers = [createTableState(draftOfficer)]
          store.officerTableState = [createTableState(draftOfficer)]
          // The check should ignore the draft and compare to initial, so this is a change.
          expect(store.checkHasChanges('submit')).toBe(true)
        })

        test('should return true when an officer is added', () => {
          const newOfficer = { id: '2', firstName: 'New' } as Officer
          store.officerTableState.push(createTableState(newOfficer))
          expect(store.checkHasChanges('submit')).toBe(true)
        })
      })

      describe('when "when" is "save"', () => {
        test('should return false if table state is identical to initial state', () => {
          expect(store.checkHasChanges('save')).toBe(false)
        })

        test('should return true if no draft exists and table state differs from initial', () => {
          store.officerTableState = [createTableState(editedOfficer)]
          expect(store.checkHasChanges('save')).toBe(true)
        })

        describe('and a draft exists', () => {
          beforeEach(() => {
            store.filingDraftState.filing.changeOfOfficers = [createTableState(draftOfficer)]
          })

          test('should return false if table state is identical to draft state', () => {
            store.officerTableState = [createTableState(draftOfficer)]
            expect(store.checkHasChanges('save')).toBe(false)
          })

          test('should return true if table state is different from draft state', () => {
            store.officerTableState = [createTableState(editedOfficer)]
            expect(store.checkHasChanges('save')).toBe(true)
          })

          test('should return false if table state is reverted back to initial state', () => {
            store.officerTableState = [createTableState({ ...initialOfficer })]
            expect(store.checkHasChanges('save')).toBe(false)
          })
        })
      })
    })
  })

  describe('$reset', () => {
    test('should reset all properties to their initial values', () => {
      store.addingOfficer = true
      store.initialOfficers = [{ firstName: 'Test' }] as unknown as Officer[]
      store.officerTableState = [{ state: {} }] as unknown as OfficerTableState[]
      store.activeBusiness = { legalName: 'Test Inc' } as unknown as BusinessData
      store.folio.number = '123'

      store.$reset()

      expect(store.addingOfficer).toBe(false)
      expect(store.initialOfficers).toEqual([])
      expect(store.officerTableState).toEqual([])
      expect(store.activeBusiness).toEqual({})
      expect(store.folio.number).toEqual('')
    })
  })

  describe('Computed Properties', () => {
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
