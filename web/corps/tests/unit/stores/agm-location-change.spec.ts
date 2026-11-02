/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'

const identifier = 'BC1234567'
const draftFilingId = 987654
const fullName = 'Test User'

const mockSaveOrUpdateDraftFiling = vi.fn()
const mockPostFiling = vi.fn()
mockNuxtImport('useBusinessService', () => () => ({
  saveOrUpdateDraftFiling: mockSaveOrUpdateDraftFiling,
  postFiling: mockPostFiling
}))

// NB: only initFiling is mocked - formatFilingPayloadApi runs for real so the submitted
// payload shape (including the filing header) is asserted end to end
const mockInitFiling = vi.fn()
mockNuxtImport('useFiling', original => () => {
  const orig = typeof original === 'function' ? original() : {}
  return {
    ...orig,
    initFiling: mockInitFiling
  }
})

const mockBusiness = {
  identifier,
  legalName: 'Test AGM Company Inc.',
  legalType: 'BC',
  foundingDate: '2022-01-01T12:00:00+00:00'
}

const mockBusinessFolio = { value: '' }
mockNuxtImport('useBusinessStore', original => () => {
  const orig = typeof original === 'function' ? original() : {}
  return {
    ...orig,
    business: mockBusiness,
    businessIdentifier: identifier,
    get businessFolio() {
      return mockBusinessFolio.value
    },
    isBaseCompany: vi.fn().mockReturnValue(true)
  }
})

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
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockIsStaff.value = false
    mockBusinessFolio.value = ''
    store = useAgmLocationChangeStore()
    mockSaveOrUpdateDraftFiling.mockResolvedValue(getDraftMock())
    mockPostFiling.mockResolvedValue(undefined)
  })

  it('initializes with the correct default state', () => {
    expect(store.initializing).toBe(false)
    expect(store.formState.year).toBe('')
    expect(store.formState.reason).toBe('')
    expect(store.formState.agmLocation).toEqual({ country: 'CA', city: '', region: '' })
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
          agmLocation: { country: 'CA', city: 'Calgary', region: 'AB' }
        })
      })

      await store.init(identifier, String(draftFilingId))

      expect(store.formState.year).toBe('2025')
      expect(store.formState.reason).toBe('Meeting held outside BC.')
      expect(store.formState.agmLocation).toEqual({ country: 'CA', city: 'Calgary', region: 'AB' })
      expect(store.initializing).toBe(false)
    })

    it('should hydrate a null region as an empty string', async () => {
      mockInitFiling.mockResolvedValue({
        draftFiling: getDraftMock({
          year: '2025',
          reason: 'Meeting held outside BC.',
          agmLocation: { country: 'GB', city: 'London', region: null }
        })
      })

      await store.init(identifier, String(draftFilingId))

      expect(store.formState.agmLocation).toEqual({ country: 'GB', city: 'London', region: '' })
    })

    it('should have authorization in form state for staff', async () => {
      mockIsStaff.value = true
      store.$reset()
      mockInitFiling.mockResolvedValue({
        draftFiling: getDraftMock({
          year: '2025',
          reason: 'Reason',
          agmLocation: { country: 'CA', city: 'Calgary', region: 'AB' } })
      })

      await store.init(identifier, String(draftFilingId))

      expect((store.formState as any).authorization).toBeDefined()
    })

    it('should set the initial form state for change detection', async () => {
      mockInitFiling.mockResolvedValue({
        draftFiling: getDraftMock({
          year: '2025',
          reason: 'Some reason',
          agmLocation: { country: 'CA', city: 'Edmonton', region: 'Alberta' } })
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
      expect(store.formState.agmLocation).toEqual({ country: 'CA', city: '', region: '' })
    })

    it('should start the folio at the business default folio for a new filing', async () => {
      mockBusinessFolio.value = '777555222'
      mockInitFiling.mockResolvedValue({ draftFiling: undefined })

      await store.init(identifier)

      expect(store.formState.folio).toEqual({ folioNumber: '777555222' })
      expect(store.initialFormState.folio).toEqual({ folioNumber: '777555222' })
    })

    it('should restore the folio saved on a draft', async () => {
      mockBusinessFolio.value = '777555222'
      mockInitFiling.mockResolvedValue({
        draftFiling: getDraftMock({
          year: '2025',
          reason: 'Reason',
          agmLocation: { country: 'CA', city: 'Calgary', region: 'AB' } }, { folioNumber: 'TXN-1' })
      })

      await store.init(identifier, String(draftFilingId))

      expect(store.formState.folio).toEqual({ folioNumber: 'TXN-1' })
    })
  })

  describe('submit(isSubmission)', () => {
    /** Init with a draft, then apply form state edits. */
    async function initAndEdit(
      overrides: Partial<{
        year: string
        reason: string
        agmLocation: typeof store.formState.agmLocation
      }> = {}
    ) {
      mockInitFiling.mockResolvedValue({
        draftFiling: getDraftMock({
          year: '2025',
          reason: 'Test reason',
          agmLocation: { country: 'CA', city: 'Calgary', region: 'Alberta' } })
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
      Object.assign(store.formState, {
        year: '2025',
        reason: 'Test reason',
        agmLocation: { country: 'CA', city: 'Calgary', region: 'Alberta' } })

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
      await initAndEdit({
        year: '2024',
        reason: 'Board decision',
        agmLocation: { country: 'CA', city: 'Toronto', region: 'Ontario' } })

      await store.submit(true)

      expect(getPayload().filing.agmLocationChange).toEqual({
        year: '2024',
        reason: 'Board decision',
        agmLocation: { country: 'CA', city: 'Toronto', region: 'Ontario' }
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

    it('should include authorizationReceived: true in header when non-staff certify is checked', async () => {
      await initAndEdit()
      ;(store.formState as any).certify = { isCertified: true }

      await store.submit(true)

      const header = getPayload().filing.header
      expect(header.authorizationReceived).toBe(true)
    })

    it('should omit authorizationReceived from header when saving a draft', async () => {
      await initAndEdit()
      ;(store.formState as any).certify = { isCertified: true }

      await store.submit(false)

      const header = mockSaveOrUpdateDraftFiling.mock.calls[0]![1].filing.header
      expect(header.authorizationReceived).toBeUndefined()
      expect(header.certifiedBy).toBeTruthy()
    })

    it('should not include staff payment fields in the header', async () => {
      await initAndEdit()

      await store.submit(true)

      const header = getPayload().filing.header
      expect(header.staffPaymentOption).toBeUndefined()
      expect(header.waiveFees).toBeUndefined()
    })

    it.each([
      ['the entered folio', 'TXN-1', '777555222', 'TXN-1'],
      ['the business default folio when the entered one is blank', '', '777555222', '777555222'],
      ['no folio when there is none', '', '', undefined]
    ])('should file %s in the header', async (_, folioNumber, businessFolio, expected) => {
      mockBusinessFolio.value = businessFolio
      await initAndEdit()
      store.formState.folio = { folioNumber }

      await store.submit(true)

      expect(getPayload().filing.header.folioNumber).toBe(expected)
    })

    it('should file the folio for staff too', async () => {
      mockIsStaff.value = true
      store.$reset()
      await initAndEdit()
      store.formState.folio = { folioNumber: 'STAFF-1' }

      await store.submit(true)

      expect(getPayload().filing.header.folioNumber).toBe('STAFF-1')
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
        draftFiling: getDraftMock({
          year: '2025',
          reason: 'Some reason',
          agmLocation: { country: 'CA', city: '', region: '' } })
      })
      await store.init(identifier, String(draftFilingId))

      store.$reset()

      expect(store.formState.year).toBe('')
      expect(store.formState.reason).toBe('')
      expect(store.formState.agmLocation).toEqual({ country: 'CA', city: '', region: '' })
    })
  })
})
