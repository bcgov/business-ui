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
const arYear = 2026

/** The CP cooperative association the annual report is filed for. */
const coopBusiness = {
  identifier,
  legalName: 'TEST COOPERATIVE ASSOCIATION',
  legalType: 'CP',
  foundingDate: '1998-08-26T07:00:00+00:00',
  arMinDate: '2026-01-01',
  arMaxDate: '2026-12-31',
  lastAnnualGeneralMeetingDate: '2025-04-15'
}

/** A coop annual report draft filing as returned by legal-api. */
const buildDraft = (overrides: { header?: Record<string, unknown>, body?: Record<string, unknown> } = {}) =>
  getDraftFilingMock<CoopARDraftState>({
    filingName: FilingType.ANNUAL_REPORT,
    bodyKey: 'annualReport',
    body: {
      annualReportDate: `${arYear}-12-31`,
      annualGeneralMeetingDate: null,
      didNotHoldAgm: false
    },
    business: { identifier, legalType: 'CP' },
    ...overrides,
    header: { ARFilingYear: arYear, ...overrides.header }
  })

describeCommonFilingStoreBehaviour({
  name: 'useAnnualReportStore',
  useStore: useAnnualReportStore,
  filingType: FilingType.ANNUAL_REPORT,
  bodyKey: 'annualReport',
  buildDraft,
  initStore: async (store, draftId) => {
    await store.init(identifier, draftId)
  },
  payment: 'both',
  certify: 'certified-by',
  expectsFeeResync: true
})

describe('useAnnualReportStore', () => {
  let store: ReturnType<typeof useAnnualReportStore>

  beforeEach(() => {
    vi.clearAllMocks()
    resetFilingStoreMocks()
    setMockBusiness(coopBusiness)
    setActivePinia(createPinia())
    window.history.replaceState({}, '', `/annual-report/${identifier}`)
    mockInitFiling.mockResolvedValue({
      draftFiling: undefined,
      parties: undefined,
      addresses: undefined
    })
    mockSaveOrUpdateDraftFiling.mockResolvedValue(buildDraft())
    mockPostFiling.mockResolvedValue(undefined)
    store = useAnnualReportStore()
    store.arYear = arYear
  })

  it('initializes with the non staff schema defaults', () => {
    expect(store.initializing).toBe(false)
    expect(store.formState.folio).toEqual({ folioNumber: '' })
    expect(store.formState.staffPayment).toBeUndefined()
  })

  describe('init(businessId, draftId)', () => {
    it('should load the directors and registered office for the bundled sections', async () => {
      await store.init(identifier)

      expect(mockInitFiling).toHaveBeenCalledTimes(1)
      expect(mockInitFiling).toHaveBeenCalledWith(
        identifier,
        FilingType.ANNUAL_REPORT,
        undefined,
        undefined,
        { roleType: RoleType.DIRECTOR },
        [OfficeType.REGISTERED]
      )
      expect(store.initializing).toBe(false)
    })

    it('should pass the draft id through to initFiling', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: buildDraft() })

      await store.init(identifier, String(DRAFT_FILING_ID))

      expect(mockInitFiling).toHaveBeenCalledWith(
        identifier,
        FilingType.ANNUAL_REPORT,
        undefined,
        String(DRAFT_FILING_ID),
        { roleType: RoleType.DIRECTOR },
        [OfficeType.REGISTERED]
      )
    })

    it('should keep the fetched directors and offices', async () => {
      const parties = [{ new: { id: '1' }, old: { id: '1' } }]
      const addresses = [{ new: { type: OfficeType.REGISTERED }, old: { type: OfficeType.REGISTERED } }]
      mockInitFiling.mockResolvedValue({ draftFiling: undefined, parties, addresses })

      await store.init(identifier)

      expect(store.directors).toEqual(parties)
      expect(store.offices).toEqual(addresses)
    })

    it('should hydrate the AR year from the draft header', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: buildDraft({ header: { ARFilingYear: 2024 } }) })

      await store.init(identifier, String(DRAFT_FILING_ID))

      expect(store.arYear).toBe(2024)
      expect(store.asOfDate).toBe('2024-12-31')
    })

    it('should set the initial form state for change detection', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: buildDraft({ header: { folioNumber: 'test-folio' } }) })

      await store.init(identifier, String(DRAFT_FILING_ID))

      expect(store.initialFormState).toEqual(store.formState)
      expect(store.initialFormState).not.toBe(store.formState)
    })

    it('should bail cleanly when initFiling returns no draft filing', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: undefined })

      await store.init(identifier, 'not-a-filing-id')

      expect(store.initializing).toBe(false)
      expect(store.formState.folio).toEqual({ folioNumber: '' })
      expect(mockUpdateAllFees).not.toHaveBeenCalled()
    })

    describe('staff', () => {
      beforeEach(() => {
        // the store builds its form state from the account type, so start it over as staff
        mockIsStaff.value = true
        setActivePinia(createPinia())
        store = useAnnualReportStore()
        store.arYear = arYear
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

    it('should build an annual report only body', async () => {
      await store.submit(true)

      const filing = getPostPayload().filing
      expect(filing.annualReport).toEqual({
        annualReportDate: `${arYear}-12-31`,
        annualGeneralMeetingDate: null,
        didNotHoldAgm: false
      })
      // FUTURE: update once these are implemented
      expect(filing).not.toHaveProperty('changeOfAddress')
      expect(filing).not.toHaveProperty('changeOfDirectors')
    })

    it('should never emit the dead nested directors and offices blocks', async () => {
      await store.submit(true)

      const annualReport = getPostPayload().filing.annualReport
      expect(annualReport).not.toHaveProperty('directors')
      expect(annualReport).not.toHaveProperty('offices')
      expect(Object.keys(annualReport)).toEqual([
        'annualReportDate',
        'annualGeneralMeetingDate',
        'didNotHoldAgm'
      ])
    })

    it('should build the header with the AR year, min/max dates and effective date', async () => {
      await store.submit(true)

      expect(getPostPayload().filing.header).toEqual(expect.objectContaining({
        name: FilingType.ANNUAL_REPORT,
        ARFilingYear: arYear,
        arMinDate: coopBusiness.arMinDate,
        arMaxDate: coopBusiness.arMaxDate,
        // pacific midnight of the as-of date (the dashboard todo + bundled COD depend on it)
        // the UTC offset is tzdata-dependent (BC permanent DST, 2026) so derive it rather than pin it
        effectiveDate: toApiDateTime(`${arYear}-12-31`)
      }))
    })

    it('should use the AR year as of date for a past year filing', async () => {
      store.arYear = 2024

      await store.submit(true)

      const filing = getPostPayload().filing
      expect(filing.annualReport.annualReportDate).toBe('2024-12-31')
      expect(filing.header.effectiveDate).toBe('2024-12-31T08:00:00+00:00')
    })

    // Future: the certify section (base FormCertify) supplies the name
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

      store.$reset()

      expect(store.formState.folio).toEqual({ folioNumber: '' })
      expect(store.initialFormState).toEqual(store.formState)
      expect(store.directors).toEqual([])
      expect(store.offices).toEqual([])
    })
  })
})
