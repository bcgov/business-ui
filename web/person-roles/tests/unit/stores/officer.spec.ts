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

const mockGetFeatureFlag = vi.fn()
mockNuxtImport('useConnectLaunchDarkly', () => () => ({
  getFeatureFlag: mockGetFeatureFlag
}))

const mockBusiness = {
  identifier,
  legalName: 'Test Inc.',
  legalType: 'BC'
}
mockNuxtImport('useBusinessStore', () => () => ({
  business: mockBusiness,
  businessIdentifier: identifier
}))

function createPartyMock(
  nameData: PartySchema['name'],
  addressData: { delivery: ApiAddress, mailing: ApiAddress },
  actions: ActionType[] = [],
  id: string = ''
) {
  return {
    new: {
      id,
      actions,
      name: nameData,
      roles: [{ roleType: RoleTypeUi.PRESIDENT, roleClass: RoleClass.OFFICER }],
      address: {
        mailingAddress: formatAddressUi(addressData.mailing),
        deliveryAddress: formatAddressUi(addressData.delivery),
        sameAs: false
      }
    }
  }
}

const person = getFakePerson()
const mailing = getFakeAddress()
const delivery = getFakeAddress()

describe('useOfficerStore', () => {
  const store = useOfficerStore()
  const { tableState } = useManageParties()
  const schemaDefault = getOfficersSchema().parse({})

  beforeEach(() => {
    vi.resetAllMocks()
    const pinia = createPinia()
    setActivePinia(pinia)
    store.$reset()
    tableState.value = []
    mockGetFeatureFlag.mockResolvedValue('BC')
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
            firstName: person.givenName,
            middleName: person.middleInitial,
            lastName: person.familyName,
            businessName: '',
            preferredName: '',
            hasPreferredName: false
          },
          { delivery, mailing },
          [ActionType.ADDED]
        )
      ]
    }

    describe('when starting a new filing (no draftId)', () => {
      it('should set table state from parties response and init formState defaults', async () => {
        mockInitFiling.mockResolvedValue({
          draftFiling: undefined,
          parties: partiesResponse.data
        })

        await store.init(identifier)

        expect(store.initializing).toBe(false)

        expect(tableState.value).toEqual(partiesResponse.data)
        expect(store.formState).toEqual(schemaDefault)
      })

      it('should set empty table when API returns no parties', async () => {
        mockInitFiling.mockResolvedValue({
          draftFiling: undefined,
          parties: []
        })

        await store.init(identifier)
        expect(tableState.value).toEqual([])
      })
    })

    describe('when loading a draft filing', () => {
      const draftId = 'draft123'

      it('should populate form and table from draft filing', async () => {
        const draft = {
          filing: {
            changeOfOfficers: {
              relationships: partiesResponse.data.map(item => formatRelationshipApi(item.new))
            },
            header: {
              accountId: 123,
              folioNumber: 'test-folio'
            }
          }
        }

        mockInitFiling.mockResolvedValue({
          draftFiling: draft,
          parties: partiesResponse.data
        })

        await store.init(identifier, draftId)

        expect(tableState.value).toEqual(partiesResponse.data)
        expect(store.initializing).toBe(false)
      })

      it('falls back to parties when draft has no filing data', async () => {
        mockInitFiling.mockResolvedValue({
          draftFiling: {},
          parties: partiesResponse.data
        })

        await store.init(identifier, draftId)
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
        } as unknown as OfficersDraftState
      } else {
        store.draftFilingState = {} as OfficersDraftState
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
      // @ts-expect-error - partial object
      store.formState.activeParty = { id: 'X' }

      store.$reset()

      expect(store.formState).toEqual(schemaDefault)
    })
  })
})
