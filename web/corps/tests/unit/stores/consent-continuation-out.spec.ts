import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import {
  DEFAULT_FULL_NAME,
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

const filingType = FilingType.CONSENT_CONTINUATION_OUT
const bodyKey = 'consentContinuationOut'
const identifier = 'BC1234567'

const buildDraft = (overrides: { header?: Record<string, unknown>, body?: Record<string, unknown> } = {}) =>
  getDraftFilingMock<CCODraftState>({
    filingName: filingType,
    bodyKey,
    body: { foreignJurisdiction: { country: 'CA', region: 'AB' } },
    ...overrides
  })

/** Set the page url - the store writes the draft id back to the 'draft' query param. */
function setUrl(query = '') {
  window.history.replaceState({}, '', `/consent-continuation-out/${identifier}${query}`)
}

// NB: no `certify` - the consent to continue out follows neither convention (certifiedBy is kept
// *and* an authorization is sent), so its certify cases are hand written below
describeCommonFilingStoreBehaviour({
  name: 'useConsentContinuationOutStore',
  useStore: useConsentContinuationOutStore,
  filingType,
  bodyKey,
  buildDraft,
  initStore: async (store, draftId) => {
    await store.init(identifier, draftId)
  },
  payment: 'both',
  expectsFeeResync: true
})

describe('useConsentContinuationOutStore', () => {
  let store: ReturnType<typeof useConsentContinuationOutStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    resetFilingStoreMocks()
    setUrl()

    store = useConsentContinuationOutStore()
    mockSaveOrUpdateDraftFiling.mockResolvedValue(buildDraft())
    mockPostFiling.mockResolvedValue(undefined)
  })

  it('initializes with the correct default state', () => {
    expect(store.initializing).toBe(false)
    expect(store.formState.documentDelivery).toEqual({ completingPartyEmail: '' })
    expect(store.formState.folio).toEqual({ folioNumber: '' })
    expect(store.formState.staffPayment).toBeUndefined()
  })

  describe('init(businessId, draftId)', () => {
    it('should init the filing with no parties, offices or share classes', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: undefined })

      await store.init(identifier)

      expect(mockInitFiling).toHaveBeenCalledWith(
        identifier,
        FilingType.CONSENT_CONTINUATION_OUT,
        undefined,
        undefined
      )
    })

    it('should pass the route draft id through to initFiling', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: buildDraft() })

      await store.init(identifier, String(DRAFT_FILING_ID))

      expect(mockInitFiling).toHaveBeenCalledWith(
        identifier,
        FilingType.CONSENT_CONTINUATION_OUT,
        undefined,
        String(DRAFT_FILING_ID)
      )
    })

    it('should set the initial form state for change detection', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: undefined })

      await store.init(identifier)

      expect(store.initialFormState).toEqual(store.formState)
      expect(store.initialFormState).not.toBe(store.formState)
    })

    describe('draft hydration', () => {
      it('should hydrate the optional document delivery email', async () => {
        mockInitFiling.mockResolvedValue({
          draftFiling: buildDraft({ header: { documentOptionalEmail: 'extra@example.com' } })
        })

        await store.init(identifier, String(DRAFT_FILING_ID))

        expect(store.formState.documentDelivery?.completingPartyEmail).toBe('extra@example.com')
      })

      it('should remain at defaults when no draft filing is returned', async () => {
        mockInitFiling.mockResolvedValue({ draftFiling: undefined })

        await store.init(identifier)

        expect(store.formState.documentDelivery).toEqual({ completingPartyEmail: '' })
        expect(store.formState.folio).toEqual({ folioNumber: '' })
        expect(store.initializing).toBe(false)
      })
    })
  })

  describe('submit(isSubmission)', () => {
    const getDraftPayload = () => mockSaveOrUpdateDraftFiling.mock.calls[0]![1]
    const getPostPayload = () => mockPostFiling.mock.calls[0]![1]

    /** Init a new (no draft) filing. */
    async function initNewFiling() {
      mockInitFiling.mockResolvedValue({ draftFiling: undefined })
      await store.init(identifier)
    }

    it('should send the jurisdiction placeholder in the filing body', async () => {
      await initNewFiling()

      await store.submit(true)

      // FUTURE: verify the user selected jurisdiction
      expect(getPostPayload().filing.consentContinuationOut).toEqual({
        foreignJurisdiction: { country: '', region: null }
      })
    })

    it('should send certifiedBy - the completing party name appears on the letter of consent', async () => {
      await initNewFiling()

      await store.submit(true)

      expect(getPostPayload().filing.header.certifiedBy).toBe(DEFAULT_FULL_NAME)
    })

    it('should not send an effective date - the filer derives the consent expiry', async () => {
      await initNewFiling()

      await store.submit(true)

      const header = getPostPayload().filing.header
      expect(header.effectiveDate).toBeUndefined()
      expect(header.name).toBe(FilingType.CONSENT_CONTINUATION_OUT)
      expect(header.date).toBeTruthy()
    })

    it('should send the authorization on submission', async () => {
      await initNewFiling()

      await store.submit(true)

      expect(getPostPayload().filing.header.authorizationReceived).toBe(true)
    })

    it('should omit the authorization but keep certifiedBy when saving a draft', async () => {
      await initNewFiling()

      await store.submit(false)

      const header = getDraftPayload().filing.header
      expect(header.authorizationReceived).toBeUndefined()
      expect(header.certifiedBy).toBe(DEFAULT_FULL_NAME)
    })

    it('should send the optional document delivery email when one is entered', async () => {
      await initNewFiling()
      store.formState.documentDelivery!.completingPartyEmail = 'extra@example.com'

      await store.submit(true)

      expect(getPostPayload().filing.header.documentOptionalEmail).toBe('extra@example.com')
    })

    it('should omit the optional document delivery email when it is blank', async () => {
      await initNewFiling()

      await store.submit(true)

      expect(getPostPayload().filing.header.documentOptionalEmail).toBeUndefined()
    })
  })

  describe('$reset', () => {
    it('restores the schema defaults', async () => {
      mockInitFiling.mockResolvedValue({
        draftFiling: buildDraft({
          header: { folioNumber: 'ABC-123', documentOptionalEmail: 'extra@example.com' }
        })
      })
      await store.init(identifier, String(DRAFT_FILING_ID))

      store.$reset()

      expect(store.formState.documentDelivery).toEqual({ completingPartyEmail: '' })
      expect(store.formState.folio).toEqual({ folioNumber: '' })
      expect(store.draftFilingState).toEqual({})
    })
  })
})
