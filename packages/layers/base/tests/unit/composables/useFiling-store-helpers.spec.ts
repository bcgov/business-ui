import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import {
  DRAFT_FILING_ID,
  getDraftFilingMock,
  mockIsStaff,
  mockPostFiling,
  mockSaveOrUpdateDraftFiling,
  mockUpdateAllFees,
  resetFilingStoreMocks
} from '#test-mocks/filing-store'

// NB: the mockNuxtImport factory is hoisted - it cannot close over a static import, so the shared
// factories are pulled in dynamically
mockNuxtImport('useBusinessService', async () => (await import('#test-mocks/filing-store')).makeBusinessServiceMock)
mockNuxtImport('useConnectFeeStore', async () => (await import('#test-mocks/filing-store')).makeFeeStoreMock)
mockNuxtImport('useIsStaff', async () => (await import('#test-mocks/filing-store')).makeIsStaffMock)
mockNuxtImport('useFilingModals', async () => (await import('#test-mocks/filing-store')).makeFilingModalsMock)
mockNuxtImport('useConnectAuth', async () => (await import('#test-mocks/filing-store')).makeConnectAuthMock)
mockNuxtImport('useConnectAccountStore', async () => (await import('#test-mocks/filing-store')).makeAccountStoreMock)
mockNuxtImport('useBusinessStore', async original =>
  (await import('#test-mocks/filing-store')).makeBusinessStoreMock(original))

const identifier = 'BC1234567'

describe('useFiling filing store helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetFilingStoreMocks()
    setActivePinia(createPinia())
    window.history.replaceState({}, '', `/filing/${identifier}`)
  })

  describe('formatPaymentHeaderApi', () => {
    it('should return the staff payment fragment for staff', () => {
      const staffPayment = { ...getDefaultStaffPayment(), option: StaffPaymentOption.NO_FEE }

      const header = formatPaymentHeaderApi({ staffPayment }, true)

      expect(header).toEqual({ staffPaymentOption: StaffPaymentOption.NO_FEE, waiveFees: true })
    })

    it('should return the folio number for a client', () => {
      const header = formatPaymentHeaderApi({ folio: { folioNumber: 'FOLIO-99' } }, false)

      expect(header).toEqual({ folioNumber: 'FOLIO-99' })
    })

    it('should return an undefined folio number when the client has no folio section', () => {
      const header = formatPaymentHeaderApi({}, false)

      expect(header).toEqual({ folioNumber: undefined })
    })
  })

  describe('hydratePaymentState', () => {
    it('should hydrate the staff payment and re-apply the fees', () => {
      mockIsStaff.value = true
      const formState: { staffPayment?: StaffPaymentSchema } = {}

      useFiling().hydratePaymentState(
        { staffPaymentOption: StaffPaymentOption.FAS, routingSlipNumber: '123456789', priority: true },
        formState
      )

      expect(formState.staffPayment).toEqual({
        option: StaffPaymentOption.FAS,
        bcolAccountNumber: '',
        datNumber: '',
        folioNumber: '',
        isPriority: true,
        routingSlipNumber: '123456789'
      })
      expect(mockUpdateAllFees).toHaveBeenCalledWith(true, false)
    })

    it('should waive the fees when the resumed staff payment is no fee', () => {
      mockIsStaff.value = true
      const formState: { staffPayment?: StaffPaymentSchema } = {}

      useFiling().hydratePaymentState({ staffPaymentOption: StaffPaymentOption.NO_FEE }, formState)

      expect(mockUpdateAllFees).toHaveBeenCalledWith(false, true)
    })

    it('should not touch the fees when syncFees is false', () => {
      mockIsStaff.value = true
      const formState: { staffPayment?: StaffPaymentSchema } = {}

      useFiling().hydratePaymentState({ staffPaymentOption: StaffPaymentOption.FAS }, formState, { syncFees: false })

      expect(formState.staffPayment!.option).toBe(StaffPaymentOption.FAS)
      expect(mockUpdateAllFees).not.toHaveBeenCalled()
    })

    it('should hydrate the folio number for a client', () => {
      const formState = { folio: { folioNumber: '' } }

      useFiling().hydratePaymentState({ folioNumber: 'ABC-123' }, formState)

      expect(formState.folio.folioNumber).toBe('ABC-123')
      expect(mockUpdateAllFees).not.toHaveBeenCalled()
    })

    it('should honour an explicit isStaff over the account type', () => {
      const formState: { staffPayment?: StaffPaymentSchema, folio?: FolioSchema } = { folio: { folioNumber: '' } }

      useFiling().hydratePaymentState({ folioNumber: 'ABC-123' }, formState, { isStaff: true })

      expect(formState.staffPayment).toBeDefined()
      expect(formState.folio!.folioNumber).toBe('')
    })

    it('should leave the folio untouched when the draft header has none', () => {
      const formState = { folio: { folioNumber: 'KEEP-ME' } }

      useFiling().hydratePaymentState({}, formState)

      expect(formState.folio.folioNumber).toBe('KEEP-ME')
    })
  })

  describe('applyAuthorizationCertify', () => {
    it('should drop the certify name and keep the authorization on submission', () => {
      const header: Record<string, unknown> = { certifiedBy: 'Test User', authorizationReceived: true }

      applyAuthorizationCertify(header, true)

      expect(header).toEqual({ authorizationReceived: true })
    })

    it('should drop the certify name and the authorization when saving a draft', () => {
      const header: Record<string, unknown> = { certifiedBy: 'Test User', authorizationReceived: true, name: 'x' }

      applyAuthorizationCertify(header, false)

      expect(header).toEqual({ name: 'x' })
    })
  })

  describe('saveOrSubmitFiling', () => {
    const payload = { filing: { header: {}, business: {}, changeOfDirectors: { relationships: [] } } } as never

    beforeEach(() => {
      mockSaveOrUpdateDraftFiling.mockResolvedValue(
        getDraftFilingMock({ filingName: FilingType.CHANGE_OF_DIRECTORS, bodyKey: 'changeOfDirectors' })
      )
      mockPostFiling.mockResolvedValue(undefined)
    })

    it('should post a new filing when submitting without a draft', async () => {
      const result = await useFiling().saveOrSubmitFiling(identifier, payload, { isSubmission: true })

      expect(mockSaveOrUpdateDraftFiling).not.toHaveBeenCalled()
      expect(mockPostFiling).toHaveBeenCalledWith(identifier, payload)
      expect(result).toBeUndefined()
    })

    it('should save a draft and record its id in the url when not submitting', async () => {
      const result = await useFiling().saveOrSubmitFiling(identifier, payload, { isSubmission: false })

      expect(mockPostFiling).not.toHaveBeenCalled()
      expect(mockSaveOrUpdateDraftFiling).toHaveBeenCalledWith(identifier, payload, false, undefined)
      expect(result).toBeDefined()
      expect(window.location.search).toContain(`draft=${DRAFT_FILING_ID}`)
    })

    it('should put the existing draft when submitting with a draft id', async () => {
      await useFiling().saveOrSubmitFiling(identifier, payload, {
        isSubmission: true,
        draftId: DRAFT_FILING_ID
      })

      expect(mockPostFiling).not.toHaveBeenCalled()
      expect(mockSaveOrUpdateDraftFiling).toHaveBeenCalledWith(identifier, payload, true, DRAFT_FILING_ID)
    })
  })
})
