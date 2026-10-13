import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import {
  DEFAULT_FULL_NAME,
  DRAFT_FILING_ID,
  describeCommonFilingStoreBehaviour,
  getDraftFilingMock,
  mockInitFiling,
  mockIsStaff,
  mockPostFiling,
  mockSaveOrUpdateDraftFiling,
  mockUpdateAllFees,
  resetFilingStoreMocks,
  setMockBusiness
} from '#test-mocks/filing-store'

// NB: only initFiling stuff is mocked here
mockNuxtImport('useBusinessService', async () => (await import('#test-mocks/filing-store')).makeBusinessServiceMock)
mockNuxtImport('useConnectFeeStore', async () => (await import('#test-mocks/filing-store')).makeFeeStoreMock)
mockNuxtImport('useIsStaff', async () => (await import('#test-mocks/filing-store')).makeIsStaffMock)
mockNuxtImport('useFilingModals', async () => (await import('#test-mocks/filing-store')).makeFilingModalsMock)
mockNuxtImport('useConnectAuth', async () => (await import('#test-mocks/filing-store')).makeConnectAuthMock)
mockNuxtImport('useConnectAccountStore', async () => (await import('#test-mocks/filing-store')).makeAccountStoreMock)
mockNuxtImport('useFiling', async original => (await import('#test-mocks/filing-store')).makeFilingMock(original))
mockNuxtImport('useBusinessStore', async original =>
  (await import('#test-mocks/filing-store')).makeBusinessStoreMock(original))

const identifier = 'CP1002605'

/** The CP cooperative association the director change is filed for. */
const coopBusiness = {
  identifier,
  legalName: 'TEST COOPERATIVE ASSOCIATION',
  legalType: 'CP',
  foundingDate: '1998-08-26T07:00:00+00:00',
  lastDirectorChangeDate: '2025-06-01',
  lastAnnualReportDate: '2025-04-15'
}

/** A coop change of directors draft filing as returned by legal-api. */
const buildDraft = (overrides: { header?: Record<string, unknown>, body?: Record<string, unknown> } = {}) =>
  getDraftFilingMock<CODDraftState>({
    filingName: FilingType.CHANGE_OF_DIRECTORS,
    bodyKey: 'changeOfDirectors',
    body: { relationships: [] },
    business: { identifier, legalType: 'CP' },
    ...overrides
  })

describeCommonFilingStoreBehaviour({
  name: 'useDirectorChangeStore',
  useStore: useDirectorChangeStore,
  filingType: FilingType.CHANGE_OF_DIRECTORS,
  bodyKey: 'changeOfDirectors',
  buildDraft,
  initStore: async (store, draftId) => {
    await store.init(identifier, draftId)
  },
  payment: 'both',
  certify: 'certified-by',
  expectsFeeResync: true
})

describe('useDirectorChangeStore', () => {
  let store: ReturnType<typeof useDirectorChangeStore>
  let tableState: ReturnType<typeof useManageParties>['tableState']

  beforeEach(() => {
    vi.clearAllMocks()
    resetFilingStoreMocks()
    setMockBusiness(coopBusiness)
    setActivePinia(createPinia())
    window.history.replaceState({}, '', `/director-change/${identifier}`)
    mockInitFiling.mockResolvedValue({ draftFiling: undefined, parties: undefined })
    mockSaveOrUpdateDraftFiling.mockResolvedValue(buildDraft())
    mockPostFiling.mockResolvedValue(undefined)
    store = useDirectorChangeStore()
    tableState = useManageParties().tableState
    tableState.value = []
  })

  it('initializes with the non staff schema defaults', () => {
    expect(store.initializing).toBe(false)
    expect(store.formState.folio).toEqual({ folioNumber: '' })
    expect(store.formState.staffPayment).toBeUndefined()
    expect(store.formState.activeParty).toBeUndefined()
    expect(store.effectiveDate).toBe(getToday('America/Vancouver'))
  })

  describe('init(businessId, draftId)', () => {
    it('should fetch the business directors', async () => {
      await store.init(identifier)

      expect(mockInitFiling).toHaveBeenCalledTimes(1)
      expect(mockInitFiling).toHaveBeenCalledWith(
        identifier,
        FilingType.CHANGE_OF_DIRECTORS,
        undefined,
        undefined,
        { roleType: RoleType.DIRECTOR }
      )
      expect(store.initializing).toBe(false)
    })

    it('should pass the draft id through to initFiling', async () => {
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

    it('should keep the fetched directors in the manage parties table state', async () => {
      const parties = [{ new: { id: '1' }, old: { id: '1' } }]
      mockInitFiling.mockResolvedValue({ draftFiling: undefined, parties })

      await store.init(identifier)

      expect(store.directors).toEqual(parties)
      expect(tableState.value).toEqual(parties)
    })

    it('should set the initial state for change detection', async () => {
      const parties = [{ new: { id: '1' }, old: { id: '1' } }]
      mockInitFiling.mockResolvedValue({
        draftFiling: buildDraft({ header: { folioNumber: 'test-folio' } }),
        parties
      })

      await store.init(identifier, String(DRAFT_FILING_ID))

      expect(store.initialFormState).toEqual(store.formState)
      expect(store.initialFormState).not.toBe(store.formState)
      expect(store.initialDirectors).toEqual(store.directors)
      expect(store.initialDirectors).not.toBe(store.directors)
    })

    it('should bail cleanly when initFiling returns no draft filing', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: undefined })

      await store.init(identifier, 'not-a-filing-id')

      expect(store.initializing).toBe(false)
      expect(store.directors).toEqual([])
      expect(store.formState.folio).toEqual({ folioNumber: '' })
      expect(mockUpdateAllFees).not.toHaveBeenCalled()
    })

    describe('staff', () => {
      beforeEach(() => {
        // the store builds its form state from the account type, so start it over as staff
        mockIsStaff.value = true
        setActivePinia(createPinia())
        store = useDirectorChangeStore()
      })

      it('should initialize with a staff payment instead of a folio', () => {
        expect(store.isStaff).toBe(true)
        expect(store.formState.folio).toBeUndefined()
        expect(store.formState.staffPayment).toEqual(getDefaultStaffPayment())
      })
    })
  })

  describe('submit(isSubmission)', () => {
    const getPayload = () => mockSaveOrUpdateDraftFiling.mock.calls[0]![1]
    const getPostPayload = () => mockPostFiling.mock.calls[0]![1]

    beforeEach(async () => {
      await store.init(identifier)
    })

    it('should build a change of directors only body', async () => {
      await store.submit(true)

      const filing = getPostPayload().filing
      // FUTURE: verify changed director rows mapped into relationships
      expect(filing.changeOfDirectors).toEqual({ relationships: [] })
      expect(filing).not.toHaveProperty('annualReport')
      expect(filing).not.toHaveProperty('changeOfAddress')
    })

    it('should never emit the legacy directors array', async () => {
      store.directors = [{ new: { id: '1', actions: [ActionType.REMOVED] } }] as never

      await store.submit(true)

      const changeOfDirectors = getPostPayload().filing.changeOfDirectors
      expect(changeOfDirectors).not.toHaveProperty('directors')
      expect(Object.keys(changeOfDirectors)).toEqual(['relationships'])
    })

    it('should send the effective date as an api date time', async () => {
      await store.submit(true)

      const header = getPostPayload().filing.header
      expect(header.effectiveDate).toBe(toApiDateTime(getToday('America/Vancouver')))
      expect(header.effectiveDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+00:00$/)
    })

    it('should send the chosen effective date', async () => {
      store.effectiveDate = '2026-07-01'

      await store.submit(true)

      expect(getPostPayload().filing.header.effectiveDate).toBe('2026-07-01T07:00:00+00:00')
    })

    // FUTURE: the certify section (base FormCertify) supplies the name
    it('should certify a saved draft too and never send authorizationReceived', async () => {
      await store.submit(false)

      const header = getPayload().filing.header
      expect(header.certifiedBy).toBe(DEFAULT_FULL_NAME)
      expect(header).not.toHaveProperty('authorizationReceived')
    })
  })

  describe('$reset', () => {
    it('restores the schema defaults', async () => {
      mockInitFiling.mockResolvedValue({
        draftFiling: buildDraft({ header: { folioNumber: 'test-folio' } }),
        parties: [{ new: { id: '1' }, old: { id: '1' } }]
      })
      await store.init(identifier, String(DRAFT_FILING_ID))
      store.effectiveDate = '2026-07-01'

      store.$reset()

      expect(store.formState.folio).toEqual({ folioNumber: '' })
      expect(store.formState.activeParty).toBeUndefined()
      expect(store.initialFormState).toEqual(store.formState)
      expect(store.directors).toEqual([])
      expect(store.initialDirectors).toEqual([])
      expect(store.effectiveDate).toBe(getToday('America/Vancouver'))
    })
  })
})
