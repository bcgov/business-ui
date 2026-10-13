import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import {
  DRAFT_FILING_ID,
  mockBusiness,
  mockAccountType,
  mockFullName,
  mockInitFiling,
  mockIsStaff,
  mockPostFiling,
  mockSaveOrUpdateDraftFiling,
  mockUpdateAllFees,
  resetFilingStoreMocks
} from './handles'

/** The slice of a filing store the shared cases drive. */
export interface CommonFilingStore {
  formState: { folio?: FolioSchema, staffPayment?: StaffPaymentSchema }
  submit: (isSubmission: boolean) => Promise<unknown>
}

export interface CommonFilingStoreOptions<S extends CommonFilingStore> {
  /** The store name used in the describe title. */
  name: string
  useStore: () => S
  filingType: FilingType
  /** The filing body key, eg `changeOfDirectors`. */
  bodyKey: string
  buildDraft: (overrides?: { header?: Record<string, unknown>, body?: Record<string, unknown> }) => unknown
  /**
   * Inits the store and leaves it submittable.
   * NB: do NOT stub `mockInitFiling` - the shared cases set the draft the init resolves with.
   */
  initStore: (store: S, draftId?: string) => Promise<void>
  /** Which payment sections the filing form carries. */
  payment: 'both' | 'staff' | 'folio'
  /**
   * `authorization` is the corps convention, `certified-by` the coops one. Omit it for a filing
   * that follows neither (i.e. the consent to continue out keeps certifiedBy *and* an authorization) -
   * the certify cases are then left to the filing's own spec.
   */
  certify?: 'authorization' | 'certified-by'
  /** Whether resuming a staff payment draft re-applies the fees. */
  expectsFeeResync?: boolean
}

/**
 * The filing store behaviour that is identical across filings - payload envelope, draft save vs
 * submit, payment section and certify conventions.
 */
export function describeCommonFilingStoreBehaviour<S extends CommonFilingStore>(
  options: CommonFilingStoreOptions<S>
) {
  const { bodyKey, buildDraft, certify, filingType, initStore, name, payment, useStore } = options

  describe(`${name} — shared filing store behaviour`, () => {
    let store: S
    const postPayload = () => mockPostFiling.mock.calls[0]![1]
    const draftPayload = () => mockSaveOrUpdateDraftFiling.mock.calls[0]![1]

    beforeEach(() => {
      vi.clearAllMocks()
      resetFilingStoreMocks()
      setActivePinia(createPinia())
      window.history.replaceState({}, '', `/${filingType}/${mockBusiness.value.identifier}`)
      mockInitFiling.mockResolvedValue({ draftFiling: undefined, parties: undefined })
      mockSaveOrUpdateDraftFiling.mockResolvedValue(buildDraft())
      mockPostFiling.mockResolvedValue(undefined)
      store = useStore()
    })

    it('should post a new filing when submitting without an existing draft', async () => {
      await initStore(store)

      await store.submit(true)

      expect(mockSaveOrUpdateDraftFiling).not.toHaveBeenCalled()
      expect(mockPostFiling).toHaveBeenCalledWith(mockBusiness.value.identifier, expect.any(Object))
      expect(postPayload().filing.header.name).toBe(filingType)
      expect(postPayload().filing).toHaveProperty(bodyKey)
    })

    it('should update the existing draft when a draft id is set', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: buildDraft() })
      await initStore(store, String(DRAFT_FILING_ID))

      await store.submit(true)

      expect(mockPostFiling).not.toHaveBeenCalled()
      expect(mockSaveOrUpdateDraftFiling).toHaveBeenCalledWith(
        mockBusiness.value.identifier,
        expect.any(Object),
        true,
        DRAFT_FILING_ID
      )
    })

    it('should save a draft and record its id in the url when not submitting', async () => {
      await initStore(store)

      await store.submit(false)

      expect(mockPostFiling).not.toHaveBeenCalled()
      expect(mockSaveOrUpdateDraftFiling).toHaveBeenCalledWith(
        mockBusiness.value.identifier,
        expect.any(Object),
        false,
        undefined
      )
      expect(window.location.search).toContain(`draft=${DRAFT_FILING_ID}`)
    })

    it('should build the business block from the business store', async () => {
      await initStore(store)

      await store.submit(true)

      expect(postPayload().filing.business).toEqual({
        identifier: mockBusiness.value.identifier,
        legalName: mockBusiness.value.legalName,
        legalType: mockBusiness.value.legalType,
        foundingDate: mockBusiness.value.foundingDate
      })
    })

    if (certify === 'authorization') {
      it('should send the authorization and not a certifiedBy name on submission', async () => {
        await initStore(store)

        await store.submit(true)

        const header = postPayload().filing.header
        expect(header.authorizationReceived).toBe(true)
        expect(header.certifiedBy).toBeUndefined()
      })

      it('should omit the authorization when saving a draft', async () => {
        await initStore(store)

        await store.submit(false)

        const header = draftPayload().filing.header
        expect(header.authorizationReceived).toBeUndefined()
        expect(header.certifiedBy).toBeUndefined()
      })
    } else if (certify === 'certified-by') {
      it('should send certifiedBy and never an authorization on submission', async () => {
        await initStore(store)

        await store.submit(true)

        const header = postPayload().filing.header
        expect(header.certifiedBy).toBe(mockFullName.value)
        expect(header).not.toHaveProperty('authorizationReceived')
      })

      it('should send certifiedBy when saving a draft too', async () => {
        await initStore(store)

        await store.submit(false)

        expect(draftPayload().filing.header.certifiedBy).toBe(mockFullName.value)
      })
    }

    if (payment !== 'staff') {
      it('should send the folio number for a client', async () => {
        await initStore(store)
        store.formState.folio!.folioNumber = 'FOLIO-99'

        await store.submit(true)

        const header = postPayload().filing.header
        expect(header.folioNumber).toBe('FOLIO-99')
        expect(header.staffPaymentOption).toBeUndefined()
        expect(header.waiveFees).toBeUndefined()
      })

      it('should hydrate the folio number from the draft header', async () => {
        mockInitFiling.mockResolvedValue({ draftFiling: buildDraft({ header: { folioNumber: 'ABC-123' } }) })

        await initStore(store, String(DRAFT_FILING_ID))

        expect(store.formState.folio?.folioNumber).toBe('ABC-123')
        expect(store.formState.staffPayment).toBeUndefined()
      })

      it('should remain at the schema defaults when no draft filing is returned', async () => {
        await initStore(store)

        expect(store.formState.folio).toEqual({ folioNumber: '' })
        expect(store.formState.staffPayment).toBeUndefined()
        expect(mockUpdateAllFees).not.toHaveBeenCalled()
      })
    }

    if (payment !== 'folio') {
      describe('staff', () => {
        beforeEach(() => {
          // the form state is built from the account type, so start the store over as staff
          mockIsStaff.value = true
          mockAccountType.value = AccountType.STAFF
          setActivePinia(createPinia())
          store = useStore()
        })

        it('should send the staff payment in the header and waive fees for the no fee option', async () => {
          await initStore(store)
          Object.assign(store.formState.staffPayment!, { option: StaffPaymentOption.NO_FEE })

          await store.submit(true)

          const header = postPayload().filing.header
          expect(header.staffPaymentOption).toBe(StaffPaymentOption.NO_FEE)
          expect(header.waiveFees).toBe(true)
          expect(header.folioNumber).toBeUndefined()
        })

        it('should hydrate the staff payment from the draft header', async () => {
          mockInitFiling.mockResolvedValue({
            draftFiling: buildDraft({
              header: {
                staffPaymentOption: StaffPaymentOption.FAS,
                routingSlipNumber: '123456789',
                priority: true
              }
            })
          })

          await initStore(store, String(DRAFT_FILING_ID))

          expect(store.formState.staffPayment).toEqual({
            option: StaffPaymentOption.FAS,
            bcolAccountNumber: '',
            datNumber: '',
            folioNumber: '',
            isPriority: true,
            routingSlipNumber: '123456789'
          })
          expect(store.formState.folio).toBeUndefined()
        })

        if (options.expectsFeeResync) {
          it('should re-apply the fees for the resumed staff payment', async () => {
            mockInitFiling.mockResolvedValue({
              draftFiling: buildDraft({ header: { staffPaymentOption: StaffPaymentOption.FAS, priority: true } })
            })

            await initStore(store, String(DRAFT_FILING_ID))

            expect(mockUpdateAllFees).toHaveBeenCalledWith(true, false)
          })
        }
      })
    }
  })
}
