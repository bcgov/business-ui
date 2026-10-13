import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { cloneDeep } from 'es-toolkit'
import {
  DRAFT_FILING_ID,
  describeCommonFilingStoreBehaviour,
  getDraftFilingMock,
  mockBusiness,
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

const filingType = FilingType.CHANGE_OF_ADDRESS
const bodyKey = 'changeOfAddress'
const identifier = 'BC1234567'
const legalType = 'BEN'

const buildDraft = (overrides: { header?: Record<string, unknown>, body?: Record<string, unknown> } = {}) =>
  getDraftFilingMock<COADraftState>({
    filingName: filingType,
    bodyKey,
    body: { legalType, offices: {} },
    business: { legalType },
    ...overrides
  })

/** An office row as returned by useBusinessAddresses in 'table' mode. */
function getOfficeRow(type: OfficeType, street: string): TableBusinessState<OfficesSchema> {
  const office = createDefaultOffice({ type })
  office.address.deliveryAddress.street = street
  office.address.deliveryAddress.city = 'Victoria'
  office.address.deliveryAddress.region = 'BC'
  office.address.deliveryAddress.postalCode = 'V8V 8V8'
  office.address.mailingAddress.street = street
  office.address.mailingAddress.city = 'Victoria'
  office.address.mailingAddress.region = 'BC'
  office.address.mailingAddress.postalCode = 'V8V 8V8'
  return { old: cloneDeep(office), new: office }
}

const officeRows = () => [
  getOfficeRow(OfficeType.REGISTERED, '111 Registered St'),
  getOfficeRow(OfficeType.RECORDS, '222 Records St')
]

describeCommonFilingStoreBehaviour({
  name: 'useAddressChangeStore',
  useStore: useAddressChangeStore,
  filingType,
  bodyKey,
  buildDraft,
  initStore: async (store, draftId) => {
    await store.init(identifier, draftId)
    store.formState.authorization!.isAuthorized = true
  },
  payment: 'both',
  certify: 'authorization',
  expectsFeeResync: true
})

describe('useAddressChangeStore', () => {
  let store: ReturnType<typeof useAddressChangeStore>
  let tableOffices: ReturnType<typeof useManageOffices>['tableState']

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    resetFilingStoreMocks()
    window.history.replaceState({}, '', `/address-change/${identifier}`)
    setMockBusiness({ legalType })

    tableOffices = useManageOffices().tableState
    tableOffices.value = []

    store = useAddressChangeStore()
    mockSaveOrUpdateDraftFiling.mockResolvedValue(buildDraft())
    mockPostFiling.mockResolvedValue(undefined)
  })

  it('initializes with the correct default state', () => {
    expect(store.initializing).toBe(false)
    expect(store.formState.authorization).toEqual({ isAuthorized: false })
    expect(store.formState.folio).toEqual({ folioNumber: '' })
    expect(store.formState.staffPayment).toBeUndefined()
    expect(store.formState.activeOffice).toBeUndefined()
    expect(store.offices).toEqual([])
  })

  describe('init(businessId, draftId)', () => {
    it('should fetch the registered and records offices of the business', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: undefined })

      await store.init(identifier)

      expect(mockInitFiling).toHaveBeenCalledWith(
        identifier,
        FilingType.CHANGE_OF_ADDRESS,
        undefined,
        undefined,
        undefined,
        [OfficeType.REGISTERED, OfficeType.RECORDS]
      )
    })

    it('should pass the route draft id through to initFiling', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: buildDraft() })

      await store.init(identifier, String(DRAFT_FILING_ID))

      expect(mockInitFiling).toHaveBeenCalledWith(
        identifier,
        FilingType.CHANGE_OF_ADDRESS,
        undefined,
        String(DRAFT_FILING_ID),
        undefined,
        [OfficeType.REGISTERED, OfficeType.RECORDS]
      )
    })

    it('should load the offices into the table state', async () => {
      const addresses = officeRows()
      mockInitFiling.mockResolvedValue({ draftFiling: undefined, addresses })

      await store.init(identifier)

      expect(store.offices).toEqual(addresses)
      expect(store.initialOffices).toEqual(addresses)
      expect(store.initialOffices).not.toBe(store.offices)
    })

    it('should set the initial form state for change detection', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: undefined })

      await store.init(identifier)

      expect(store.initialFormState).toEqual(store.formState)
      expect(store.initialFormState).not.toBe(store.formState)
      expect(store.initializing).toBe(false)
    })

    it('should leave the draft filing state empty when no draft filing is returned', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: undefined })

      await store.init(identifier)

      expect(store.draftFilingState).toEqual({})
    })
  })

  describe('submit(isSubmission)', () => {
    const getDraftPayload = () => mockSaveOrUpdateDraftFiling.mock.calls[0]![1]
    const getPostPayload = () => mockPostFiling.mock.calls[0]![1]

    /** Init a new (no draft) filing with both offices loaded and the authorization confirmed. */
    async function initAndAuthorize(addresses = officeRows()) {
      mockInitFiling.mockResolvedValue({ draftFiling: undefined, addresses })
      await store.init(identifier)
      store.formState.authorization!.isAuthorized = true
    }

    it('should echo the business legal type in the filing body', async () => {
      await initAndAuthorize()

      await store.submit(true)

      expect(getPostPayload().filing.changeOfAddress.legalType).toBe(mockBusiness.value.legalType)
    })

    it('should send both offices with both addresses even when nothing changed', async () => {
      await initAndAuthorize()

      await store.submit(true)

      const offices = getPostPayload().filing.changeOfAddress.offices
      expect(Object.keys(offices)).toEqual([OfficeType.REGISTERED, OfficeType.RECORDS])
      expect(offices[OfficeType.REGISTERED].deliveryAddress.streetAddress).toBe('111 Registered St')
      expect(offices[OfficeType.REGISTERED].mailingAddress.streetAddress).toBe('111 Registered St')
      expect(offices[OfficeType.RECORDS].deliveryAddress.streetAddress).toBe('222 Records St')
      expect(offices[OfficeType.RECORDS].mailingAddress.streetAddress).toBe('222 Records St')
    })

    it('should send the edited address of a changed office', async () => {
      const addresses = officeRows()
      await initAndAuthorize(addresses)
      store.offices[0]!.new.actions = [ActionType.ADDRESS_CHANGED]
      store.offices[0]!.new.address.deliveryAddress.street = '999 Changed Ave'

      await store.submit(true)

      const offices = getPostPayload().filing.changeOfAddress.offices
      expect(offices[OfficeType.REGISTERED].deliveryAddress.streetAddress).toBe('999 Changed Ave')
      expect(offices[OfficeType.RECORDS].deliveryAddress.streetAddress).toBe('222 Records St')
    })

    it('should never send a header effective date - the server owns the forced next day fed', async () => {
      await initAndAuthorize()

      await store.submit(true)

      const header = getPostPayload().filing.header
      expect(header.name).toBe(FilingType.CHANGE_OF_ADDRESS)
      expect(header.effectiveDate).toBeUndefined()
      expect(header.futureEffectiveDate).toBeUndefined()
      expect(header.date).toBeTruthy()
    })

    it('should send both offices and no effective date on a saved draft too', async () => {
      await initAndAuthorize()

      await store.submit(false)

      expect(getDraftPayload().filing.header.effectiveDate).toBeUndefined()
      const offices = getDraftPayload().filing.changeOfAddress.offices
      expect(Object.keys(offices)).toEqual([OfficeType.REGISTERED, OfficeType.RECORDS])
    })
  })

  describe('$reset', () => {
    it('restores schema defaults and clears the offices table', async () => {
      mockInitFiling.mockResolvedValue({
        draftFiling: buildDraft({ header: { folioNumber: 'ABC-123' } }),
        addresses: officeRows()
      })
      await store.init(identifier, String(DRAFT_FILING_ID))

      store.$reset()

      expect(store.formState.folio).toEqual({ folioNumber: '' })
      expect(store.formState.authorization).toEqual({ isAuthorized: false })
      expect(store.formState.activeOffice).toBeUndefined()
      expect(store.offices).toEqual([])
      expect(store.initialOffices).toEqual([])
      expect(store.draftFilingState).toEqual({})
    })
  })
})
