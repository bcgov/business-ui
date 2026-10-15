import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import {
  DEFAULT_FULL_NAME,
  DRAFT_FILING_ID,
  getDraftFilingMock,
  mockBusiness,
  mockInitFiling,
  mockLogBlockedSubmission,
  mockPostFiling,
  mockSaveOrUpdateDraftFiling,
  mockUpdateAllFees,
  resetFilingStoreMocks
} from '#test-mocks/filing-store'

const mockGetFiling = vi.fn()
mockNuxtImport('useBusinessService', async () => {
  const { makeBusinessServiceMock } = await import('#test-mocks/filing-store')
  return () => ({ ...makeBusinessServiceMock(), getFiling: mockGetFiling })
})
mockNuxtImport('useConnectFeeStore', async () => (await import('#test-mocks/filing-store')).makeFeeStoreMock)
mockNuxtImport('useConnectAuth', async () => (await import('#test-mocks/filing-store')).makeConnectAuthMock)
mockNuxtImport('useConnectAccountStore', async () => (await import('#test-mocks/filing-store')).makeAccountStoreMock)
mockNuxtImport('useFiling', async original => (await import('#test-mocks/filing-store')).makeFilingMock(original))
mockNuxtImport('logBlockedSubmission', async () => (await import('#test-mocks/filing-store')).mockLogBlockedSubmission)

const mockIsBaseCompany = vi.fn()
mockNuxtImport('useBusinessStore', async (original) => {
  const { makeBusinessStoreMock, mockBusiness } = await import('#test-mocks/filing-store')
  return () => ({
    ...makeBusinessStoreMock(original)(),
    get business() { return mockBusiness.value },
    get businessIdentifier() { return mockBusiness.value.identifier },
    isBaseCompany: mockIsBaseCompany
  })
})

const mockOpenFilingNotAllowedErrorModal = vi.fn()
mockNuxtImport('useFilingModals', async () => {
  const { makeFilingModalsMock } = await import('#test-mocks/filing-store')
  return () => ({
    ...makeFilingModalsMock(),
    openFilingNotAllowedErrorModal: mockOpenFilingNotAllowedErrorModal
  })
})

const identifier = 'BC1234567'
const consentFilingId = '112233'

const buildDraft = (overrides: { header?: Record<string, unknown>, body?: Record<string, unknown> } = {}) =>
  getDraftFilingMock<ContOutDraftState>({
    filingName: FilingType.CONTINUATION_OUT,
    bodyKey: 'continuationOut',
    ...overrides
  })

/** A completed consent to continue out filing as returned by legal-api. */
function getConsentMock(effectiveDate?: string) {
  return getDraftFilingMock({
    filingName: FilingType.CONSENT_CONTINUATION_OUT,
    bodyKey: 'consentContinuationOut',
    body: { foreignJurisdiction: { country: 'CA', region: 'AB' } },
    header: { status: FilingStatus.COMPLETED, effectiveDate },
    filingId: Number(consentFilingId)
  })
}

/** Set the page url - the store reads the consent filing id from the query params. */
function setUrl(query = '') {
  window.history.replaceState({}, '', `/continuation-out/${identifier}/${DRAFT_FILING_ID}${query}`)
}

describe('useContinuationOutStore', () => {
  let store: ReturnType<typeof useContinuationOutStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    resetFilingStoreMocks()
    setUrl()

    store = useContinuationOutStore()
    mockIsBaseCompany.mockReturnValue(true)
    mockInitFiling.mockResolvedValue({ draftFiling: buildDraft() })
    mockSaveOrUpdateDraftFiling.mockResolvedValue(buildDraft())
  })

  it('initializes with the correct default state', () => {
    expect(store.initializing).toBe(false)
    expect(store.formState.documentDelivery).toEqual({ completingPartyEmail: '' })
    expect(store.consentInfo).toEqual({})
    // staff only filing - no folio and no staff payment
    expect(store.formState).toEqual({ documentDelivery: { completingPartyEmail: '' } })
  })

  describe('init(businessId, draftId)', () => {
    it('should pass the route draft id through to initFiling', async () => {
      await store.init(identifier, String(DRAFT_FILING_ID))

      expect(mockInitFiling).toHaveBeenCalledTimes(1)
      expect(mockInitFiling).toHaveBeenCalledWith(
        identifier,
        FilingType.CONTINUATION_OUT,
        undefined,
        String(DRAFT_FILING_ID)
      )
      expect(store.initializing).toBe(false)
    })

    it('should waive all fees after init - the continuation out fee is always waived', async () => {
      await store.init(identifier, String(DRAFT_FILING_ID))

      expect(mockUpdateAllFees).toHaveBeenCalledTimes(1)
      expect(mockUpdateAllFees).toHaveBeenCalledWith(false, true)
    })

    it('should set the initial form state for change detection', async () => {
      mockInitFiling.mockResolvedValue({
        draftFiling: buildDraft({ header: { documentOptionalEmail: 'extra@example.com' } })
      })

      await store.init(identifier, String(DRAFT_FILING_ID))

      expect(store.initialFormState).toEqual(store.formState)
      expect(store.initialFormState).not.toBe(store.formState)
    })

    it('should bail cleanly when initFiling returns no draft filing', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: undefined })

      await store.init(identifier, 'not-a-filing-id')

      expect(store.initializing).toBe(false)
      expect(store.formState.documentDelivery).toEqual({ completingPartyEmail: '' })
      // the draft filing error modal is opened by initFiling itself
      expect(mockOpenFilingNotAllowedErrorModal).not.toHaveBeenCalled()
      expect(mockUpdateAllFees).not.toHaveBeenCalled()
    })

    it('should open the filing not allowed modal for non BC corp legal types', async () => {
      mockIsBaseCompany.mockReturnValue(false)

      await store.init(identifier, String(DRAFT_FILING_ID))

      expect(mockOpenFilingNotAllowedErrorModal).toHaveBeenCalledTimes(1)
      expect(store.initializing).toBe(false)
      expect(mockUpdateAllFees).not.toHaveBeenCalled()
    })

    describe('draft hydration', () => {
      it('should hydrate the optional document delivery email', async () => {
        mockInitFiling.mockResolvedValue({
          draftFiling: buildDraft({ header: { documentOptionalEmail: 'extra@example.com' } })
        })

        await store.init(identifier, String(DRAFT_FILING_ID))

        expect(store.formState.documentDelivery.completingPartyEmail).toBe('extra@example.com')
      })

      it('should remain at defaults when the draft has no document delivery email', async () => {
        await store.init(identifier, String(DRAFT_FILING_ID))

        expect(store.formState.documentDelivery).toEqual({ completingPartyEmail: '' })
      })
    })

    describe('consent to continue out', () => {
      it('should fetch the consent filing and stash its validity window', async () => {
        setUrl(`?consentFilingId=${consentFilingId}`)
        mockGetFiling.mockResolvedValue(getConsentMock('2026-01-15T08:00:00+00:00'))

        await store.init(identifier, String(DRAFT_FILING_ID))

        expect(mockGetFiling).toHaveBeenCalledWith(identifier, consentFilingId)
        expect(store.consentInfo).toEqual({
          consentFilingId,
          validFrom: '2026-01-15T08:00:00+00:00',
          // the consent is valid for 6 months from its effective date
          validTo: '2026-07-15T08:00:00+00:00'
        })
      })

      it('should clamp the 6 month window to the end of a shorter month', async () => {
        setUrl(`?consentFilingId=${consentFilingId}`)
        mockGetFiling.mockResolvedValue(getConsentMock('2026-08-31T07:00:00+00:00'))

        await store.init(identifier, String(DRAFT_FILING_ID))

        expect(store.consentInfo.validTo).toBe('2027-02-28T07:00:00+00:00')
      })

      it('should not fetch a consent when no consent filing id is in the url', async () => {
        await store.init(identifier, String(DRAFT_FILING_ID))

        expect(mockGetFiling).not.toHaveBeenCalled()
        expect(store.consentInfo).toEqual({})
      })

      it('should tolerate a consent filing that cannot be fetched', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        setUrl('?consentFilingId=not-a-filing-id')
        mockGetFiling.mockRejectedValue(new Error('404'))

        await store.init(identifier, String(DRAFT_FILING_ID))

        expect(store.consentInfo).toEqual({})
        expect(store.initializing).toBe(false)
        expect(warn).toHaveBeenCalled()
        warn.mockRestore()
      })

      it('should tolerate a consent filing with no effective date', async () => {
        setUrl(`?consentFilingId=${consentFilingId}`)
        mockGetFiling.mockResolvedValue(getConsentMock(undefined))

        await store.init(identifier, String(DRAFT_FILING_ID))

        expect(store.consentInfo).toEqual({})
      })
    })
  })

  describe('submit(isSubmission)', () => {
    const getDraftPayload = () => mockSaveOrUpdateDraftFiling.mock.calls[0]![1]
    const getBlockedPayload = () => mockLogBlockedSubmission.mock.calls[0]![0]

    beforeEach(async () => {
      await store.init(identifier, String(DRAFT_FILING_ID))
    })

    it('should log the blocked submission instead of filing it', async () => {
      await store.submit(true)

      expect(mockSaveOrUpdateDraftFiling).not.toHaveBeenCalled()
      expect(mockPostFiling).not.toHaveBeenCalled()
      expect(mockLogBlockedSubmission).toHaveBeenCalledExactlyOnceWith(expect.any(Object))
      const header = getBlockedPayload().filing.header
      expect(header.waiveFees).toBe(true)
      expect(header.authorizationReceived).toBe(false)
    })

    it('should waive the fees - the continuation out is always free', async () => {
      await store.submit(true)

      expect(getBlockedPayload().filing.header.waiveFees).toBe(true)
    })

    it('should send certifiedBy - the completing party name belongs on the record', async () => {
      await store.submit(true)

      expect(getBlockedPayload().filing.header.certifiedBy).toBe(DEFAULT_FULL_NAME)
    })

    it('should not send an effective date - the date lives in the filing body', async () => {
      await store.submit(true)

      const header = getBlockedPayload().filing.header
      expect(header.effectiveDate).toBeUndefined()
      expect(header.name).toBe(FilingType.CONTINUATION_OUT)
      expect(header.date).toBeTruthy()
    })

    it('should send the continuation out body placeholder', async () => {
      await store.submit(true)

      // FUTURE: continuationOutDate, foreignJurisdiction, legalName, documents and details
      expect(getBlockedPayload().filing.continuationOut).toEqual({})
    })

    it('should send a false authorization placeholder on submission', async () => {
      await store.submit(true)

      // FUTURE: the completing party confirmation drives this
      expect(getBlockedPayload().filing.header.authorizationReceived).toBe(false)
    })

    it('should omit the authorization when saving a draft', async () => {
      await store.submit(false)

      const header = getDraftPayload().filing.header
      expect(header.authorizationReceived).toBeUndefined()
      expect(header.waiveFees).toBe(true)
      expect(header.certifiedBy).toBe(DEFAULT_FULL_NAME)
    })

    it('should not send a folio number or staff payment - neither is collected', async () => {
      await store.submit(true)

      const header = getBlockedPayload().filing.header
      expect(header.folioNumber).toBeUndefined()
      expect(header.staffPaymentOption).toBeUndefined()
    })

    it('should send the optional document delivery email when one is entered', async () => {
      store.formState.documentDelivery.completingPartyEmail = 'extra@example.com'

      await store.submit(true)

      expect(getBlockedPayload().filing.header.documentOptionalEmail).toBe('extra@example.com')
    })

    it('should omit the optional document delivery email when it is blank', async () => {
      await store.submit(true)

      expect(getBlockedPayload().filing.header.documentOptionalEmail).toBeUndefined()
    })

    it('should round trip a hydrated document delivery email', async () => {
      setActivePinia(createPinia())
      store = useContinuationOutStore()
      mockInitFiling.mockResolvedValue({
        draftFiling: buildDraft({ header: { documentOptionalEmail: 'resumed@example.com' } })
      })
      await store.init(identifier, String(DRAFT_FILING_ID))

      await store.submit(false)

      expect(getDraftPayload().filing.header.documentOptionalEmail).toBe('resumed@example.com')
    })

    it('should build the business block from the business store', async () => {
      await store.submit(true)

      expect(getBlockedPayload().filing.business).toEqual({
        identifier,
        legalName: mockBusiness.value.legalName,
        legalType: mockBusiness.value.legalType,
        foundingDate: mockBusiness.value.foundingDate
      })
    })

    it('should update the pre-created draft and never post a new filing when saving', async () => {
      await store.submit(false)

      expect(mockPostFiling).not.toHaveBeenCalled()
      expect(mockSaveOrUpdateDraftFiling).toHaveBeenCalledWith(
        identifier,
        expect.any(Object),
        false,
        DRAFT_FILING_ID
      )
    })

    it('should never record the draft id in the url - it is a route param here', async () => {
      await store.submit(false)

      expect(window.location.search).not.toContain('draft=')
    })
  })

  describe('$reset', () => {
    it('restores the schema defaults and clears the consent info', async () => {
      setUrl(`?consentFilingId=${consentFilingId}`)
      mockGetFiling.mockResolvedValue(getConsentMock('2026-01-15T08:00:00+00:00'))
      mockInitFiling.mockResolvedValue({
        draftFiling: buildDraft({ header: { documentOptionalEmail: 'extra@example.com' } })
      })
      await store.init(identifier, String(DRAFT_FILING_ID))

      store.$reset()

      expect(store.formState.documentDelivery).toEqual({ completingPartyEmail: '' })
      expect(store.consentInfo).toEqual({})
      expect(store.draftFilingState).toEqual({})
    })
  })
})
