import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import {
  DRAFT_FILING_ID,
  describeCommonFilingStoreBehaviour,
  getDraftFilingMock,
  mockInitFiling,
  mockPostFiling,
  mockSaveOrUpdateDraftFiling,
  resetFilingStoreMocks,
  setMockBusiness
} from '#test-mocks/filing-store'

const { mockGetAddresses } = vi.hoisted(() => ({ mockGetAddresses: vi.fn() }))

mockNuxtImport('useBusinessService', async () => {
  const { makeBusinessServiceMock } = await import('#test-mocks/filing-store')
  return () => ({ ...makeBusinessServiceMock(), getAddresses: mockGetAddresses })
})
mockNuxtImport('useConnectFeeStore', async () => (await import('#test-mocks/filing-store')).makeFeeStoreMock)
mockNuxtImport('useIsStaff', async () => (await import('#test-mocks/filing-store')).makeIsStaffMock)
mockNuxtImport('useFilingModals', async () => (await import('#test-mocks/filing-store')).makeFilingModalsMock)
mockNuxtImport('useConnectAuth', async () => (await import('#test-mocks/filing-store')).makeConnectAuthMock)
mockNuxtImport('useConnectAccountStore', async () => (await import('#test-mocks/filing-store')).makeAccountStoreMock)
mockNuxtImport('useFiling', async original => (await import('#test-mocks/filing-store')).makeFilingMock(original))
mockNuxtImport('useBusinessStore', async original =>
  (await import('#test-mocks/filing-store')).makeBusinessStoreMock(original))

const filingType = FilingType.REVIEW_IMPORTED_DATA
const bodyKey = 'reviewImportedData'
const identifier = 'BC1234567'
const legalType = 'BC'

const buildDraft = (overrides: { header?: Record<string, unknown>, body?: Record<string, unknown> } = {}) =>
  getDraftFilingMock<ReviewImportedDataDraftState>({
    filingName: filingType,
    bodyKey,
    body: {},
    business: { legalType },
    ...overrides
  })

function apiAddress(street: string): ApiAddress {
  return {
    streetAddress: street,
    addressCity: 'Victoria',
    addressRegion: 'BC',
    postalCode: 'V8V 8V8',
    addressCountry: 'CA'
  }
}

function apiOffice(street: string): ApiBaseAddressObj {
  return { mailingAddress: apiAddress(street), deliveryAddress: apiAddress(street) }
}

/** The business offices as returned by legal-api - registered only, the records office never migrated. */
const apiAddresses = (): ApiEntityOfficeAddress => ({ registeredOffice: apiOffice('111 Registered St') })

/** A director row as returned by useBusinessParty (table state). */
function directorRow(id: string, firstName: string): TableBusinessState<PartySchema> {
  const party = getPartySchema(RoleTypeUi.DIRECTOR).parse({ id })
  party.name.firstName = firstName
  party.name.lastName = 'Director'
  party.roles = [{ roleType: RoleTypeUi.DIRECTOR, appointmentDate: '2020-01-01' }]
  party.address.deliveryAddress.street = '1 Old St'
  party.address.mailingAddress.street = '1 Old St'
  return { old: structuredClone(party), new: party }
}

const parties = () => [directorRow('123', 'Jane'), directorRow('456', 'John')]

/** Fills the empty seeded records office row the way the office sub form would. */
function fillRecordsOffice(store: ReturnType<typeof useReviewImportedDataStore>, region = 'BC', country = 'CA') {
  const row = store.offices.find(o => o.new.type === OfficeType.RECORDS)!
  for (const address of [row.new.address.deliveryAddress, row.new.address.mailingAddress]) {
    address.street = '222 Records St'
    address.city = 'Victoria'
    address.region = region
    address.country = country
    address.postalCode = 'V8V 8V8'
  }
  row.new.actions = [ActionType.ADDED]
}

function changeDirectorAddress(store: ReturnType<typeof useReviewImportedDataStore>, id: string) {
  const row = store.directors.find(d => d.new.id === id)!
  row.new.address.mailingAddress.street = '9 New St'
  row.new.actions = [ActionType.ADDRESS_CHANGED]
}

describeCommonFilingStoreBehaviour({
  name: 'useReviewImportedDataStore',
  useStore: useReviewImportedDataStore,
  filingType,
  bodyKey,
  buildDraft,
  initStore: async (store, draftId) => {
    mockGetAddresses.mockResolvedValue(apiAddresses())
    await store.init(identifier, draftId)
    // the filing needs at least one changed section to be submittable
    fillRecordsOffice(store)
  },
  payment: 'both',
  certify: 'certified-by',
  expectsFeeResync: true
})

describe('useReviewImportedDataStore', () => {
  let store: ReturnType<typeof useReviewImportedDataStore>

  const submitPayload = () => mockPostFiling.mock.calls[0]![1].filing
  const draftPayload = () => mockSaveOrUpdateDraftFiling.mock.calls[0]![1].filing

  beforeEach(() => {
    vi.clearAllMocks()
    resetFilingStoreMocks()
    setActivePinia(createPinia())
    setMockBusiness({ legalType })
    window.history.replaceState({}, '', `/${filingType}/${identifier}`)
    mockInitFiling.mockResolvedValue({ draftFiling: undefined, parties: parties() })
    mockGetAddresses.mockResolvedValue(apiAddresses())
    mockSaveOrUpdateDraftFiling.mockResolvedValue(buildDraft())
    mockPostFiling.mockResolvedValue(undefined)
    store = useReviewImportedDataStore()
  })

  describe('init', () => {
    it('fetches the active directors through initFiling and the offices raw', async () => {
      await store.init(identifier)

      expect(mockInitFiling).toHaveBeenCalledWith(
        identifier,
        filingType,
        undefined,
        undefined,
        { roleType: RoleType.DIRECTOR }
      )
      expect(mockGetAddresses).toHaveBeenCalledWith(identifier)
      expect(store.directors.map(d => d.new.id)).toEqual(['123', '456'])
    })

    it('seeds an empty unsaved row for an office the business has no record of', async () => {
      await store.init(identifier)

      expect(store.offices.map(o => o.new.type)).toEqual([OfficeType.REGISTERED, OfficeType.RECORDS])
      const registered = store.offices[0]!
      expect(registered.old).toBeDefined()
      expect(registered.new.address.deliveryAddress.street).toBe('111 Registered St')
      const records = store.offices[1]!
      expect(records.old).toBeUndefined()
      expect(records.new.actions).toEqual([])
      expect(store.hasChanges).toBe(false)
    })

    it('summarizes the missing info warnings on the business', async () => {
      setMockBusiness({
        legalType,
        warnings: [
          {
            code: 'NO_RECORDS_OFFICE',
            message: '',
            warningType: ApiWarningType.MISSING_REQUIRED_BUSINESS_INFO,
            data: { officeType: 'recordsOffice' }
          },
          {
            code: 'NO_DIRECTOR_MAILING_ADDRESS_POSTAL_CODE',
            message: '',
            warningType: ApiWarningType.MISSING_REQUIRED_BUSINESS_INFO,
            data: { partyId: 123 }
          }
        ]
      })
      await store.init(identifier)

      expect(store.missingInfo).toEqual({
        offices: { recordsOffice: [{}] },
        directors: { 123: [{ addressType: 'mailingAddress', field: 'postalCode' }] }
      })
    })

    it('merges the draft offices and director addresses over the business data', async () => {
      const draft = buildDraft({
        body: {
          offices: {
            registeredOffice: apiOffice('333 Changed St'),
            recordsOffice: apiOffice('222 Records St')
          },
          relationships: [{
            entity: { identifier: '123', givenName: 'Jane', familyName: 'Director' },
            mailingAddress: apiAddress('9 New St'),
            deliveryAddress: apiAddress('9 New St'),
            roles: [{ roleType: RoleType.DIRECTOR }],
            actions: [ActionType.ADDRESS_CHANGED]
          }]
        }
      })
      mockInitFiling.mockResolvedValue({ draftFiling: draft, parties: parties() })

      await store.init(identifier, String(DRAFT_FILING_ID))

      const registered = store.offices.find(o => o.new.type === OfficeType.REGISTERED)!
      expect(registered.new.address.deliveryAddress.street).toBe('333 Changed St')
      expect(registered.new.actions).toEqual([ActionType.CHANGED])
      expect(registered.old?.address.deliveryAddress.street).toBe('111 Registered St')
      const records = store.offices.find(o => o.new.type === OfficeType.RECORDS)!
      expect(records.new.actions).toEqual([ActionType.ADDED])
      expect(records.old).toBeUndefined()

      const jane = store.directors.find(d => d.new.id === '123')!
      expect(jane.new.address.mailingAddress.street).toBe('9 New St')
      expect(jane.new.actions).toEqual([ActionType.ADDRESS_CHANGED])
      expect(jane.old?.address.mailingAddress.street).toBe('1 Old St')
      expect(store.directors.find(d => d.new.id === '456')!.new.actions).toEqual([])
      expect(store.hasChanges).toBe(true)
    })
  })

  describe('submit', () => {
    it('sends only the changed offices', async () => {
      await store.init(identifier)
      fillRecordsOffice(store)

      await store.submit(true)

      const body = submitPayload().reviewImportedData
      expect(body.offices).toEqual({
        recordsOffice: {
          mailingAddress: expect.objectContaining({ streetAddress: '222 Records St', addressRegion: 'BC' }),
          deliveryAddress: expect.objectContaining({ streetAddress: '222 Records St', addressCountry: 'CA' })
        }
      })
      expect(body.offices.registeredOffice).toBeUndefined()
      expect(body).not.toHaveProperty('relationships')
    })

    it('sends only the changed directors, keyed by their party id', async () => {
      await store.init(identifier)
      changeDirectorAddress(store, '123')

      await store.submit(true)

      const body = submitPayload().reviewImportedData
      expect(body).not.toHaveProperty('offices')
      expect(body.relationships).toHaveLength(1)
      const [jane] = body.relationships
      expect(jane.entity).toMatchObject({ identifier: '123', givenName: 'Jane', familyName: 'Director' })
      expect(jane.mailingAddress.streetAddress).toBe('9 New St')
      expect(jane.roles).toEqual([expect.objectContaining({ roleType: RoleType.DIRECTOR })])
    })

    it('sends both sections when both changed', async () => {
      await store.init(identifier)
      fillRecordsOffice(store)
      changeDirectorAddress(store, '456')

      await store.submit(true)

      const body = submitPayload().reviewImportedData
      expect(Object.keys(body.offices)).toEqual([OfficeType.RECORDS])
      expect(body.relationships.map((r: BusinessRelationship) => r.entity.identifier)).toEqual(['456'])
      expect(submitPayload().header.certifiedBy).toBe('Test User')
    })

    it('saves a draft with an empty body when nothing changed yet', async () => {
      await store.init(identifier)

      await store.submit(false)

      expect(draftPayload().reviewImportedData).toEqual({})
      expect(store.draftFilingState.filing.header.filingId).toBe(DRAFT_FILING_ID)
    })
  })

  it('resets the tables and draft state', async () => {
    await store.init(identifier)
    fillRecordsOffice(store)

    store.$reset()

    expect(store.offices).toEqual([])
    expect(store.directors).toEqual([])
    expect(store.hasChanges).toBe(false)
    expect(store.draftFilingState).toEqual({})
  })
})
