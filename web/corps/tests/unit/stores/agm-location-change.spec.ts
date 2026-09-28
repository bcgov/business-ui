/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const identifier = 'BC1234567'
const draftFilingId = 987654
const fullName = 'Test User'

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
  legalName: 'Test AGM Company Inc.',
  legalType: 'BC',
  foundingDate: '2022-01-01T12:00:00+00:00'
}
mockNuxtImport('useBusinessStore', () => () => ({
  business: mockBusiness,
  businessIdentifier: identifier,
  isBaseCompany: vi.fn().mockReturnValue(true)
}))

mockNuxtImport('useFilingModals', () => () => ({
  openGetDraftFilingErrorModal: vi.fn(),
  openInitFilingErrorModal: vi.fn(),
  openSaveFilingErrorModal: vi.fn(),
  openFilingNotAllowedErrorModal: vi.fn()
}))

mockNuxtImport('useConnectAuth', () => () => ({ authUser: { value: { fullName } } }))

const mockIsStaff = ref(false)
mockNuxtImport('useIsStaff', () => () => mockIsStaff)

mockNuxtImport('useConnectAccountStore', () => () => ({
  currentAccount: { id: 123, accountType: AccountType.BASIC }
}))

/** An AGM location change draft filing as returned by legal-api. */
function getDraftMock(
  agmLocationChange: Record<string, unknown> = {},
  header: Record<string, unknown> = {}
) {
  return {
    filing: {
      header: {
        name: FilingType.AGM_LOCATION_CHANGE,
        filingId: draftFilingId,
        status: FilingStatus.DRAFT,
        ...header
      },
      business: { identifier, legalType: 'BC' },
      agmLocationChange
    }
  } as unknown as AgmLocationChangeDraftState
}

describe('useAgmLocationChangeStore', () => {
  let store: ReturnType<typeof useAgmLocationChangeStore>

  beforeEach(() => {
    vi.resetAllMocks()
    setActivePinia(createPinia())
    mockIsStaff.value = false
    store = useAgmLocationChangeStore()
    mockSaveOrUpdateDraftFiling.mockResolvedValue(getDraftMock())
    mockPostFiling.mockResolvedValue(undefined)
  })

  it('initializes with the correct default state', () => {
    expect(store.initializing).toBe(false)
    expect(store.formState.year).toBe('')
    expect(store.formState.reason).toBe('')
    expect(store.formState.agmLocation).toBe('')
  })

  describe('init(businessId, draftId)', () => {
    it('should call initFiling with the correct filing type', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: undefined })

      await store.init(identifier)

      expect(mockInitFiling).toHaveBeenCalledWith(
        identifier,
        FilingType.AGM_LOCATION_CHANGE,
        undefined,
        undefined
      )
    })

    it('should hydrate the form state from a draft filing', async () => {
      mockInitFiling.mockResolvedValue({
        draftFiling: getDraftMock({
          year: '2025',
          reason: 'Meeting held outside BC.',
          agmLocation: 'Vancouver, Alberta, Canada'
        })
      })

      await store.init(identifier, String(draftFilingId))

      expect(store.formState.year).toBe('2025')
      expect(store.formState.reason).toBe('Meeting held outside BC.')
      expect(store.formState.agmLocation).toBe('Vancouver, Alberta, Canada')
      expect(store.initializing).toBe(false)
    })

    it('should have authorization in form state for staff', async () => {
      mockIsStaff.value = true
      store.$reset()
      mockInitFiling.mockResolvedValue({
        draftFiling: getDraftMock({ year: '2025', reason: 'Reason', agmLocation: 'Location' })
      })

      await store.init(identifier, String(draftFilingId))

      expect((store.formState as any).authorization).toBeDefined()
    })

    it('should set the initial form state for change detection', async () => {
      mockInitFiling.mockResolvedValue({
        draftFiling: getDraftMock({ year: '2025', reason: 'Some reason', agmLocation: 'Edmonton, Alberta, Canada' })
      })

      await store.init(identifier, String(draftFilingId))

      expect(store.initialFormState).toEqual(store.formState)
      expect(store.initialFormState).not.toBe(store.formState)
    })

    it('should remain at defaults when no draft filing is returned', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: undefined })

      await store.init(identifier)

      expect(store.initializing).toBe(false)
      expect(store.formState.year).toBe('')
      expect(store.formState.reason).toBe('')
      expect(store.formState.agmLocation).toBe('')
    })
  })

  describe('submit(isSubmission)', () => {
    /** Init with a draft, then apply form state edits. */
    async function initAndEdit(overrides: Partial<{ year: string, reason: string, agmLocation: string }> = {}) {
      mockInitFiling.mockResolvedValue({
        draftFiling: getDraftMock({ year: '2025', reason: 'Test reason', agmLocation: 'Calgary, Alberta, Canada' })
      })
      await store.init(identifier, String(draftFilingId))
      Object.assign(store.formState, overrides)
    }

    const getPayload = () => mockSaveOrUpdateDraftFiling.mock.calls[0]![1]

    it('should update the existing draft when a draftId is set', async () => {
      await initAndEdit()

      await store.submit(true)

      expect(mockPostFiling).not.toHaveBeenCalled()
      expect(mockSaveOrUpdateDraftFiling).toHaveBeenCalledWith(
        identifier,
        expect.any(Object),
        true,
        draftFilingId
      )
    })

    it('should post a new filing when no draft exists', async () => {
      mockInitFiling.mockResolvedValue({ draftFiling: undefined })
      await store.init(identifier)
      Object.assign(store.formState, { year: '2025', reason: 'Test reason', agmLocation: 'Location' })

      await store.submit(true)

      expect(mockSaveOrUpdateDraftFiling).not.toHaveBeenCalled()
      expect(mockPostFiling).toHaveBeenCalledWith(identifier, expect.any(Object))
    })

    it('should save a draft when not submitting', async () => {
      await initAndEdit()

      await store.submit(false)

      expect(mockSaveOrUpdateDraftFiling).toHaveBeenCalledWith(
        identifier,
        expect.any(Object),
        false,
        draftFilingId
      )
    })

    it('should build the correct agmLocationChange payload', async () => {
      await initAndEdit({ year: '2024', reason: 'Board decision', agmLocation: 'Toronto, Ontario, Canada' })

      await store.submit(true)

      expect(getPayload().filing.agmLocationChange).toEqual({
        year: '2024',
        reason: 'Board decision',
        agmLocation: 'Toronto, Ontario, Canada'
      })
    })

    it('should set header name and certifiedBy', async () => {
      await initAndEdit()

      await store.submit(true)

      const header = getPayload().filing.header
      expect(header.name).toBe(FilingType.AGM_LOCATION_CHANGE)
      expect(header.certifiedBy).toBe(fullName)
      expect(header.date).toBeTruthy()
    })

    it('should not include staff payment fields in the header', async () => {
      await initAndEdit()

      await store.submit(true)

      const header = getPayload().filing.header
      expect(header.staffPaymentOption).toBeUndefined()
      expect(header.waiveFees).toBeUndefined()
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
  })

  describe('$reset', () => {
    it('restores schema defaults', async () => {
      mockInitFiling.mockResolvedValue({
        draftFiling: getDraftMock({ year: '2025', reason: 'Some reason', agmLocation: 'Location' })
      })
      await store.init(identifier, String(draftFilingId))

      store.$reset()

      expect(store.formState.year).toBe('')
      expect(store.formState.reason).toBe('')
      expect(store.formState.agmLocation).toBe('')
    })
  })
})
