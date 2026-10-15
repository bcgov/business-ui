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
mockNuxtImport('logBlockedSubmission', async () => (await import('#test-mocks/filing-store')).mockLogBlockedSubmission)

const filingType = FilingType.CONSENT_AMALGAMATION_OUT
const bodyKey = 'consentAmalgamationOut'
const identifier = 'BC1234567'

const buildDraft = (overrides: { header?: Record<string, unknown>, body?: Record<string, unknown> } = {}) =>
  getDraftFilingMock<CAODraftState>({
    filingName: filingType,
    bodyKey,
    body: { foreignJurisdiction: { country: 'CA', region: 'AB' } },
    ...overrides
  })

/** Set the page url - the store writes the draft id back to the 'draft' query param. */
function setUrl(query = '') {
  window.history.replaceState({}, '', `/consent-amalgamation-out/${identifier}${query}`)
}

describeCommonFilingStoreBehaviour({
  name: 'useConsentAmalgamationOutStore',
  useStore: useConsentAmalgamationOutStore,
  filingType,
  bodyKey,
  buildDraft,
  initStore: async (store, draftId) => {
    await store.init(identifier, draftId)
    store.formState.authorization!.isAuthorized = true
  },
  payment: 'both',
  certify: 'authorization',
  expectsFeeResync: true,
  submitBlocked: true
})

describe('useConsentAmalgamationOutStore', () => {
  let store: ReturnType<typeof useConsentAmalgamationOutStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    resetFilingStoreMocks()
    setUrl()

    store = useConsentAmalgamationOutStore()
    mockSaveOrUpdateDraftFiling.mockResolvedValue(buildDraft())
    mockPostFiling.mockResolvedValue(undefined)
  })

  it('initializes with the correct default state', () => {
    expect(store.initializing).toBe(false)
    expect(store.formState.authorization).toEqual({ isAuthorized: false })
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
        FilingType.CONSENT_AMALGAMATION_OUT,
        undefined,
        undefined
      )
    })

    it('should pass the route draft id through to initFiling', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: buildDraft() })

      await store.init(identifier, String(DRAFT_FILING_ID))

      expect(mockInitFiling).toHaveBeenCalledWith(
        identifier,
        FilingType.CONSENT_AMALGAMATION_OUT,
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

      it('should not hydrate the authorization from a draft', async () => {
        mockInitFiling.mockResolvedValue({
          draftFiling: buildDraft({ header: { authorizationReceived: true } })
        })

        await store.init(identifier, String(DRAFT_FILING_ID))

        expect(store.formState.authorization).toEqual({ isAuthorized: false })
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
    const getBlockedPayload = () => mockLogBlockedSubmission.mock.calls[0]![0]

    /** Init a new (no draft) filing. */
    async function initNewFiling() {
      mockInitFiling.mockResolvedValue({ draftFiling: undefined })
      await store.init(identifier)
    }

    it('should send the jurisdiction placeholder in the filing body', async () => {
      await initNewFiling()

      await store.submit(true)

      // FUTURE: verify the user selected jurisdiction
      expect(getBlockedPayload().filing.consentAmalgamationOut).toEqual({
        foreignJurisdiction: { country: '', region: null }
      })
    })

    it('should not send a details property - the filer creates no ledger comment', async () => {
      await initNewFiling()

      await store.submit(true)

      expect(getBlockedPayload().filing.consentAmalgamationOut).not.toHaveProperty('details')
    })

    it('should not send an effective date - the filer derives the consent expiry', async () => {
      await initNewFiling()

      await store.submit(true)

      const header = getBlockedPayload().filing.header
      expect(header.effectiveDate).toBeUndefined()
      expect(header.name).toBe(FilingType.CONSENT_AMALGAMATION_OUT)
      expect(header.date).toBeTruthy()
    })

    it('should send a false authorization when the checkbox is not confirmed', async () => {
      await initNewFiling()

      await store.submit(true)

      expect(getBlockedPayload().filing.header.authorizationReceived).toBe(false)
    })

    it('should send the optional document delivery email when one is entered', async () => {
      await initNewFiling()
      store.formState.documentDelivery!.completingPartyEmail = 'extra@example.com'

      await store.submit(true)

      expect(getBlockedPayload().filing.header.documentOptionalEmail).toBe('extra@example.com')
    })

    it('should omit the optional document delivery email when it is blank', async () => {
      await initNewFiling()

      await store.submit(true)

      expect(getBlockedPayload().filing.header.documentOptionalEmail).toBeUndefined()
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

      expect(store.formState.authorization).toEqual({ isAuthorized: false })
      expect(store.formState.documentDelivery).toEqual({ completingPartyEmail: '' })
      expect(store.formState.folio).toEqual({ folioNumber: '' })
      expect(store.draftFilingState).toEqual({})
    })
  })
})
