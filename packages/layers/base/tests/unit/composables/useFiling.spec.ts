import { describe, test, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { getBusinessMock, getBusinessSettingsMock } from '#testMocks/business'
import { getPermissionsMock } from '#testMocks/business-permissions'
import { getPartiesMock } from '#testMocks/parties'
import { getFilingMock } from '#testMocks/filing'

const identifier = 'BC1234567'

const mockLegalApi = {
  getAuthInfo: vi.fn(),
  getAuthorizedActions: vi.fn(),
  getBusiness: vi.fn(),
  getParties: vi.fn(),
  getAndValidateDraftFiling: vi.fn()
}
mockNuxtImport('useBusinessApi', () => () => mockLegalApi)

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

describe('useFiling', () => {
  beforeEach(async () => {
    vi.resetAllMocks()
  })

  describe('initFiling', () => {
    let businessStore: ReturnType<typeof useBusinessStore>
    let businessPermissionsStore: ReturnType<typeof useBusinessPermissionsStore>
    const businessMock = getBusinessMock([{ key: 'identifier', value: identifier }])
    const businessPermissionsMock = getPermissionsMock()
    const businessSettingsMock = getBusinessSettingsMock()
    const partiesMock = getPartiesMock()
    const draftFilingMock = getFilingMock()

    beforeEach(async () => {
      vi.resetAllMocks()
      const pinia = createPinia()
      setActivePinia(pinia)
      businessStore = useBusinessStore()
      businessStore.$reset()
      businessPermissionsStore = useBusinessPermissionsStore()
      businessPermissionsStore.$reset()
      mockLegalApi.getBusiness.mockResolvedValue(
        {
          data: { value: businessMock },
          error: { undefined },
          status: { value: 'success' },
          refresh: async () => ({})
        }
      )
      mockLegalApi.getAuthInfo.mockResolvedValue(
        {
          data: { value: businessSettingsMock },
          error: { value: undefined },
          status: { value: 'success' },
          refresh: async () => ({})
        }
      )
      mockLegalApi.getParties.mockResolvedValue(
        {
          data: { value: partiesMock },
          error: { value: undefined },
          status: { value: 'success' },
          refresh: async () => ({ data: partiesMock })
        }
      )
      mockLegalApi.getAndValidateDraftFiling.mockResolvedValue(
        {
          data: { value: draftFilingMock },
          error: { value: undefined },
          status: { value: 'success' },
          refresh: async () => ({})
        }
      )
      mockLegalApi.getAuthorizedActions.mockResolvedValue(businessPermissionsMock)
    })
    describe('when initializing a filing (non draft)', () => {
      test('should initialize business, permissions, fee, and filing tombstone data', async () => {
        // init
        const { draftFiling, parties } = await useFiling().initFiling(identifier, FilingType.CHANGE_OF_OFFICERS)

        // assert
        expect(mockErrorModalOpen).not.toHaveBeenCalled()
        expect(mockLegalApi.getAndValidateDraftFiling).not.toHaveBeenCalled()
        expect(mockLegalApi.getParties).not.toHaveBeenCalled()
        expect(draftFiling).toBeUndefined()
        expect(parties).toBeUndefined()
        // business store
        expect(businessStore.business).toBeDefined()
        expect(businessStore.businessName).toBe(businessMock.business.legalName)
        expect(businessStore.businessIdentifier).toBe(identifier)
        expect(businessStore.businessFolio).toBe(businessSettingsMock.folioNumber)
        expect(businessStore.businessContact).toEqual(businessSettingsMock.contacts[0])
        // business permissions store
        expect(businessPermissionsStore.authorizedActions).toEqual(businessPermissionsMock)
        // tombstone
        const { businessTombstone } = useBusinessTombstone()
        expect(businessTombstone.value.title.text).toBe(businessStore.businessName)
        expect(businessTombstone.value.subtitles).toEqual([{ text: 'BC Limited Company' }])
        expect(businessTombstone.value.details).toEqual([])
        expect(businessTombstone.value.sideDetails).toEqual([
          { label: 'Business Number', value: '882156342BC0001' },
          { label: 'Incorporation Number', value: identifier },
          { label: 'Email', value: 'fake.email@gov.bc.ca' },
          { label: 'Phone', value: '(778) 996-7591' }
        ])
      })

      test('should return parties when applicaple', async () => {
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
        expect(mockLegalApi.getAndValidateDraftFiling).not.toHaveBeenCalled()
        expect(mockLegalApi.getParties).toHaveBeenCalledTimes(1)
        expect(parties).toBeDefined()
        expect(parties!.data!.length).toBe(partiesMock.parties.length)
        // Existing should have new and old entry
        expect(parties!.data![0]!.new).toBeDefined()
        expect(parties!.data![0]!.old).toBeDefined()
        // should have empty actions added
        expect(parties!.data![0]!.new.actions.length).toBe(0)
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
        expect(mockLegalApi.getAndValidateDraftFiling).toHaveBeenCalledTimes(1)
        expect(mockLegalApi.getParties).toHaveBeenCalledTimes(1)
        expect(draftFiling).toBeDefined()
        expect(parties).toBeDefined()
        expect(draftFiling!.data!.value).toEqual(draftFilingMock)
      })

      test('should open the openGetDraftFilingErrorModal if the draft filing is not valid', async () => {
        mockLegalApi.getAndValidateDraftFiling.mockRejectedValue(new Error('invalid-draft-filing'))

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
})
