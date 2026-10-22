import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import {
  DEFAULT_FULL_NAME,
  DRAFT_FILING_ID,
  describeCommonFilingStoreBehaviour,
  getDraftFilingMock,
  mockInitFees,
  mockInitFiling,
  mockOpenFilingNotAvailableModal,
  mockPostFiling,
  mockSaveOrUpdateDraftFiling,
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

const mockGetFeatureFlag = vi.fn().mockResolvedValue('BC BEN CC ULC C CBEN CCC CUL CP')
mockNuxtImport('useConnectLaunchDarkly', () => () => ({
  getFeatureFlag: mockGetFeatureFlag
}))

const corpsIdentifier = 'BC1234567'
const coopIdentifier = 'CP1002605'

/** The CP cooperative association variant of the filing. */
const coopBusiness = {
  identifier: coopIdentifier,
  legalName: 'TEST COOPERATIVE ASSOCIATION',
  legalType: 'CP',
  foundingDate: '1998-08-26T07:00:00+00:00',
  lastDirectorChangeDate: '2025-06-01',
  lastAnnualReportDate: '2025-04-15'
}

const buildDraft = (overrides: { header?: Record<string, unknown>, body?: Record<string, unknown> } = {}) =>
  getDraftFilingMock<CODDraftState>({
    filingName: FilingType.CHANGE_OF_DIRECTORS,
    bodyKey: 'changeOfDirectors',
    body: { relationships: [] },
    ...overrides
  })

const buildCoopDraft = (overrides: { header?: Record<string, unknown>, body?: Record<string, unknown> } = {}) =>
  getDraftFilingMock<CODDraftState>({
    filingName: FilingType.CHANGE_OF_DIRECTORS,
    bodyKey: 'changeOfDirectors',
    body: { relationships: [] },
    business: { identifier: coopIdentifier, legalType: 'CP' },
    ...overrides
  })

// the same store serves both legal-type conventions (getDirectorsConfig) - prove each separately
describeCommonFilingStoreBehaviour({
  name: 'useDirectorsStore (corps)',
  useStore: useDirectorsStore,
  filingType: FilingType.CHANGE_OF_DIRECTORS,
  bodyKey: 'changeOfDirectors',
  buildDraft,
  initStore: async (store, draftId) => {
    await store.init(corpsIdentifier, draftId)
    store.formState.authorization!.isAuthorized = true
  },
  payment: 'both',
  certify: 'authorization',
  expectsFeeResync: true,
  submitBlocked: false
})

describeCommonFilingStoreBehaviour({
  name: 'useDirectorsStore (coops)',
  useStore: useDirectorsStore,
  filingType: FilingType.CHANGE_OF_DIRECTORS,
  bodyKey: 'changeOfDirectors',
  buildDraft: buildCoopDraft,
  initStore: async (store, draftId) => {
    setMockBusiness(coopBusiness)
    await store.init(coopIdentifier, draftId)
  },
  payment: 'both',
  certify: 'certified-by',
  expectsFeeResync: true,
  submitBlocked: false
})

describe('useDirectorsStore', () => {
  let store: ReturnType<typeof useDirectorsStore>
  let tableState: ReturnType<typeof useManageParties>['tableState']

  beforeEach(() => {
    vi.clearAllMocks()
    resetFilingStoreMocks()
    mockGetFeatureFlag.mockResolvedValue('BC BEN CC ULC C CBEN CCC CUL CP')
    setActivePinia(createPinia())
    window.history.replaceState({}, '', `/manage-directors/${corpsIdentifier}`)
    mockInitFiling.mockResolvedValue({ draftFiling: undefined, parties: undefined })
    mockSaveOrUpdateDraftFiling.mockResolvedValue(buildDraft())
    mockPostFiling.mockResolvedValue(undefined)
    store = useDirectorsStore()
    tableState = useManageParties().tableState
    tableState.value = []
  })

  it('initializes with the corps schema defaults until the business is known', () => {
    expect(store.initializing).toBe(false)
    expect(store.config.certify).toBe('authorization')
    expect(store.formState.authorization).toEqual({ isAuthorized: false })
    expect(store.formState.folio).toEqual({ folioNumber: '' })
    expect(store.formState.staffPayment).toBeUndefined()
    expect(store.formState.activeParty).toBeUndefined()
    expect(store.effectiveDate).toBe(getToday('America/Vancouver'))
  })

  describe('init(businessId, draftId)', () => {
    it('should fetch the business directors', async () => {
      await store.init(corpsIdentifier)

      expect(mockInitFiling).toHaveBeenCalledTimes(1)
      expect(mockInitFiling).toHaveBeenCalledWith(
        corpsIdentifier,
        FilingType.CHANGE_OF_DIRECTORS,
        undefined,
        undefined,
        { roleType: RoleType.DIRECTOR }
      )
      expect(store.initializing).toBe(false)
    })

    it('should pass the route draft id through to initFiling', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: buildDraft() })

      await store.init(corpsIdentifier, String(DRAFT_FILING_ID))

      expect(mockInitFiling).toHaveBeenCalledWith(
        corpsIdentifier,
        FilingType.CHANGE_OF_DIRECTORS,
        undefined,
        String(DRAFT_FILING_ID),
        { roleType: RoleType.DIRECTOR }
      )
    })

    it('should keep the fetched directors in the manage parties table state', async () => {
      const parties = [{ new: { id: '1' }, old: { id: '1' } }]
      mockInitFiling.mockResolvedValue({ draftFiling: undefined, parties })

      await store.init(corpsIdentifier)

      expect(store.directors).toEqual(parties)
      expect(tableState.value).toEqual(parties)
      expect(store.initialDirectors).toEqual(parties)
      expect(store.initialDirectors).not.toBe(store.directors)
    })

    it('should set the initial form state for change detection', async () => {
      await store.init(corpsIdentifier)

      expect(store.initialFormState).toEqual(store.formState)
      expect(store.initialFormState).not.toBe(store.formState)
    })

    it('should block a legal type missing from the supported entities flag', async () => {
      mockGetFeatureFlag.mockResolvedValue('BC BEN')
      setMockBusiness({ legalType: 'CP' })

      await store.init(corpsIdentifier)

      expect(mockGetFeatureFlag).toHaveBeenCalledWith('supported-change-of-directors-entities', '', 'await')
      expect(mockOpenFilingNotAvailableModal).toHaveBeenCalled()
      expect(store.initializing).toBe(false)
    })

    it('should restore the effective date from a draft header', async () => {
      mockInitFiling.mockResolvedValue({
        draftFiling: buildDraft({ header: { effectiveDate: '2026-03-15T08:00:00+00:00' } })
      })

      await store.init(corpsIdentifier)

      expect(store.effectiveDate).toBe('2026-03-15')
    })

    describe('legal type config', () => {
      it('should keep the corps convention for a base company', async () => {
        await store.init(corpsIdentifier)

        expect(store.config.certify).toBe('authorization')
        expect(store.config.paidFeeCode).toBe('BCCDR')
        expect(store.formState.authorization).toEqual({ isAuthorized: false })
        // the i18n fee code already matches - no swap
        expect(mockInitFees).not.toHaveBeenCalled()
      })

      it('should use a min count of three directors for CC and CCC companies', async () => {
        setMockBusiness({ legalType: 'CCC' })

        await store.init(corpsIdentifier)

        expect(store.config.warnings).toEqual({ minCount: 3 })
      })

      it('should switch to the coop convention and fee code for a CP business', async () => {
        setMockBusiness(coopBusiness)

        await store.init(coopIdentifier)

        expect(store.config.certify).toBe('certified-by')
        expect(store.config.paidFeeCode).toBe('OTCDR')
        expect(store.config.warnings).toEqual({ minCount: 3, bcResidency: true, canadianResidency: true })
        expect(store.formState.authorization).toBeUndefined()
        expect(store.formState.certify).toEqual({ isCertified: false })
        expect(mockInitFees).toHaveBeenCalledWith(
          [{ code: 'OTCDR', entityType: 'CP', label: expect.any(String) }],
          { label: expect.any(String) }
        )
      })
    })
  })

  describe('submit(isSubmission) - corps convention', () => {
    const getDraftPayload = () => mockSaveOrUpdateDraftFiling.mock.calls[0]![1]
    const getPostPayload = () => mockPostFiling.mock.calls[0]![1]

    /** Init a new (no draft) filing with the authorization confirmed. */
    async function initAndAuthorize() {
      await store.init(corpsIdentifier)
      store.formState.authorization!.isAuthorized = true
    }

    it('should send an empty relationships array and never a directors key', async () => {
      await initAndAuthorize()

      await store.submit(true)

      const changeOfDirectors = getPostPayload().filing.changeOfDirectors
      expect(changeOfDirectors).toEqual({ relationships: [] })
      expect(Object.keys(changeOfDirectors)).toEqual(['relationships'])
    })

    it('should send the effective date as an api date time at pacific midnight', async () => {
      await initAndAuthorize()

      await store.submit(true)

      const header = getPostPayload().filing.header
      expect(header.name).toBe(FilingType.CHANGE_OF_DIRECTORS)
      expect(header.effectiveDate).toBe(toApiDateTime(getToday('America/Vancouver')))
      expect(header.effectiveDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+00:00$/)
    })

    it('should keep the effective date and the relationships body on a saved draft', async () => {
      await initAndAuthorize()

      await store.submit(false)

      expect(getDraftPayload().filing.header.effectiveDate).toBe(toApiDateTime(getToday('America/Vancouver')))
      expect(getDraftPayload().filing.changeOfDirectors).toEqual({ relationships: [] })
    })
  })

  describe('submit(isSubmission) - coops convention', () => {
    const getDraftPayload = () => mockSaveOrUpdateDraftFiling.mock.calls[0]![1]
    const getPostPayload = () => mockPostFiling.mock.calls[0]![1]

    beforeEach(async () => {
      setMockBusiness(coopBusiness)
      mockSaveOrUpdateDraftFiling.mockResolvedValue(buildCoopDraft())
      await store.init(coopIdentifier)
    })

    it('should send the chosen effective date', async () => {
      store.effectiveDate = '2026-07-01'

      await store.submit(true)

      expect(getPostPayload().filing.header.effectiveDate).toBe('2026-07-01T07:00:00+00:00')
    })

    it('should certify a saved draft too and never send authorizationReceived', async () => {
      await store.submit(false)

      const header = getDraftPayload().filing.header
      expect(header.certifiedBy).toBe(DEFAULT_FULL_NAME)
      expect(header).not.toHaveProperty('authorizationReceived')
    })
  })

  describe('$reset', () => {
    it('restores the corps schema defaults and clears the directors table', async () => {
      setMockBusiness(coopBusiness)
      mockInitFiling.mockResolvedValue({
        draftFiling: buildCoopDraft({ header: { folioNumber: 'ABC-123' } }),
        parties: [{ new: { id: '1' }, old: { id: '1' } }]
      })
      await store.init(coopIdentifier, String(DRAFT_FILING_ID))
      store.effectiveDate = '2026-07-01'

      store.$reset()

      expect(store.config.certify).toBe('authorization')
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
