import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import {
  DRAFT_FILING_ID,
  describeCommonFilingStoreBehaviour,
  getDraftFilingMock,
  mockInitFiling,
  mockLogBlockedSubmission,
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
mockNuxtImport('logBlockedSubmission', async () => (await import('#test-mocks/filing-store')).mockLogBlockedSubmission)

const filingType = FilingType.ANNUAL_REPORT
const bodyKey = 'annualReport'
const identifier = 'BC1234567'
const asOfDate = '2026-04-05'
const arYear = Number(asOfDate.slice(0, 4))
// the annual report due date at Pacific midnight, as returned by legal-api
// the UTC offset is tzdata-dependent (BC permanent DST, 2026) so derive it rather than pin it
const nextAnnualReport = toApiDateTime(asOfDate)!

const buildDraft = (overrides: { header?: Record<string, unknown>, body?: Record<string, unknown> } = {}) =>
  getDraftFilingMock<AnnualReportDraftState>({
    filingName: filingType,
    bodyKey,
    body: { annualReportDate: asOfDate, nextARDate: asOfDate },
    ...overrides
  })

/** Set the page url - the store deliberately ignores any 'year' or 'draft' query param. */
function setUrl(query = '') {
  window.history.replaceState({}, '', `/annual-report/${identifier}${query}`)
}

describeCommonFilingStoreBehaviour({
  name: 'useAnnualReportStore',
  useStore: useAnnualReportStore,
  filingType,
  bodyKey,
  buildDraft,
  initStore: async (store) => {
    setMockBusiness({ nextAnnualReport })
    await store.init(identifier)
    store.formState.authorization!.isAuthorized = true
  },
  payment: 'both',
  certify: 'authorization',
  submitBlocked: true,
  // a corps AR is file and pay only - it is never saved as or resumed from a draft
  supportsDrafts: false
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

  describe('init(businessId)', () => {
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

    it('should never request a draft, even with one in the url', async () => {
      setUrl(`?draft=${DRAFT_FILING_ID}`)
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
      it('should ignore the year query param - a corps AR is strictly the next one due', async () => {
        setUrl('?year=2027')
        mockInitFiling.mockResolvedValue({ draftFiling: undefined })

        await store.init(identifier)

        expect(store.arYear).toBe(arYear)
      })

      it('should take the year of the business nextAnnualReport', async () => {
        mockInitFiling.mockResolvedValue({ draftFiling: undefined })

        await store.init(identifier)

        expect(store.arYear).toBe(arYear)
      })

      it('should be undefined when there is no next annual report', async () => {
        setMockBusiness({ nextAnnualReport: '' })
        mockInitFiling.mockResolvedValue({ draftFiling: undefined })

        await store.init(identifier)

        expect(store.arYear).toBeUndefined()
      })
    })
  })

  describe('submit(isSubmission)', () => {
    const getBlockedPayload = () => mockLogBlockedSubmission.mock.calls[0]![0]

    /** Init the filing with the authorization confirmed. */
    async function initAndAuthorize(query = '') {
      setUrl(query)
      mockInitFiling.mockResolvedValue({ draftFiling: undefined })
      await store.init(identifier)
      store.formState.authorization!.isAuthorized = true
    }

    it('should build the annual report payload from the business next AR date only', async () => {
      await initAndAuthorize()

      await store.submit(true)

      expect(getBlockedPayload().filing.annualReport).toEqual({
        annualReportDate: asOfDate,
        nextARDate: asOfDate
      })
    })

    it('should never send the dead nested directors and offices blocks', async () => {
      await initAndAuthorize()

      await store.submit(true)

      const annualReport = getBlockedPayload().filing.annualReport
      expect(annualReport.directors).toBeUndefined()
      expect(annualReport.offices).toBeUndefined()
      expect(Object.keys(annualReport)).toEqual(['annualReportDate', 'nextARDate'])
    })

    it('should send the AR filing year and effective date in the header', async () => {
      await initAndAuthorize()

      await store.submit(true)

      const header = getBlockedPayload().filing.header
      expect(header.name).toBe(FilingType.ANNUAL_REPORT)
      expect(header.ARFilingYear).toBe(arYear)
      expect(header.effectiveDate).toBe(nextAnnualReport)
      expect(header.authorizationReceived).toBe(true)
      expect(header.date).toBeTruthy()
    })

    it('should send the business AR year, never a conflicting query param year', async () => {
      await initAndAuthorize('?year=2024')

      await store.submit(true)

      expect(getBlockedPayload().filing.header.ARFilingYear).toBe(arYear)
    })

    it('should keep the filing year and the AR date in step', async () => {
      await initAndAuthorize()

      await store.submit(true)

      const filing = getBlockedPayload().filing
      expect(filing.header.ARFilingYear).toBe(Number(filing.annualReport.annualReportDate.slice(0, 4)))
    })

    it('should do nothing when saving - there is no draft to write', async () => {
      await initAndAuthorize()

      await store.submit(false)

      expect(mockSaveOrUpdateDraftFiling).not.toHaveBeenCalled()
      expect(mockPostFiling).not.toHaveBeenCalled()
      expect(mockLogBlockedSubmission).not.toHaveBeenCalled()
    })
  })

  describe('$reset', () => {
    it('restores schema defaults and clears the tables', async () => {
      mockInitFiling.mockResolvedValue({
        draftFiling: undefined,
        parties: [{ new: { id: 'party-1' } }] as unknown as TableBusinessState<PartySchema>[]
      })
      await store.init(identifier)
      store.formState.folio!.folioNumber = 'ABC-123'

      store.$reset()

      expect(store.formState.folio).toEqual({ folioNumber: '' })
      expect(store.formState.authorization).toEqual({ isAuthorized: false })
      expect(store.arYear).toBeUndefined()
      expect(store.directors).toEqual([])
      expect(store.offices).toEqual([])
    })
  })
})
