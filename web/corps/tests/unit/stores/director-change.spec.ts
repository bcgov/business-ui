import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import {
  DRAFT_FILING_ID,
  describeCommonFilingStoreBehaviour,
  getDraftFilingMock,
  mockInitFiling,
  mockPostFiling,
  mockSaveOrUpdateDraftFiling,
  resetFilingStoreMocks
} from '#test-mocks/filing-store'

mockNuxtImport('useBusinessService', async () => (await import('#test-mocks/filing-store')).makeBusinessServiceMock)
mockNuxtImport('useConnectFeeStore', async () => (await import('#test-mocks/filing-store')).makeFeeStoreMock)
mockNuxtImport('useIsStaff', async () => (await import('#test-mocks/filing-store')).makeIsStaffMock)
mockNuxtImport('useFilingModals', async () => (await import('#test-mocks/filing-store')).makeFilingModalsMock)
mockNuxtImport('useConnectAuth', async () => (await import('#test-mocks/filing-store')).makeConnectAuthMock)
mockNuxtImport('useConnectAccountStore', async () => (await import('#test-mocks/filing-store')).makeAccountStoreMock)
mockNuxtImport('useFiling', async original => (await import('#test-mocks/filing-store')).makeFilingMock(original))
mockNuxtImport('useBusinessStore', async original =>
  (await import('#test-mocks/filing-store')).makeBusinessStoreMock(original))

const filingType = FilingType.CHANGE_OF_DIRECTORS
const bodyKey = 'changeOfDirectors'
const identifier = 'BC1234567'

const buildDraft = (overrides: { header?: Record<string, unknown>, body?: Record<string, unknown> } = {}) =>
  getDraftFilingMock<CODDraftState>({
    filingName: filingType,
    bodyKey,
    body: { relationships: [] },
    ...overrides
  })

describeCommonFilingStoreBehaviour({
  name: 'useDirectorChangeStore',
  useStore: useDirectorChangeStore,
  filingType,
  bodyKey,
  buildDraft,
  initStore: async (store, draftId) => {
    await store.init(identifier, draftId)
    store.formState.authorization!.isAuthorized = true
  },
  payment: 'both',
  certify: 'authorization',
  expectsFeeResync: true
})

describe('useDirectorChangeStore', () => {
  let store: ReturnType<typeof useDirectorChangeStore>
  let tableDirectors: ReturnType<typeof useManageParties>['tableState']

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    resetFilingStoreMocks()
    window.history.replaceState({}, '', `/director-change/${identifier}`)

    tableDirectors = useManageParties().tableState
    tableDirectors.value = []

    store = useDirectorChangeStore()
    mockSaveOrUpdateDraftFiling.mockResolvedValue(buildDraft())
    mockPostFiling.mockResolvedValue(undefined)
  })

  it('initializes with the correct default state', () => {
    expect(store.initializing).toBe(false)
    expect(store.formState.authorization).toEqual({ isAuthorized: false })
    expect(store.formState.folio).toEqual({ folioNumber: '' })
    expect(store.formState.staffPayment).toBeUndefined()
    expect(store.formState.activeParty).toBeUndefined()
    expect(store.effectiveDate).toBe(getToday('America/Vancouver'))
  })

  describe('init(businessId, draftId)', () => {
    it('should fetch the active directors of the business', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: undefined })

      await store.init(identifier)

      expect(mockInitFiling).toHaveBeenCalledWith(
        identifier,
        FilingType.CHANGE_OF_DIRECTORS,
        undefined,
        undefined,
        { roleType: RoleType.DIRECTOR }
      )
    })

    it('should pass the route draft id through to initFiling', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: buildDraft() })

      await store.init(identifier, String(DRAFT_FILING_ID))

      expect(mockInitFiling).toHaveBeenCalledWith(
        identifier,
        FilingType.CHANGE_OF_DIRECTORS,
        undefined,
        String(DRAFT_FILING_ID),
        { roleType: RoleType.DIRECTOR }
      )
    })

    it('should load the directors into the table state', async () => {
      const parties = [{ new: { id: 'party-1' } }] as unknown as TableBusinessState<PartySchema>[]
      mockInitFiling.mockResolvedValue({ draftFiling: undefined, parties })

      await store.init(identifier)

      expect(store.directors).toEqual(parties)
      expect(store.initialDirectors).toEqual(parties)
      expect(store.initialDirectors).not.toBe(store.directors)
    })

    it('should set the initial form state for change detection', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: undefined })

      await store.init(identifier)

      expect(store.initialFormState).toEqual(store.formState)
      expect(store.initialFormState).not.toBe(store.formState)
      expect(store.initializing).toBe(false)
    })

    it('should leave the draft filing state empty when no draft filing is returned', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: undefined })

      await store.init(identifier)

      expect(store.draftFilingState).toEqual({})
    })
  })

  describe('submit(isSubmission)', () => {
    const getDraftPayload = () => mockSaveOrUpdateDraftFiling.mock.calls[0]![1]
    const getPostPayload = () => mockPostFiling.mock.calls[0]![1]

    /** Init a new (no draft) filing with the authorization confirmed. */
    async function initAndAuthorize() {
      mockInitFiling.mockResolvedValue({ draftFiling: undefined })
      await store.init(identifier)
      store.formState.authorization!.isAuthorized = true
    }

    it('should send an empty relationships array and never a directors key', async () => {
      await initAndAuthorize()

      await store.submit(true)

      const changeOfDirectors = getPostPayload().filing.changeOfDirectors
      expect(changeOfDirectors).toEqual({ relationships: [] })
      expect(changeOfDirectors.directors).toBeUndefined()
      expect(Object.keys(changeOfDirectors)).toEqual(['relationships'])
    })

    it('should send the effective date as an api date time at pacific midnight', async () => {
      await initAndAuthorize()

      await store.submit(true)

      const header = getPostPayload().filing.header
      expect(header.name).toBe(FilingType.CHANGE_OF_DIRECTORS)
      expect(header.effectiveDate).toBe(toApiDateTime(getToday('America/Vancouver')))
      expect(header.effectiveDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+00:00$/)
      expect(header.date).toBeTruthy()
    })

    it('should keep the effective date and the relationships body on a saved draft', async () => {
      await initAndAuthorize()

      await store.submit(false)

      expect(getDraftPayload().filing.header.effectiveDate).toBe(toApiDateTime(getToday('America/Vancouver')))
      expect(getDraftPayload().filing.changeOfDirectors).toEqual({ relationships: [] })
    })
  })

  describe('$reset', () => {
    it('restores schema defaults and clears the directors table', async () => {
      mockInitFiling.mockResolvedValue({
        draftFiling: buildDraft({ header: { folioNumber: 'ABC-123' } }),
        parties: [{ new: { id: 'party-1' } }] as unknown as TableBusinessState<PartySchema>[]
      })
      await store.init(identifier, String(DRAFT_FILING_ID))

      store.$reset()

      expect(store.formState.folio).toEqual({ folioNumber: '' })
      expect(store.formState.authorization).toEqual({ isAuthorized: false })
      expect(store.formState.activeParty).toBeUndefined()
      expect(store.directors).toEqual([])
      expect(store.initialDirectors).toEqual([])
      expect(store.draftFilingState).toEqual({})
      expect(store.effectiveDate).toBe(getToday('America/Vancouver'))
    })
  })
})
