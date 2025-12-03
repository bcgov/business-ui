// tests/stores/useLiquidatorStore.spec.ts
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { reactive, ref } from 'vue'

// Route (for businessId & draft)
const identifier = 'BC1234567'

const mockRoute = reactive({
  params: { businessId: identifier },
  query: {} as { draft?: string }
})
mockNuxtImport('useRoute', () => () => mockRoute)

// Manage Parties (table state)
const tableStateRef = ref<[]>([])
mockNuxtImport('useManageParties', () => () => ({
  tableState: tableStateRef
}))

// Business API
const mockCreateFilingPayload = vi.fn((business, filingType, body, staffPayment) => ({
  business,
  filingType,
  body,
  staffPayment
}))
const mockSaveOrUpdateDraftFiling = vi.fn()
const mockPostFiling = vi.fn()

const mockBusinessApi = {
  createFilingPayload: mockCreateFilingPayload,
  saveOrUpdateDraftFiling: mockSaveOrUpdateDraftFiling,
  postFiling: mockPostFiling
}
mockNuxtImport('useBusinessApi', () => () => mockBusinessApi)

// Filing init (draft + parties)
const mockUseFiling = {
  initFiling: vi.fn()
}
mockNuxtImport('useFiling', () => () => mockUseFiling)

// Business Store
const businessIdentifier = 'BC123'
const mockBusiness = {
  identifier: businessIdentifier,
  legalName: 'Test Inc.',
  legalType: 'CC'
}
mockNuxtImport('useBusinessStore', () => () => ({
  business: ref(mockBusiness),
  businessIdentifier
}))

// Liquidators schema
const mockSchemaDefault = {
  courtOrder: { hasPoa: false, courtOrderNumber: '' },
  documentId: { documentIdNumber: '' },
  staffPayment: {
    option: 'NONE',
    bcolAccountNumber: '',
    datNumber: '',
    routingSlipNumber: '',
    folioNumber: '',
    isPriority: false
  },
  activeParty: undefined
}
const parseFn = vi.fn(() => ({ ...mockSchemaDefault }))
mockNuxtImport('getLiquidatorsSchema', () => () => ({ parse: parseFn }))

describe('useLiquidatorStore', () => {
  let store: ReturnType<typeof useLiquidatorStore>

  beforeEach(() => {
    vi.resetAllMocks()
    const pinia = createPinia()
    setActivePinia(pinia)
    store = useLiquidatorStore()
    store.$reset()

    // Reset table
    tableStateRef.value = []
    // Reset route params and query
    mockRoute.params.businessId = businessIdentifier
    mockRoute.query = {}
  })

  // Default state
  test('initializes with the correct default state', () => {
    expect(store.initializing).toBe(false)
    expect(store.formState).toEqual(mockSchemaDefault)
  })

  // init(businessId, draftId?)
  describe('init(businessId, draftId?)', () => {
    const partiesResponse = { data: [{ new: { id: 1, name: 'Initial L' } }] }

    describe('when starting a new filing (no draftId)', () => {
      test('should set table from parties and keep defaults in formState', async () => {
        // mock filing.initFiling without draft
        mockUseFiling.initFiling.mockResolvedValue({
          draftFiling: undefined,
          parties: { data: partiesResponse.data }
        })

        await store.init(businessIdentifier)

        expect(store.initializing).toBe(false)
        expect(tableStateRef.value).toEqual(partiesResponse.data)
        expect(store.formState).toEqual(mockSchemaDefault)
      })

      test('should set empty table when API returns no parties', async () => {
        mockUseFiling.initFiling.mockResolvedValue({
          draftFiling: undefined,
          parties: { data: [] }
        })

        await store.init(businessIdentifier)
        expect(tableStateRef.value).toEqual([])
      })
    })

    describe('when loading a draft filing', () => {
      const draftId = 'draft123'

      test('should populate form and table from draft filing', async () => {
        const draft = {
          filing: {
            courtOrder: { hasPoa: true, courtOrderNumber: 'CO-1' },
            staffPayment: { option: 'BCOL' },
            parties: [{ new: { id: 99, name: 'Draft L' } }]
          }
        }

        mockUseFiling.initFiling.mockResolvedValue({
          draftFiling: {
            data: { value: draft },
            error: { value: undefined },
            status: { value: 'success' }
          },
          parties: { data: partiesResponse.data }
        })

        await store.init(businessIdentifier, draftId)

        expect(store.formState.courtOrder).toEqual(draft.filing.courtOrder)
        expect(store.formState.staffPayment).toEqual(draft.filing.staffPayment)
        expect(tableStateRef.value).toEqual(draft.filing.parties)
      })

      test('falls back to parties when draft has no filing data', async () => {
        mockUseFiling.initFiling.mockResolvedValue({
          draftFiling: {
            data: { value: {} },
            error: { value: undefined },
            status: { value: 'success' }
          },
          parties: { data: partiesResponse.data }
        })

        await store.init(businessIdentifier, draftId)
        expect(tableStateRef.value).toEqual(partiesResponse.data)
      })
    })
  })

  // save(draftId?) Skipping until Submission
  describe.skip('save(draftId?)', () => {
    test('should build payload and save/update draft', async () => {
      tableStateRef.value = [{ new: { id: 'A' } }, { new: { id: 'B' } }]
      store.formState.staffPayment = { option: 'NONE' }

      const draftId = 'd-123'

      await store.save(draftId)

      // payload wrapper should use your store's payload key
      expect(mockCreateFilingPayload).toHaveBeenCalledWith(
        mockBusiness,
        expect.anything(), // filingType (do not assert enum)
        {
          changeOfLiquidators: {
            ...store.formState,
            parties: tableStateRef.value
          }
        },
        store.formState.staffPayment
      )

      expect(mockSaveOrUpdateDraftFiling).toHaveBeenCalledWith(
        businessIdentifier,
        expect.any(Object),
        false,
        draftId
      )
    })

    test('should still save when draftId is undefined', async () => {
      await store.save(undefined)
      expect(mockSaveOrUpdateDraftFiling).toHaveBeenCalledWith(
        businessIdentifier,
        expect.any(Object),
        false,
        undefined
      )
    })
  })

  // submit(draftId?) Skipping until Submission
  describe.skip('submit(draftId?)', () => {
    test('creates appointed/ceased payloads from actions and updates draft when draftId exists', async () => {
      // Arrange table with action strings (no enum mock)
      tableStateRef.value = [
        { new: { id: 1, actions: ['added'] } },
        { new: { id: 2, actions: ['removed'] } },
        { new: { id: 3, actions: ['added'] } }
      ]

      store.formState.staffPayment = { option: 'NONE' }
      const draftId = 'draft-xyz'

      await store.submit(draftId)

      // Assert payload structure (skip filingType enum)
      expect(mockCreateFilingPayload).toHaveBeenCalledWith(
        mockBusiness,
        expect.anything(),
        {
          changeOfLiquidators: {
            appointedLiquidators: {
              parties: [
                { id: 1, actions: ['added'], formatted: true },
                { id: 3, actions: ['added'], formatted: true }
              ]
            },
            ceasedLiquidators: {
              parties: [
                { id: 2, actions: ['removed'], formatted: true }
              ]
            }
          }
        },
        store.formState.staffPayment
      )

      expect(mockSaveOrUpdateDraftFiling).toHaveBeenCalledWith(
        businessIdentifier,
        expect.any(Object),
        true,
        draftId
      )
      expect(mockPostFiling).not.toHaveBeenCalled()
    })

    test('POSTs filing when no draftId', async () => {
      tableStateRef.value = [{ new: { id: 10, actions: ['added'] } }]
      await store.submit(undefined)
      expect(mockPostFiling).toHaveBeenCalledWith(
        businessIdentifier,
        expect.any(Object)
      )
    })

    test('omits appointed/ceased sections when there are no matching actions', async () => {
      tableStateRef.value = [{ new: { id: 10, actions: [] } }]

      await store.submit('d1')

      const bodyArg = mockCreateFilingPayload.mock.calls.at(-1)?.[2]
      expect(bodyArg).toEqual({
        changeOfLiquidators: {}
      })
    })
  })

  // $reset()
  describe('$reset', () => {
    test('restores defaults from schema', () => {
      // mutate form state
      store.formState.courtOrder = { hasPoa: true }
      store.formState.staffPayment = { option: 'BCOL' }
      store.formState.activeParty = { id: 'X' }

      store.$reset()

      expect(parseFn).toHaveBeenCalledWith({})
      expect(store.formState).toEqual(mockSchemaDefault)
    })
  })
})
