import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const identifier = 'BC1234567'
const draftFilingId = 987654
const fullName = 'Test Staff User'

const mockSaveOrUpdateDraftFiling = vi.fn()
const mockPostFiling = vi.fn()
mockNuxtImport('useBusinessService', () => () => ({
  saveOrUpdateDraftFiling: mockSaveOrUpdateDraftFiling,
  postFiling: mockPostFiling
}))

// NB: only initFiling is mocked - createFilingPayload runs for real so the submitted
// payload shape (including the filing header) is asserted end to end
const mockInitFiling = vi.fn()
vi.mock('#business/app/composables/useFiling', async (importOriginal) => {
  const actual = await importOriginal<typeof import('#business/app/composables/useFiling')>()
  return {
    ...actual,
    useFiling: () => ({
      ...actual.useFiling(),
      initFiling: mockInitFiling
    })
  }
})

const mockBusiness = {
  identifier,
  legalName: 'Test Court Order Inc.',
  legalType: 'BC',
  foundingDate: '2022-01-01T12:00:00+00:00'
}
const mockIsBaseCompany = vi.fn()
mockNuxtImport('useBusinessStore', () => () => ({
  business: mockBusiness,
  businessIdentifier: identifier,
  isBaseCompany: mockIsBaseCompany
}))

const mockUpdateAllFees = vi.fn()
mockNuxtImport('useConnectFeeStore', () => () => ({
  initFees: vi.fn(),
  addReplaceFee: vi.fn(),
  updateAllFees: mockUpdateAllFees
}))

const mockOpenFilingNotAllowedErrorModal = vi.fn()
mockNuxtImport('useFilingModals', () => () => ({
  openFilingNotAllowedErrorModal: mockOpenFilingNotAllowedErrorModal,
  openGetDraftFilingErrorModal: vi.fn(),
  openInitFilingErrorModal: vi.fn(),
  openSaveFilingErrorModal: vi.fn()
}))

mockNuxtImport('useConnectAccountStore', () => () => ({
  currentAccount: { id: 123, accountType: AccountType.STAFF }
}))

mockNuxtImport('useConnectAuth', () => () => ({ authUser: { value: { fullName } } }))

/** A court order draft filing as returned by legal-api (pre-created by the business dashboard). */
function getDraftMock(
  courtOrder: Record<string, unknown> = {},
  header: Record<string, unknown> = {}
) {
  return {
    filing: {
      header: {
        name: FilingType.COURT_ORDER,
        filingId: draftFilingId,
        status: FilingStatus.DRAFT,
        ...header
      },
      business: { identifier, legalType: 'BC' },
      courtOrder
    }
  } as unknown as CourtOrderDraftState
}

function getCourtOrderFileMock(overrides: Partial<CourtOrderFileUi> = {}): CourtOrderFileUi {
  return {
    id: 'CORP-DS0100001003',
    fileKey: 'CORP-DS0100001003',
    name: 'Court Order.pdf',
    type: DocumentTypeClient.COURT_ORDER,
    action: CourtOrderFileAction.NONE,
    status: CourtOrderFileStatus.SUCCESS,
    ...overrides
  }
}

/** The court order schema generates a random `id` for UI diff'ing - ignore it when comparing. */
function withoutId(courtOrder: CourtOrderPoaFullFilingSchema) {
  const { id: _id, ...rest } = courtOrder
  return rest
}

describe('useCourtOrderStore', () => {
  const store = useCourtOrderStore()
  const schemaDefault = getCourtOrderFormSchema().parse({})
  const defaultCourtOrder = withoutId(schemaDefault.courtOrder)

  beforeEach(() => {
    vi.resetAllMocks()
    setActivePinia(createPinia())
    store.$reset()
    mockIsBaseCompany.mockReturnValue(true)
    mockSaveOrUpdateDraftFiling.mockResolvedValue(getDraftMock())
  })

  it('initializes with the correct default state', () => {
    expect(store.initializing).toBe(false)
    expect(withoutId(store.formState.courtOrder)).toEqual(defaultCourtOrder)
    expect(store.formState.staffPayment).toEqual(schemaDefault.staffPayment)
  })

  describe('init(businessId, draftId)', () => {
    it('should pass the route draft id through to initFiling', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: getDraftMock({ fileNumber: '12345-6789' }) })

      await store.init(identifier, String(draftFilingId))

      expect(mockInitFiling).toHaveBeenCalledTimes(1)
      expect(mockInitFiling).toHaveBeenCalledWith(
        identifier,
        FilingType.COURT_ORDER,
        undefined,
        String(draftFilingId)
      )
      expect(store.initializing).toBe(false)
    })

    it('should hydrate the form state from the draft filing', async () => {
      mockInitFiling.mockResolvedValue({
        draftFiling: getDraftMock({
          fileNumber: '12345-6789',
          effectOfOrder: 'planOfArrangement',
          orderDetails: 'some court order text',
          files: [
            { fileKey: 'CORP-DS0100001003', fileName: 'Court Order.pdf', documentType: 'court_order' },
            { fileKey: 'CORP-DS0100001004', fileName: 'Affidavit.pdf', documentType: 'supporting_document' }
          ]
        })
      })

      await store.init(identifier, String(draftFilingId))

      expect(store.formState.courtOrder).toEqual(expect.objectContaining({
        fileNumber: '12345-6789',
        effectOfOrder: true,
        orderDetails: 'some court order text',
        filingId: draftFilingId,
        filingType: FilingType.COURT_ORDER
      }))
      expect(store.formState.courtOrder.files).toEqual([
        expect.objectContaining({
          fileKey: 'CORP-DS0100001003',
          name: 'Court Order.pdf',
          type: DocumentTypeClient.COURT_ORDER,
          action: CourtOrderFileAction.NONE,
          status: CourtOrderFileStatus.IDLE
        }),
        expect.objectContaining({
          fileKey: 'CORP-DS0100001004',
          name: 'Affidavit.pdf',
          type: DocumentTypeClient.SUPPORTING_DOCUMENT,
          action: CourtOrderFileAction.NONE,
          status: CourtOrderFileStatus.IDLE
        })
      ])
      expect(mockOpenFilingNotAllowedErrorModal).not.toHaveBeenCalled()
    })

    it('should hydrate an effectively empty draft with schema defaults', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: getDraftMock({}) })

      await store.init(identifier, String(draftFilingId))

      expect(store.formState.courtOrder).toEqual(expect.objectContaining({
        fileNumber: '',
        effectOfOrder: false,
        orderDetails: null,
        files: [],
        filingId: draftFilingId
      }))
    })

    it('should set the initial form state for change detection', async () => {
      mockInitFiling.mockResolvedValue({
        draftFiling: getDraftMock({ fileNumber: '12345-6789', orderDetails: 'some court order text' })
      })

      await store.init(identifier, String(draftFilingId))

      expect(store.initialFormState).toEqual(store.formState)
      expect(store.initialFormState).not.toBe(store.formState)
    })

    it('should bail cleanly when initFiling returns no draft filing', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: undefined })

      await store.init(identifier, 'not-a-filing-id')

      expect(store.initializing).toBe(false)
      expect(withoutId(store.formState.courtOrder)).toEqual(defaultCourtOrder)
      expect(store.formState.staffPayment).toEqual(schemaDefault.staffPayment)
      // the draft filing error modal is opened by initFiling itself
      expect(mockOpenFilingNotAllowedErrorModal).not.toHaveBeenCalled()
      expect(mockUpdateAllFees).not.toHaveBeenCalled()
    })

    it('should open the filing not allowed modal for non BC corp legal types', async () => {
      // coops and firms continue to file court orders in the legacy filings UI
      mockIsBaseCompany.mockReturnValue(false)
      mockInitFiling.mockResolvedValue({
        draftFiling: getDraftMock({ fileNumber: '12345-6789', orderDetails: 'some court order text' })
      })

      await store.init(identifier, String(draftFilingId))

      expect(mockOpenFilingNotAllowedErrorModal).toHaveBeenCalledTimes(1)
      expect(store.initializing).toBe(false)
      expect(withoutId(store.formState.courtOrder)).toEqual(defaultCourtOrder)
    })

    describe('staff payment', () => {
      it('should hydrate the staff payment from the draft header', async () => {
        mockInitFiling.mockResolvedValue({
          draftFiling: getDraftMock(
            { fileNumber: '12345-6789', orderDetails: 'some court order text' },
            {
              staffPaymentOption: StaffPaymentOption.BCOL,
              bcolAccountNumber: '123456',
              datNumber: 'C1234567',
              folioNumber: 'test-folio',
              priority: true
            }
          )
        })

        await store.init(identifier, String(draftFilingId))

        expect(store.formState.staffPayment).toEqual({
          option: StaffPaymentOption.BCOL,
          bcolAccountNumber: '123456',
          datNumber: 'C1234567',
          folioNumber: 'test-folio',
          isPriority: true,
          routingSlipNumber: ''
        })
      })

      it.each([
        {
          desc: 'priority and no fee',
          header: { staffPaymentOption: StaffPaymentOption.NO_FEE, priority: true },
          expected: [true, true]
        },
        {
          desc: 'no fee without priority',
          header: { staffPaymentOption: StaffPaymentOption.NO_FEE, priority: false },
          expected: [false, true]
        },
        {
          desc: 'priority with a payable option',
          header: { staffPaymentOption: StaffPaymentOption.FAS, routingSlipNumber: '123456789', priority: true },
          expected: [true, false]
        },
        {
          desc: 'no staff payment selection',
          header: {},
          expected: [false, false]
        }
      ])('should re-apply the fees on draft resume - $desc', async ({ header, expected }) => {
        mockInitFiling.mockResolvedValue({
          draftFiling: getDraftMock({ fileNumber: '12345-6789', orderDetails: 'some court order text' }, header)
        })

        await store.init(identifier, String(draftFilingId))

        expect(mockUpdateAllFees).toHaveBeenCalledTimes(1)
        expect(mockUpdateAllFees).toHaveBeenCalledWith(...expected)
      })
    })
  })

  describe('submit(isSubmission)', () => {
    /** Resume the pre-created draft, then apply the given form state edits. */
    async function initAndEdit(courtOrder: Partial<CourtOrderPoaFullFilingSchema> = {}) {
      mockInitFiling.mockResolvedValue({
        draftFiling: getDraftMock({ fileNumber: '12345-6789', orderDetails: 'some court order text' })
      })
      await store.init(identifier, String(draftFilingId))
      Object.assign(store.formState.courtOrder, courtOrder)
    }

    const getPayload = () => mockSaveOrUpdateDraftFiling.mock.calls[0]![1]

    it('should always update the existing draft filing (never create one)', async () => {
      await initAndEdit()

      const result = await store.submit(true)

      expect(result).toBe(true)
      expect(mockPostFiling).not.toHaveBeenCalled()
      expect(mockSaveOrUpdateDraftFiling).toHaveBeenCalledTimes(1)
      expect(mockSaveOrUpdateDraftFiling).toHaveBeenCalledWith(
        identifier,
        expect.any(Object),
        true,
        draftFilingId
      )
    })

    it('should save a draft against the same filing id when not submitting', async () => {
      await initAndEdit()

      const result = await store.submit(false)

      expect(result).toBe(false)
      expect(mockPostFiling).not.toHaveBeenCalled()
      expect(mockSaveOrUpdateDraftFiling).toHaveBeenCalledWith(
        identifier,
        expect.any(Object),
        false,
        draftFilingId
      )
    })

    it('should build the header without an effective date', async () => {
      await initAndEdit()

      await store.submit(true)

      const header = getPayload().filing.header
      // NB: an effectiveDate would silently make the court order future effective
      expect(header).not.toHaveProperty('effectiveDate')
      expect(Object.keys(header)).not.toContain('effectiveDate')
      expect(header.name).toBe(FilingType.COURT_ORDER)
      expect(header.certifiedBy).toBe(fullName)
      expect(header.date).toBeTruthy()
    })

    it('should build the business block from the business store', async () => {
      await initAndEdit()

      await store.submit(true)

      expect(getPayload().filing.business).toEqual({
        identifier,
        legalName: mockBusiness.legalName,
        legalType: mockBusiness.legalType,
        foundingDate: mockBusiness.foundingDate
      })
    })

    it('should submit uploaded documents in the files array (never a flat fileKey)', async () => {
      await initAndEdit({
        files: [
          getCourtOrderFileMock(),
          getCourtOrderFileMock({
            id: 'CORP-DS0100001004',
            fileKey: 'CORP-DS0100001004',
            name: 'Affidavit.pdf',
            type: DocumentTypeClient.SUPPORTING_DOCUMENT
          })
        ]
      })

      await store.submit(true)

      const courtOrder = getPayload().filing.courtOrder
      expect(courtOrder.files).toEqual([
        {
          fileKey: 'CORP-DS0100001003',
          fileName: 'Court Order.pdf',
          documentType: DocumentTypeClient.COURT_ORDER
        },
        {
          fileKey: 'CORP-DS0100001004',
          fileName: 'Affidavit.pdf',
          documentType: DocumentTypeClient.SUPPORTING_DOCUMENT
        }
      ])
      expect(courtOrder).not.toHaveProperty('fileKey')
    })

    it.each([
      ['removed', { action: CourtOrderFileAction.DELETED }],
      ['errored', { status: CourtOrderFileStatus.ERROR }],
      ['missing a DRS file key', { fileKey: undefined }]
    ])('should omit files that are %s', async (_label, overrides) => {
      await initAndEdit({ files: [getCourtOrderFileMock(overrides)] })

      await store.submit(true)

      expect(getPayload().filing.courtOrder).not.toHaveProperty('files')
    })

    it('should omit the files property when there are no documents', async () => {
      await initAndEdit({ files: [] })

      await store.submit(true)

      expect(getPayload().filing.courtOrder).not.toHaveProperty('files')
    })

    it('should send effectOfOrder as planOfArrangement when checked', async () => {
      await initAndEdit({ effectOfOrder: true })

      await store.submit(true)

      expect(getPayload().filing.courtOrder.effectOfOrder).toBe('planOfArrangement')
    })

    it('should omit effectOfOrder when not checked', async () => {
      await initAndEdit({ effectOfOrder: false })

      await store.submit(true)

      expect(getPayload().filing.courtOrder).not.toHaveProperty('effectOfOrder')
    })

    it.each([
      ['null', null],
      ['empty', ''],
      ['whitespace only', '   ']
    ])('should omit orderDetails when %s', async (_label, orderDetails) => {
      await initAndEdit({
        orderDetails,
        files: [getCourtOrderFileMock()]
      })

      await store.submit(true)

      expect(getPayload().filing.courtOrder).not.toHaveProperty('orderDetails')
    })

    it('should trim orderDetails', async () => {
      await initAndEdit({ orderDetails: '  some court order text  ' })

      await store.submit(true)

      expect(getPayload().filing.courtOrder.orderDetails).toBe('some court order text')
    })

    it('should build the full expected court order payload', async () => {
      await initAndEdit({
        fileNumber: '12345-6789',
        effectOfOrder: true,
        orderDetails: 'some court order text',
        files: [getCourtOrderFileMock()]
      })
      store.formState.staffPayment = {
        option: StaffPaymentOption.FAS,
        bcolAccountNumber: '',
        datNumber: '',
        routingSlipNumber: '123456789',
        folioNumber: 'test-folio',
        isPriority: true
      }

      await store.submit(true)

      expect(getPayload().filing.courtOrder).toEqual({
        fileNumber: '12345-6789',
        effectOfOrder: 'planOfArrangement',
        orderDetails: 'some court order text',
        files: [{
          fileKey: 'CORP-DS0100001003',
          fileName: 'Court Order.pdf',
          documentType: DocumentTypeClient.COURT_ORDER
        }]
      })
      expect(getPayload().filing.header).toEqual(expect.objectContaining({
        staffPaymentOption: StaffPaymentOption.FAS,
        routingSlipNumber: '123456789',
        folioNumber: 'test-folio',
        priority: true,
        waiveFees: false
      }))
    })

    it('should waive fees in the header for the no fee option', async () => {
      await initAndEdit()
      store.formState.staffPayment = {
        option: StaffPaymentOption.NO_FEE,
        bcolAccountNumber: '',
        datNumber: '',
        routingSlipNumber: '',
        folioNumber: '',
        isPriority: false
      }

      await store.submit(true)

      expect(getPayload().filing.header).toEqual(expect.objectContaining({
        staffPaymentOption: StaffPaymentOption.NO_FEE,
        waiveFees: true
      }))
    })
  })

  describe('$reset', () => {
    it('restores the schema defaults', async () => {
      mockInitFiling.mockResolvedValue({
        draftFiling: getDraftMock({ fileNumber: '12345-6789', orderDetails: 'some court order text' })
      })
      await store.init(identifier, String(draftFilingId))

      store.$reset()

      expect(withoutId(store.formState.courtOrder)).toEqual(defaultCourtOrder)
      expect(store.formState.staffPayment).toEqual(schemaDefault.staffPayment)
      expect(withoutId(store.initialFormState.courtOrder)).toEqual(defaultCourtOrder)
    })
  })
})
