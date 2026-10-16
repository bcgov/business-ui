import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { cloneDeep } from 'es-toolkit'
import {
  DEFAULT_FULL_NAME,
  DRAFT_FILING_ID,
  describeCommonFilingStoreBehaviour,
  getDraftFilingMock,
  mockInitFiling,
  mockIsStaff,
  mockLogBlockedSubmission,
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
mockNuxtImport('logBlockedSubmission', async () => (await import('#test-mocks/filing-store')).mockLogBlockedSubmission)

const identifier = 'CP1002605'

/** The CP cooperative association the address change is filed for. */
const coopBusiness = {
  identifier,
  legalName: 'TEST COOPERATIVE ASSOCIATION',
  legalType: 'CP',
  foundingDate: '1998-08-26T07:00:00+00:00'
}

/** A coop change of address draft filing as returned by legal-api. */
const buildDraft = (overrides: { header?: Record<string, unknown>, body?: Record<string, unknown> } = {}) =>
  getDraftFilingMock<COADraftState>({
    filingName: FilingType.CHANGE_OF_ADDRESS,
    bodyKey: 'changeOfAddress',
    body: { legalType: 'CP', offices: {} },
    business: { identifier, legalType: 'CP' },
    ...overrides
  })

/** The registered office row as returned by useBusinessAddresses in 'table' mode. */
function getRegisteredOfficeRow(street = '111 Registered St'): TableBusinessState<OfficesSchema> {
  const office = createDefaultOffice({ type: OfficeType.REGISTERED })
  for (const address of [office.address.deliveryAddress, office.address.mailingAddress]) {
    address.street = street
    address.city = 'Victoria'
    address.region = 'BC'
    address.postalCode = 'V8V 8V8'
    address.country = 'CA'
  }
  return { old: cloneDeep(office), new: office }
}

describeCommonFilingStoreBehaviour({
  name: 'useAddressChangeStore',
  useStore: useAddressChangeStore,
  filingType: FilingType.CHANGE_OF_ADDRESS,
  bodyKey: 'changeOfAddress',
  buildDraft,
  initStore: async (store, draftId) => {
    await store.init(identifier, draftId)
  },
  payment: 'both',
  certify: 'certified-by',
  expectsFeeResync: true,
  submitBlocked: true
})

describe('useAddressChangeStore', () => {
  let store: ReturnType<typeof useAddressChangeStore>
  let tableOffices: ReturnType<typeof useManageOffices>['tableState']

  beforeEach(() => {
    vi.clearAllMocks()
    resetFilingStoreMocks()
    setMockBusiness(coopBusiness)
    setActivePinia(createPinia())
    window.history.replaceState({}, '', `/address-change/${identifier}`)
    mockInitFiling.mockResolvedValue({ draftFiling: undefined, addresses: undefined })
    mockSaveOrUpdateDraftFiling.mockResolvedValue(buildDraft())
    mockPostFiling.mockResolvedValue(undefined)
    store = useAddressChangeStore()
    tableOffices = useManageOffices().tableState
    tableOffices.value = []
  })

  it('initializes with the non staff schema defaults', () => {
    expect(store.initializing).toBe(false)
    expect(store.formState.folio).toEqual({ folioNumber: '' })
    expect(store.formState.staffPayment).toBeUndefined()
    expect(store.formState.activeOffice).toBeUndefined()
    expect(store.offices).toEqual([])
  })

  describe('init(businessId, draftId)', () => {
    it('should fetch the registered office only - never the records office', async () => {
      await store.init(identifier)

      expect(mockInitFiling).toHaveBeenCalledTimes(1)
      expect(mockInitFiling).toHaveBeenCalledWith(
        identifier,
        FilingType.CHANGE_OF_ADDRESS,
        undefined,
        undefined,
        undefined,
        [OfficeType.REGISTERED]
      )
      expect(store.initializing).toBe(false)
    })

    it('should pass the draft id through to initFiling', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: buildDraft() })

      await store.init(identifier, String(DRAFT_FILING_ID))

      expect(mockInitFiling).toHaveBeenCalledWith(
        identifier,
        FilingType.CHANGE_OF_ADDRESS,
        undefined,
        String(DRAFT_FILING_ID),
        undefined,
        [OfficeType.REGISTERED]
      )
    })

    it('should keep the fetched office in the manage offices table state', async () => {
      const addresses = [getRegisteredOfficeRow()]
      mockInitFiling.mockResolvedValue({ draftFiling: undefined, addresses })

      await store.init(identifier)

      expect(store.offices).toEqual(addresses)
      expect(tableOffices.value).toEqual(addresses)
    })

    it('should set the initial state for change detection', async () => {
      mockInitFiling.mockResolvedValue({
        draftFiling: buildDraft({ header: { folioNumber: 'test-folio' } }),
        addresses: [getRegisteredOfficeRow()]
      })

      await store.init(identifier, String(DRAFT_FILING_ID))

      expect(store.initialFormState).toEqual(store.formState)
      expect(store.initialFormState).not.toBe(store.formState)
      expect(store.initialOffices).toEqual(store.offices)
      expect(store.initialOffices).not.toBe(store.offices)
    })

    it('should bail cleanly when initFiling returns no draft filing', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: undefined })

      await store.init(identifier, 'not-a-filing-id')

      expect(store.initializing).toBe(false)
      expect(store.offices).toEqual([])
      expect(store.formState.folio).toEqual({ folioNumber: '' })
      expect(store.draftFilingState).toEqual({})
      expect(mockUpdateAllFees).not.toHaveBeenCalled()
    })

    describe('staff', () => {
      beforeEach(() => {
        // the store builds its form state from the account type, so start it over as staff
        mockIsStaff.value = true
        setActivePinia(createPinia())
        store = useAddressChangeStore()
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
    const getBlockedPayload = () => mockLogBlockedSubmission.mock.calls[0]![0]

    /** Init a new (no draft) filing with the registered office loaded. */
    async function initNewFiling(addresses = [getRegisteredOfficeRow()]) {
      mockInitFiling.mockResolvedValue({ draftFiling: undefined, addresses })
      await store.init(identifier)
    }

    beforeEach(async () => {
      await initNewFiling()
    })

    it('should echo the business legal type in the filing body', async () => {
      await store.submit(true)

      expect(getBlockedPayload().filing.changeOfAddress.legalType).toBe(coopBusiness.legalType)
    })

    it('should build a change of address only body', async () => {
      await store.submit(true)

      const filing = getBlockedPayload().filing
      expect(Object.keys(filing.changeOfAddress)).toEqual(['legalType', 'offices'])
      expect(filing).not.toHaveProperty('annualReport')
      expect(filing).not.toHaveProperty('changeOfDirectors')
    })

    it('should send the registered office only - never a records office', async () => {
      await store.submit(true)

      const offices = getBlockedPayload().filing.changeOfAddress.offices
      expect(Object.keys(offices)).toEqual([OfficeType.REGISTERED])
      expect(offices).not.toHaveProperty(OfficeType.RECORDS)
      expect(offices[OfficeType.REGISTERED].deliveryAddress.streetAddress).toBe('111 Registered St')
      expect(offices[OfficeType.REGISTERED].mailingAddress.streetAddress).toBe('111 Registered St')
    })

    it('should send the edited registered office address', async () => {
      store.offices[0]!.new.actions = [ActionType.ADDRESS_CHANGED]
      store.offices[0]!.new.address.deliveryAddress.street = '999 Changed Ave'

      await store.submit(true)

      const offices = getBlockedPayload().filing.changeOfAddress.offices
      expect(offices[OfficeType.REGISTERED].deliveryAddress.streetAddress).toBe('999 Changed Ave')
    })

    it('should never send a header effective date - a coop address change is immediate', async () => {
      await store.submit(true)

      const header = getBlockedPayload().filing.header
      expect(header.name).toBe(FilingType.CHANGE_OF_ADDRESS)
      expect(header.effectiveDate).toBeUndefined()
      expect(header.futureEffectiveDate).toBeUndefined()
      expect(header.date).toBeTruthy()
    })

    // FUTURE: the certify section (base FormCertify) supplies the name
    it('should certify a saved draft too and never send authorizationReceived', async () => {
      await store.submit(false)

      const header = getPayload().filing.header
      expect(header.certifiedBy).toBe(DEFAULT_FULL_NAME)
      expect(header).not.toHaveProperty('authorizationReceived')
    })
  })

  describe('$reset', () => {
    it('restores the schema defaults and clears the offices table', async () => {
      mockInitFiling.mockResolvedValue({
        draftFiling: buildDraft({ header: { folioNumber: 'test-folio' } }),
        addresses: [getRegisteredOfficeRow()]
      })
      await store.init(identifier, String(DRAFT_FILING_ID))

      store.$reset()

      expect(store.formState.folio).toEqual({ folioNumber: '' })
      expect(store.formState.activeOffice).toBeUndefined()
      expect(store.initialFormState).toEqual(store.formState)
      expect(store.offices).toEqual([])
      expect(store.initialOffices).toEqual([])
      expect(store.draftFilingState).toEqual({})
    })
  })
})
