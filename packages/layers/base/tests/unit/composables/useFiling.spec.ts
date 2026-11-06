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
  getAndValidateDraftFiling: vi.fn(),
  getFilingChanges: vi.fn(),
  getResolutions: vi.fn(),
  getAddresses: vi.fn(),
  getShareClasses: vi.fn(),
  getNameTranslations: vi.fn()
}
mockNuxtImport('useBusinessService', () => () => mockBusinessService)

const mockGetFeatureFlag = vi.fn().mockResolvedValue(false)
mockNuxtImport('useConnectLaunchDarkly', () => () => ({ getFeatureFlag: mockGetFeatureFlag }))

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
          { parties: { roleClass: RoleClass.OFFICER } }
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
          { draftId, parties: { roleClass: RoleClass.OFFICER } }
        )

        expect(mockErrorModalOpen).not.toHaveBeenCalled()
        expect(mockBusinessService.getAndValidateDraftFiling).toHaveBeenCalledTimes(1)
        expect(mockBusinessService.getParties).toHaveBeenCalledTimes(1)
        expect(draftFiling).toBeDefined()
        expect(parties).toBeDefined()
        expect(draftFiling).toEqual(draftFilingMock)
      })

      test('should force fresh data and rebase the draft against the changes report', async () => {
        const currentPartyId = String(partiesMock.parties[0]!.officer.id)
        const draftRelationship = draftFilingMock.filing.changeOfOfficers.relationships[0]
        mockBusinessService.getFilingChanges.mockResolvedValue({
          baseTransactionId: 10,
          currentTransactionId: 12,
          upToDate: false,
          interveningFilings: [],
          businessChanges: {},
          changedSections: ['parties'],
          draftSections: ['parties'],
          conflicts: [{
            section: 'parties',
            entityKey: 'TEST, NEW',
            rowId: Number(currentPartyId),
            paths: ['/deliveryAddress/addressCity'],
            baseValue: {},
            currentValue: {},
            draftValue: draftRelationship
          }],
          alreadyApplied: [],
          absorbed: [],
          staleIds: { parties: [], nameTranslations: [], resolutions: [] }
        })

        const { draftFiling, parties } = await useFiling().initFiling(
          identifier,
          FilingType.CHANGE_OF_OFFICERS,
          { draftId, parties: { roleClass: RoleClass.OFFICER } }
        )

        expect(mockErrorModalOpen).not.toHaveBeenCalled()
        // the draft and the parties are fetched fresh
        expect(mockBusinessService.getAndValidateDraftFiling)
          .toHaveBeenCalledWith(identifier, draftId, FilingType.CHANGE_OF_OFFICERS, true)
        expect(mockBusinessService.getParties).toHaveBeenCalledWith(identifier, expect.any(Object), true)
        expect(mockBusinessInit).toHaveBeenCalledWith(identifier, false, false, true, true)
        expect(mockBusinessService.getFilingChanges).toHaveBeenCalledWith(identifier, draftId)
        // the conflicted draft edit is gone, the current row is tagged, the save will carry the base
        expect(draftFiling!.filing.changeOfOfficers!.relationships).toEqual([])
        expect(parties!.find(p => p.new.id === currentPartyId)!.modifiedByStaff).toBe(true)
        expect(parties!.filter(p => p.modifiedByStaff)).toHaveLength(1)
        expect(useDraftRebase().getSaveOptions()).toEqual({ baseTransactionId: 12 })
      })

      test('should leave the draft alone when rebase is not enabled for the filing', async () => {
        // the API 404s the changes report when the feature is off for this filing type
        mockBusinessService.getFilingChanges.mockRejectedValue(new Error('Not Found'))
        const { draftFiling, parties } = await useFiling().initFiling(
          identifier,
          FilingType.CHANGE_OF_OFFICERS,
          { draftId, parties: { roleClass: RoleClass.OFFICER } }
        )

        expect(mockBusinessService.getFilingChanges).toHaveBeenCalledOnce()
        expect(draftFiling).toEqual(draftFilingMock)
        expect(parties!.some(p => p.modifiedByStaff)).toBe(false)
        expect(useDraftRebase().getSaveOptions()).toBeUndefined()
      })

      test('should merge the draft relationships over the fresh parties', async () => {
        const currentPartyId = String(partiesMock.parties[0]!.officer.id)
        const draftRelationship = {
          ...draftFilingMock.filing.changeOfOfficers.relationships[0],
          entity: {
            ...draftFilingMock.filing.changeOfOfficers.relationships[0].entity,
            identifier: currentPartyId,
            givenName: 'Rebased'
          },
          actions: ['NAME_CHANGED']
        }
        mockBusinessService.getAndValidateDraftFiling.mockResolvedValue({
          ...draftFilingMock,
          filing: { ...draftFilingMock.filing, changeOfOfficers: { relationships: [draftRelationship] } }
        })
        mockBusinessService.getFilingChanges.mockRejectedValue(new Error('Not Found'))

        const { parties, draftBody } = await useFiling().initFiling(
          identifier,
          FilingType.CHANGE_OF_OFFICERS,
          { draftId, parties: { roleClass: RoleClass.OFFICER } }
        )

        const merged = parties!.find(p => p.new.id === currentPartyId)!
        expect(merged.new.name.firstName).toBe('Rebased')
        expect(merged.new.actions).toEqual(['NAME_CHANGED'])
        expect(merged.old?.name.firstName).not.toBe('Rebased')
        expect(parties!.filter(p => p.new.actions.length)).toHaveLength(1)
        expect(draftBody).toEqual({ relationships: [draftRelationship] })
      })

      test('should merge the draft offices over the fresh addresses, untouched offices pass through', async () => {
        const address = {
          streetAddress: '1 Old St',
          addressCity: 'Victoria',
          addressRegion: 'BC',
          postalCode: 'V8V 8V8',
          addressCountry: 'CA'
        }
        mockBusinessService.getAddresses.mockResolvedValue({
          registeredOffice: { deliveryAddress: address, mailingAddress: address },
          recordsOffice: { deliveryAddress: address, mailingAddress: address }
        })
        mockBusinessService.getAndValidateDraftFiling.mockResolvedValue({
          ...draftFilingMock,
          filing: {
            ...draftFilingMock.filing,
            changeOfAddress: {
              offices: {
                registeredOffice: {
                  deliveryAddress: { ...address, streetAddress: '2 New St' },
                  mailingAddress: address
                }
              }
            }
          }
        })
        mockBusinessService.getFilingChanges.mockRejectedValue(new Error('Not Found'))

        const { addresses } = await useFiling().initFiling(
          identifier,
          FilingType.CHANGE_OF_ADDRESS,
          { draftId, offices: [OfficeType.REGISTERED, OfficeType.RECORDS] }
        )

        expect(mockBusinessService.getAddresses).toHaveBeenCalledWith(identifier, undefined, true)
        const registered = addresses!.find(o => o.new.type === OfficeType.REGISTERED)!
        expect(registered.new.address.deliveryAddress.street).toBe('2 New St')
        expect(registered.new.actions).toEqual([ActionType.CHANGED])
        expect(registered.old?.address.deliveryAddress.street).toBe('1 Old St')
        const records = addresses!.find(o => o.new.type === OfficeType.RECORDS)!
        expect(records.new.actions).toEqual([])
      })

      test('should leave read-only offices on the current addresses when mergeDraftOffices is false', async () => {
        const address = {
          streetAddress: '1 Old St',
          addressCity: 'Victoria',
          addressRegion: 'BC',
          postalCode: 'V8V 8V8',
          addressCountry: 'CA'
        }
        mockBusinessService.getAddresses.mockResolvedValue({
          registeredOffice: { deliveryAddress: address, mailingAddress: address }
        })
        mockBusinessService.getAndValidateDraftFiling.mockResolvedValue({
          ...draftFilingMock,
          filing: {
            ...draftFilingMock.filing,
            transition: {
              offices: {
                registeredOffice: {
                  deliveryAddress: { ...address, streetAddress: '2 Stale St' },
                  mailingAddress: address
                }
              }
            }
          }
        })
        mockBusinessService.getFilingChanges.mockRejectedValue(new Error('Not Found'))

        const { addresses } = await useFiling().initFiling(
          identifier,
          FilingType.TRANSITION,
          { draftId, offices: [OfficeType.REGISTERED], mergeDraftOffices: false }
        )

        expect(addresses![0]!.new.address.deliveryAddress.street).toBe('1 Old St')
        expect(addresses![0]!.new.actions).toEqual([])
      })

      test('should open the openGetDraftFilingErrorModal if the draft filing is not valid', async () => {
        mockBusinessService.getAndValidateDraftFiling.mockRejectedValue(new Error('invalid-draft-filing'))

        await useFiling().initFiling(
          identifier,
          FilingType.CHANGE_OF_OFFICERS,
          { draftId, parties: { roleClass: RoleClass.OFFICER } }
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

  describe('formatFilingPayloadApi', () => {
    const business = {
      identifier: 'BC123',
      foundingDate: '2022-01-01T12:00:00Z',
      legalName: 'Test Inc',
      legalType: 'BC'
    } as BusinessData

    test('should construct a valid payload for a single filing type', () => {
      const filingName = FilingType.CHANGE_OF_OFFICERS
      const payload = { relationships: [{ entity: { givenName: 'Test' } }] }

      const result = useFiling().formatFilingPayloadApi(business, filingName, { [filingName]: payload })

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

      const result = useFiling().formatFilingPayloadApi(business, FilingType.CHANGE_OF_OFFICERS, filings)
      const filing = result.filing

      expect(filing.header.name).toBe('changeOfOfficers')

      // filing data
      expect(filing).toHaveProperty('changeOfOfficers')
      expect(filing).toHaveProperty('changeOfAddress')
      expect(filing.changeOfAddress.deliveryAddress.street).toBe('123 Main')
    })
  })
})
