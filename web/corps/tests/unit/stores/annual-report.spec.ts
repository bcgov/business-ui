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
  resetFilingStoreMocks,
  setMockBusiness
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

const filingType = FilingType.ANNUAL_REPORT
const bodyKey = 'annualReport'
const identifier = 'BC1234567'
// the annual report due date at Pacific midnight, as returned by legal-api
const nextAnnualReport = '2026-04-05T07:00:00+00:00'
const asOfDate = '2026-04-05'

const buildDraft = (overrides: { header?: Record<string, unknown>, body?: Record<string, unknown> } = {}) =>
  getDraftFilingMock<AnnualReportDraftState>({
    filingName: filingType,
    bodyKey,
    body: { annualReportDate: asOfDate, nextARDate: asOfDate },
    ...overrides
  })

/** Set the page url - the store reads the AR year from the 'year' query param. */
function setUrl(query = '') {
  window.history.replaceState({}, '', `/annual-report/${identifier}${query}`)
}

describeCommonFilingStoreBehaviour({
  name: 'useAnnualReportStore',
  useStore: useAnnualReportStore,
  filingType,
  bodyKey,
  buildDraft,
  initStore: async (store, draftId) => {
    setMockBusiness({ nextAnnualReport })
    await store.init(identifier, draftId)
    store.formState.authorization!.isAuthorized = true
  },
  payment: 'both',
  certify: 'authorization',
  expectsFeeResync: true
})

describe('useAnnualReportStore', () => {
  let store: ReturnType<typeof useAnnualReportStore>
  let tableDirectors: ReturnType<typeof useManageParties>['tableState']
  let tableOffices: ReturnType<typeof useManageOffices>['tableState']

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    resetFilingStoreMocks()
    setUrl()
    setMockBusiness({ nextAnnualReport })

    tableDirectors = useManageParties().tableState
    tableOffices = useManageOffices().tableState
    tableDirectors.value = []
    tableOffices.value = []

    store = useAnnualReportStore()
    mockSaveOrUpdateDraftFiling.mockResolvedValue(buildDraft())
    mockPostFiling.mockResolvedValue(undefined)
  })

  it('initializes with the correct default state', () => {
    expect(store.initializing).toBe(false)
    expect(store.arYear).toBeUndefined()
    expect(store.formState.authorization).toEqual({ isAuthorized: false })
    expect(store.formState.folio).toEqual({ folioNumber: '' })
    expect(store.formState.staffPayment).toBeUndefined()
  })

  describe('init(businessId, draftId)', () => {
    it('should fetch the directors and offices needed by the readonly display sections', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: undefined })

      await store.init(identifier)

      expect(mockInitFiling).toHaveBeenCalledWith(
        identifier,
        FilingType.ANNUAL_REPORT,
        undefined,
        undefined,
        { roleType: RoleType.DIRECTOR },
        [OfficeType.REGISTERED, OfficeType.RECORDS]
      )
    })

    it('should pass the route draft id through to initFiling', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: buildDraft() })

      await store.init(identifier, String(DRAFT_FILING_ID))

      expect(mockInitFiling).toHaveBeenCalledWith(
        identifier,
        FilingType.ANNUAL_REPORT,
        undefined,
        String(DRAFT_FILING_ID),
        { roleType: RoleType.DIRECTOR },
        [OfficeType.REGISTERED, OfficeType.RECORDS]
      )
    })

    it('should set the as of date to the date part of nextAnnualReport', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: undefined })

      await store.init(identifier)

      expect(store.asOfDate).toBe(asOfDate)
    })

    it('should load the directors and offices into the table state', async () => {
      const parties = [{ new: { id: 'party-1' } }] as unknown as TableBusinessState<PartySchema>[]
      const addresses = [{ new: { type: OfficeType.REGISTERED } }] as unknown as TableBusinessState<OfficesSchema>[]
      mockInitFiling.mockResolvedValue({ draftFiling: undefined, parties, addresses })

      await store.init(identifier)

      expect(store.directors).toEqual(parties)
      expect(store.offices).toEqual(addresses)
    })

    it('should set the initial form state for change detection', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: undefined })

      await store.init(identifier)

      expect(store.initialFormState).toEqual(store.formState)
      expect(store.initialFormState).not.toBe(store.formState)
    })

    describe('AR year resolution', () => {
      it('should prefer the year query param over the draft and the business', async () => {
        setUrl('?year=2027')
        mockInitFiling.mockResolvedValue({ draftFiling: buildDraft({ header: { ARFilingYear: 2025 } }) })

        await store.init(identifier, String(DRAFT_FILING_ID))

        expect(store.arYear).toBe(2027)
      })

      it('should use the draft ARFilingYear when there is no year query param', async () => {
        mockInitFiling.mockResolvedValue({ draftFiling: buildDraft({ header: { ARFilingYear: 2024 } }) })

        await store.init(identifier, String(DRAFT_FILING_ID))

        expect(store.arYear).toBe(2024)
      })

      it('should fall back to the year of the business nextAnnualReport', async () => {
        mockInitFiling.mockResolvedValue({ draftFiling: undefined })

        await store.init(identifier)

        expect(store.arYear).toBe(2026)
      })

      it('should be undefined when there is no year and no next annual report', async () => {
        setMockBusiness({ nextAnnualReport: '' })
        mockInitFiling.mockResolvedValue({ draftFiling: undefined })

        await store.init(identifier)

        expect(store.arYear).toBeUndefined()
      })
    })
  })

  describe('submit(isSubmission)', () => {
    const getDraftPayload = () => mockSaveOrUpdateDraftFiling.mock.calls[0]![1]
    const getPostPayload = () => mockPostFiling.mock.calls[0]![1]

    /** Init a new (no draft) filing with the authorization confirmed. */
    async function initAndAuthorize(query = '?year=2026') {
      setUrl(query)
      mockInitFiling.mockResolvedValue({ draftFiling: undefined })
      await store.init(identifier)
      store.formState.authorization!.isAuthorized = true
    }

    it('should build the annual report payload from the business next AR date only', async () => {
      await initAndAuthorize()

      await store.submit(true)

      expect(getPostPayload().filing.annualReport).toEqual({
        annualReportDate: asOfDate,
        nextARDate: asOfDate
      })
    })

    it('should never send the dead nested directors and offices blocks', async () => {
      await initAndAuthorize()

      await store.submit(true)

      const annualReport = getPostPayload().filing.annualReport
      expect(annualReport.directors).toBeUndefined()
      expect(annualReport.offices).toBeUndefined()
      expect(Object.keys(annualReport)).toEqual(['annualReportDate', 'nextARDate'])
    })

    it('should send the AR filing year and effective date in the header', async () => {
      await initAndAuthorize('?year=2026')

      await store.submit(true)

      const header = getPostPayload().filing.header
      expect(header.name).toBe(FilingType.ANNUAL_REPORT)
      expect(header.ARFilingYear).toBe(2026)
      expect(header.effectiveDate).toBe(nextAnnualReport)
      expect(header.authorizationReceived).toBe(true)
      expect(header.date).toBeTruthy()
    })

    it('should send the year given in the query param, not the business AR year', async () => {
      await initAndAuthorize('?year=2024')

      await store.submit(true)

      expect(getPostPayload().filing.header.ARFilingYear).toBe(2024)
    })

    it('should keep the AR filing year on a saved draft', async () => {
      await initAndAuthorize()

      await store.submit(false)

      expect(getDraftPayload().filing.header.ARFilingYear).toBe(2026)
    })
  })

  describe('$reset', () => {
    it('restores schema defaults and clears the tables', async () => {
      mockInitFiling.mockResolvedValue({
        draftFiling: buildDraft({ header: { folioNumber: 'ABC-123', ARFilingYear: 2024 } }),
        parties: [{ new: { id: 'party-1' } }] as unknown as TableBusinessState<PartySchema>[]
      })
      await store.init(identifier, String(DRAFT_FILING_ID))

      store.$reset()

      expect(store.formState.folio).toEqual({ folioNumber: '' })
      expect(store.formState.authorization).toEqual({ isAuthorized: false })
      expect(store.arYear).toBeUndefined()
      expect(store.directors).toEqual([])
      expect(store.offices).toEqual([])
    })
  })
})
