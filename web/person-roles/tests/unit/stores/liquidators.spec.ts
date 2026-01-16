import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { getFakePerson, getFakeAddress } from '#e2e-utils'

const identifier = 'BC1234567'

const mockCreateFilingPayload = vi.fn()
const mockSaveOrUpdateDraftFiling = vi.fn()
const mockPostFiling = vi.fn()
const mockBusinessApi = {
  createFilingPayload: mockCreateFilingPayload,
  saveOrUpdateDraftFiling: mockSaveOrUpdateDraftFiling,
  postFiling: mockPostFiling
}
mockNuxtImport('useBusinessApi', () => () => mockBusinessApi)

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
  legalName: 'Test Inc.',
  legalType: 'CC'
}
mockNuxtImport('useBusinessStore', () => () => ({
  business: {
    value: mockBusiness
  },
  businessIdentifier: identifier
}))

function createPartyMock(
  nameData: PartySchema['name'],
  addressData: { delivery: ConnectAddress, mailing: ConnectAddress },
  actions: ActionType[] = [],
  id: string = ''
) {
  return {
    new: {
      id,
      actions,
      name: nameData,
      roles: [{ roleType: RoleTypeUi.LIQUIDATOR }],
      address: {
        mailingAddress: addressData.mailing,
        deliveryAddress: addressData.delivery,
        sameAs: false
      }
    }
  }
}

const person = getFakePerson()
const mailing = getFakeAddress()
const delivery = getFakeAddress()

describe('useLiquidatorStore', () => {
  const store = useLiquidatorStore()
  const { tableState } = useManageParties()
  const schemaDefault = getLiquidatorsSchema().parse({})

  beforeEach(() => {
    vi.resetAllMocks()
    const pinia = createPinia()
    setActivePinia(pinia)
    store.$reset()
    tableState.value = []
  })

  it('initializes with the correct default state', () => {
    expect(store.initializing).toBe(false)
    expect(store.formState).toEqual(schemaDefault)
  })

  describe('init(businessId, draftId?)', () => {
    const partiesResponse = {
      data: [
        createPartyMock(
          {
            partyType: PartyType.PERSON,
            firstName: person.firstName,
            middleName: person.middleName,
            lastName: person.lastName,
            businessName: ''
          },
          { delivery, mailing },
          [ActionType.ADDED]
        )
      ]
    }

    const addressesResponse = {
      liquidationRecordsOffice: {
        mailingAddress: {
          ...getFakeAddress()
        },
        deliveryAddress: {
          ...getFakeAddress()
        },
        sameAs: false
      }
    }

    describe('when starting a new filing (no draftId)', () => {
      it('should set table state from parties response and init formState defaults', async () => {
        mockInitFiling.mockResolvedValue({
          draftFiling: undefined,
          parties: partiesResponse.data
        })

        await store.init(identifier, LiquidateType.INTENT)

        expect(store.initializing).toBe(false)

        expect(tableState.value).toEqual(partiesResponse.data)
        expect(store.formState).toEqual(schemaDefault)
      })

      it('should init records office when filing type = address change', async () => {
        mockInitFiling.mockResolvedValue({
          draftFiling: undefined,
          parties: partiesResponse.data,
          addresses: addressesResponse
        })

        await store.init(identifier, LiquidateType.ADDRESS)

        expect(store.initializing).toBe(false)

        expect(tableState.value).toEqual(partiesResponse.data)
        expect(store.formState.recordsOffice.deliveryAddress)
          .toEqual(addressesResponse.liquidationRecordsOffice?.deliveryAddress)
        expect(store.formState.recordsOffice.mailingAddress)
          .toEqual(addressesResponse.liquidationRecordsOffice?.mailingAddress)
      })

      it('should set empty table when API returns no parties', async () => {
        mockInitFiling.mockResolvedValue({
          draftFiling: undefined,
          parties: []
        })

        await store.init(identifier, LiquidateType.INTENT)
        expect(tableState.value).toEqual([])
      })
    })

    describe('when loading a draft filing', () => {
      const draftId = 'draft123'

      it('should populate form and table from draft filing', async () => {
        const draft = {
          filing: {
            changeOfLiquidators: {
              type: LiquidateType.INTENT,
              relationships: partiesResponse.data.map(item => formatRelationshipApi(item.new)),
              courtOrder: {
                fileNumber: 'CO-1',
                hasPlanOfArrangement: true
              }
            },
            header: {
              accountId: 123,
              staffPaymentOption: StaffPaymentOption.BCOL,
              bcolAccountNumber: '12345',
              routingSlipNumber: '',
              datNumber: '',
              folioNumber: 'test-folio',
              priority: true
            }
          }
        }

        mockInitFiling.mockResolvedValue({
          draftFiling: draft,
          parties: partiesResponse.data
        })

        await store.init(identifier, LiquidateType.INTENT, draftId)

        expect(store.formState.courtOrder).toMatchObject({
          courtOrderNumber: draft.filing.changeOfLiquidators.courtOrder!.fileNumber,
          hasPoa: draft.filing.changeOfLiquidators.courtOrder!.hasPlanOfArrangement
        })

        expect(store.formState.staffPayment).toMatchObject({
          bcolAccountNumber: draft.filing.header.bcolAccountNumber,
          folioNumber: draft.filing.header.folioNumber,
          isPriority: draft.filing.header.priority,
          option: draft.filing.header.staffPaymentOption
        })

        expect(tableState.value).toEqual(partiesResponse.data)
        expect(store.initializing).toBe(false)
      })

      it('falls back to parties when draft has no filing data', async () => {
        mockInitFiling.mockResolvedValue({
          draftFiling: {},
          parties: partiesResponse.data
        })

        await store.init(identifier, LiquidateType.INTENT, draftId)
        expect(tableState.value).toEqual(partiesResponse.data)
      })
    })
  })

  describe('submit', () => {
    it.each([
      {
        isSubmission: false,
        draftId: undefined,
        expectedMethod: 'saveOrUpdateDraftFiling',
        desc: 'should create a fresh draft'
      },
      {
        isSubmission: false,
        draftId: 'draft-123',
        expectedMethod: 'saveOrUpdateDraftFiling',
        desc: 'should update an existing draft'
      },
      {
        isSubmission: true,
        draftId: 'draft-123',
        expectedMethod: 'saveOrUpdateDraftFiling',
        desc: 'should submit draft as final filing'
      },
      {
        isSubmission: true,
        draftId: undefined,
        expectedMethod: 'postFiling',
        desc: 'should submit filing without draft'
      }
    ])('$desc (isSubmission: $isSubmission, hasDraft: $draftId)', async (
      { isSubmission, draftId, expectedMethod }
    ) => {
      if (draftId) {
        store.draftFilingState = {
          filing: { header: { filingId: draftId } }
        } as unknown as LiquidatorDraftState
      } else {
        store.draftFilingState = {} as LiquidatorDraftState
      }

      mockCreateFilingPayload.mockReturnValue({ filing: {} })
      mockSaveOrUpdateDraftFiling.mockResolvedValue({ filing: { header: { filingId: 'new-id' } } })
      mockPostFiling.mockResolvedValue({ filing: { header: { filingId: 'final-id' } } })

      await store.submit(isSubmission)

      if (expectedMethod === 'saveOrUpdateDraftFiling') {
        expect(mockSaveOrUpdateDraftFiling).toHaveBeenCalledWith(
          identifier,
          expect.any(Object),
          isSubmission,
          draftId
        )
        expect(mockPostFiling).not.toHaveBeenCalled()
        expect(useUrlSearchParams().draft).toBe('new-id')
      } else {
        expect(mockPostFiling).toHaveBeenCalledWith(
          identifier,
          expect.any(Object)
        )
        expect(mockSaveOrUpdateDraftFiling).not.toHaveBeenCalled()
      }
    })
  })

  describe('$reset', () => {
    it('restores defaults from schema', () => {
      // mutate form state
      store.formState.courtOrder = { hasPoa: true }
      // @ts-expect-error - partial object
      store.formState.staffPayment = { option: StaffPaymentOption.BCOL }
      // @ts-expect-error - partial object
      store.formState.activeParty = { id: 'X' }
      // @ts-expect-error - incorrect object
      store.currentLiquidationOffice = { some: 'address' }

      store.$reset()

      expect(store.formState).toEqual(schemaDefault)
      expect(store.currentLiquidationOffice).toBeUndefined()
    })
  })
})
