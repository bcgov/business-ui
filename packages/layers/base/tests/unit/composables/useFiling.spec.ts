import { describe, test, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { getBusinessMock, getBusinessSettingsMock } from '#test-mocks/business'
import { getPermissionsMock } from '#test-mocks/business-permissions'
import { getPartiesMock } from '#test-mocks/parties'
import { getFilingMock } from '#test-mocks/filing'
import { setActivePinia, createPinia } from 'pinia'

const mockBusinessInit = vi.fn()
mockNuxtImport('useBusinessStore', () => () => ({
  init: mockBusinessInit,
  isAllowedFiling: vi.fn(() => true)
}))

const mockSetFilingDefault = vi.fn()
mockNuxtImport('useBusinessTombstone', () => () => ({
  setFilingDefault: mockSetFilingDefault
}))

const identifier = 'BC1234567'

const mockBusinessService = {
  getAuthInfo: vi.fn(),
  getAuthorizedActions: vi.fn(),
  getBusiness: vi.fn(),
  getParties: vi.fn(),
  getAndValidateDraftFiling: vi.fn()
}
mockNuxtImport('useBusinessService', () => () => mockBusinessService)

const mockErrorModalOpen = vi.fn()
const mockBaseModalOpen = vi.fn()
mockNuxtImport('useModal', () => {
  return () => ({
    errorModal: {
      open: mockErrorModalOpen
    },
    baseModal: {
      open: mockBaseModalOpen
    }
  })
})

mockNuxtImport('useConnectAccountStore', () => () => ({ currentAccount: { id: 123 } }))

mockNuxtImport('useConnectAuth', () => () => ({ authUser: { value: { fullName: 'Test User' } } }))

describe('useFiling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  describe('initFiling', () => {
    const businessMock = getBusinessMock([{ key: 'identifier', value: identifier }])
    const businessPermissionsMock = getPermissionsMock()
    const businessSettingsMock = getBusinessSettingsMock()
    const partiesMock = getPartiesMock()
    const draftFilingMock = getFilingMock('changeOfOfficers', 'DRAFT')

    beforeEach(async () => {
      vi.clearAllMocks()
      mockBusinessService.getBusiness.mockResolvedValue(businessMock.business)
      mockBusinessService.getAuthInfo.mockResolvedValue(businessSettingsMock)
      mockBusinessService.getParties.mockResolvedValue(partiesMock.parties)
      mockBusinessService.getAndValidateDraftFiling.mockResolvedValue(draftFilingMock)
      mockBusinessService.getAuthorizedActions.mockResolvedValue(businessPermissionsMock.authorizedPermissions)
    })

    describe('when initializing a filing (non draft)', () => {
      test('should initialize business, permissions, fee, and filing tombstone data', async () => {
        // init
        const { draftFiling, parties } = await useFiling().initFiling(identifier, FilingType.CHANGE_OF_OFFICERS)

        // assert
        expect(mockErrorModalOpen).not.toHaveBeenCalled()
        expect(mockBusinessService.getAndValidateDraftFiling).not.toHaveBeenCalled()
        expect(mockBusinessService.getParties).not.toHaveBeenCalled()
        expect(draftFiling).toBeUndefined()
        expect(parties).toBeUndefined()
        // business store
        expect(mockBusinessInit).toHaveBeenCalledOnce()
        expect(mockSetFilingDefault).toHaveBeenCalledOnce()
      })

      test('should return parties when applicable', async () => {
        // init store
        const { parties } = await useFiling().initFiling(
          identifier,
          FilingType.CHANGE_OF_OFFICERS,
          undefined,
          undefined,
          { roleClass: RoleClass.OFFICER }
        )

        // assert
        expect(mockErrorModalOpen).not.toHaveBeenCalled()
        expect(mockBusinessService.getAndValidateDraftFiling).not.toHaveBeenCalled()
        expect(mockBusinessService.getParties).toHaveBeenCalledTimes(1)
        expect(parties).toBeDefined()
        expect(parties!.length).toBe(partiesMock.parties.length)
        // Existing should have new and old entry
        expect(parties![0]!.new).toBeDefined()
        expect(parties![0]!.old).toBeDefined()
        // should have empty actions added
        expect(parties![0]!.new.actions.length).toBe(0)
      })
    })

    // Loading from a draft filing
    describe('when initializing a draft filing', () => {
      const draftId = 'draft123'

      test('should return the mock draft information and getParties should still be called', async () => {
        // init store
        const { draftFiling, parties } = await useFiling().initFiling(
          identifier,
          FilingType.CHANGE_OF_OFFICERS,
          undefined,
          draftId,
          { roleClass: RoleClass.OFFICER }
        )

        expect(mockErrorModalOpen).not.toHaveBeenCalled()
        expect(mockBusinessService.getAndValidateDraftFiling).toHaveBeenCalledTimes(1)
        expect(mockBusinessService.getParties).toHaveBeenCalledTimes(1)
        expect(draftFiling).toBeDefined()
        expect(parties).toBeDefined()
        expect(draftFiling).toEqual(draftFilingMock)
      })

      test('should open the openGetDraftFilingErrorModal if the draft filing is not valid', async () => {
        mockBusinessService.getAndValidateDraftFiling.mockRejectedValue(new Error('invalid-draft-filing'))

        await useFiling().initFiling(
          identifier,
          FilingType.CHANGE_OF_OFFICERS,
          undefined,
          draftId,
          { roleClass: RoleClass.OFFICER }
        )

        expect(mockErrorModalOpen).toHaveBeenCalledOnce()
        expect(mockErrorModalOpen).toHaveBeenCalledWith(expect.objectContaining({
          error: expect.any(Error),
          i18nPrefix: 'modal.error.filing.getDraft',
          buttons: expect.any(Array)
        }))
      })
    })
  })

  describe('createFilingPayload', () => {
    const business = {
      identifier: 'BC123',
      foundingDate: '2022-01-01T12:00:00Z',
      legalName: 'Test Inc',
      legalType: 'BC'
    } as BusinessData

    test('should construct a valid payload for a single filing type', () => {
      const filingName = FilingType.CHANGE_OF_OFFICERS
      const payload = { relationships: [{ entity: { givenName: 'Test' } }] }

      const result = useFiling().createFilingPayload(business, filingName, { [filingName]: payload })

      expect(result).toHaveProperty('filing')
      const filing = result.filing

      expect(filing.header.name).toBe('changeOfOfficers')
      expect(filing.header.certifiedBy).toBe('Test User')
      expect(filing.header.accountId).toBe(123)

      expect(filing.business.identifier).toBe(business.identifier)
      expect(filing.business.foundingDate).toBe(business.foundingDate)
      expect(filing.business.legalName).toBe(business.legalName)
      expect(filing.business.legalType).toBe(business.legalType)

      // filing data
      expect(filing).toHaveProperty('changeOfOfficers')
      expect(filing.changeOfOfficers).toEqual(payload)
    })

    test('should construct a valid payload for multiple filing types', () => {
      const filings = {
        changeOfOfficers: { relationships: [{ entity: { givenName: 'Officer' } }] },
        changeOfAddress: { deliveryAddress: { street: '123 Main' } }
      }

      const result = useFiling().createFilingPayload(business, FilingType.CHANGE_OF_OFFICERS, filings)
      const filing = result.filing

      expect(filing.header.name).toBe('changeOfOfficers')

      // filing data
      expect(filing).toHaveProperty('changeOfOfficers')
      expect(filing).toHaveProperty('changeOfAddress')
      expect(filing.changeOfAddress.deliveryAddress.street).toBe('123 Main')
    })
  })
})
