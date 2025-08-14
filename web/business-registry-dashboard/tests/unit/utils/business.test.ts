import { describe, expect, it, vi, afterEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { FilingTypes, AmalgamationTypes } from '@bcrs-shared-components/enums'

mockNuxtImport('useKeycloak', () => {
  return () => (
    {
      getToken: vi.fn().mockResolvedValue('123')
    }
  )
})

const mockGetStoredFlag = vi.fn()
mockNuxtImport('useConnectLaunchdarklyStore', () => {
  return () => (
    {
      getStoredFlag: mockGetStoredFlag
    }
  )
})

// Mock useConnectAccountStore for the legal-api plugin
mockNuxtImport('useConnectAccountStore', () => {
  return () => ({
    currentAccount: {
      id: '12345'
    }
  })
})

// Mock useNuxtApp to provide the plugins
const mockLegalApi = vi.fn()
const mockAuthApi = vi.fn()
mockNuxtImport('useNuxtApp', () => {
  return () => ({
    $legalApi: mockLegalApi,
    $authApiBRD: mockAuthApi
  })
})

describe('business utils', () => {
  describe('determineDisplayName', () => {
    it('should return the legal name when alternate names are disabled', () => {
      const result = determineDisplayName('Legal Name', undefined, undefined, undefined)
      expect(result).toBe('Legal Name')
    })

    it('should return the correct alternate name if legal type is SOLE_PROP and name matches identifier with LDFlags.AlternateNamesMbr = true', () => {
      mockGetStoredFlag.mockReturnValue(true) // set LDFlags.AlternateNamesMbr to true
      const alternateNames = [{ identifier: '12345', name: 'Alternate Name' }]
      const result = determineDisplayName('Legal Name', CorpTypes.SOLE_PROP, '12345', alternateNames)
      expect(result).toBe('Alternate Name')
    })

    it('should return an empty string if no matching alternate name is found for SOLE_PROP with LDFlags.AlternateNamesMbr = true', () => {
      mockGetStoredFlag.mockReturnValue(true) // set LDFlags.AlternateNamesMbr to true
      const alternateNames = [{ identifier: '67890', name: 'Alternate Name' }]
      const result = determineDisplayName('Legal Name', CorpTypes.SOLE_PROP, '12345', alternateNames)
      expect(result).toBe('')
    })

    it('should return the legal name when legalType is not SOLE_PROP or PARTNERSHIP', () => {
      const result = determineDisplayName('Legal Name', CorpTypes.BC_COMPANY, '12345', [])
      expect(result).toBe('Legal Name')
    })
  })

  describe('buildBusinessObject', () => {
    it('should correctly build a Business object from AffiliationResponse', () => {
      const response: AffiliationResponse = {
        identifier: 'BC1234567',
        businessNumber: '123456789',
        legalName: 'Legal Name',
        legalType: CorpTypes.BC_COMPANY,
        draftType: undefined,
        alternateNames: [],
        contacts: [{ email: 'test@example.com', phone: '1234567890', phoneExtension: '' }],
        folioNumber: 'FOLIO123',
        lastModified: '2024-07-09',
        modified: '2024-07-10',
        modifiedBy: 'User',
        nrNumber: 'NR1234567',
        adminFreeze: false,
        goodStanding: true,
        state: 'Active'
      }

      const result = buildBusinessObject(response)

      expect(result).toEqual({
        businessIdentifier: 'BC1234567',
        businessNumber: '123456789',
        name: 'Legal Name',
        corpType: { code: 'BC' },
        corpSubType: { code: 'BC' },
        contacts: [{ email: 'test@example.com', phone: '1234567890', phoneExtension: '' }],
        folioNumber: 'FOLIO123',
        lastModified: '2024-07-09',
        modified: '2024-07-10',
        modifiedBy: 'User',
        nrNumber: 'NR1234567',
        adminFreeze: false,
        goodStanding: true,
        status: 'Active'
      })
    })

    it('should handle missing optional fields correctly', () => {
      const response: AffiliationResponse = {
        identifier: 'BC1234567',
        legalName: 'Legal Name',
        legalType: CorpTypes.BC_COMPANY
      }

      const result = buildBusinessObject(response)

      expect(result).toEqual({
        businessIdentifier: 'BC1234567',
        name: 'Legal Name',
        corpType: { code: 'BC' },
        corpSubType: { code: 'BC' },
        adminFreeze: false,
        goodStanding: true
      })
    })
  })

  describe('isOtherEntities', () => {
    it('should return true if business is of a financial type', () => {
      const business: Business = { corpType: { code: CorpTypes.FINANCIAL }, businessIdentifier: '123' }
      expect(isOtherEntities(business)).toBe(true)
    })

    it('should return false if business is not of a financial type', () => {
      const business: Business = { corpType: { code: CorpTypes.BC_COMPANY }, businessIdentifier: '123' }
      expect(isOtherEntities(business)).toBe(false)
    })
  })

  describe('isForRestore', () => {
    it('should return true if business is for restore', () => {
      const business: Business = { corpType: { code: CorpTypes.BC_COMPANY }, businessIdentifier: '123' }
      expect(isForRestore(business)).toBe(true)
    })

    it('should return false if business is not for restore', () => {
      const business: Business = { corpType: { code: CorpTypes.FINANCIAL }, businessIdentifier: '123' }
      expect(isForRestore(business)).toBe(false)
    })
  })

  describe('isSocieties', () => {
    it('should return true if business is a society', () => {
      const business: Business = { corpType: { code: CorpTypes.SOCIETY }, businessIdentifier: '123' }
      expect(isSocieties(business)).toBe(true)
    })

    it('should return false if business is not a society', () => {
      const business: Business = { corpType: { code: CorpTypes.BC_COMPANY }, businessIdentifier: '123' }
      expect(isSocieties(business)).toBe(false)
    })
  })

  describe('isModernizedEntity', () => {
    it('should return true if entity type is in the supported list', () => {
      mockGetStoredFlag.mockReturnValue('BC')
      const business: Business = { corpType: { code: CorpTypes.BC_COMPANY }, businessIdentifier: '123' }
      expect(isModernizedEntity(business)).toBe(true)
    })

    it('should return false if entity type is not in the supported list', () => {
      // @ts-expect-error
      const business: Business = { corpType: { code: 'UNKNOWN' } }
      expect(isModernizedEntity(business)).toBe(false)
    })
  })

  describe('isSupportedAmalgamationEntities', () => {
    it('should return true if entity type supports amalgamation', () => {
      mockGetStoredFlag.mockReturnValue('BC')
      const business: Business = { corpType: { code: CorpTypes.BC_COMPANY }, businessIdentifier: '123' }
      expect(isSupportedAmalgamationEntities(business)).toBe(true)
    })

    it('should return false if entity type does not support amalgamation', () => {
      // @ts-expect-error
      const business: Business = { corpType: { code: 'UNKNOWN' } }
      expect(isSupportedAmalgamationEntities(business)).toBe(false)
    })
  })

  describe('isSupportedContinuationInEntities', () => {
    it('should return true if entity type supports continuation in', () => {
      mockGetStoredFlag.mockReturnValue('C')
      const business: Business = { corpType: { code: CorpTypes.CONTINUE_IN }, businessIdentifier: '123' }
      expect(isSupportedContinuationInEntities(business)).toBe(true)
    })

    it('should return false if entity type does not support continuation in', () => {
      // @ts-expect-error
      const business: Business = { corpType: { code: 'UNKNOWN' }, businessIdentifier: '123' }
      expect(isSupportedContinuationInEntities(business)).toBe(false)
    })
  })

  describe('isSupportedRestorationEntities', () => {
    it('should return true if entity type supports restoration', () => {
      const business: Business = { corpType: { code: CorpTypes.BC_COMPANY }, businessIdentifier: '123' }
      expect(isSupportedRestorationEntities(business)).toBe(false)
    })
  })

  describe('createNamedBusiness', () => {
    afterEach(() => {
      vi.clearAllMocks()
    })

    it('should throw an error if nameRequest is missing', async () => {
      const business = { corpType: { code: CorpTypes.BC_COMPANY } } as Business
      await expect(createNamedBusiness({ filingType: FilingTypes.INCORPORATION_APPLICATION, business }))
        .rejects
        .toThrow('Name request is required to create a named business')
    })

    it('should create a draft filing for an amalgamation application', async () => {
      const mockResponse = { filing: { business: { identifier: 'BC1234567' } } }

      // Mock the $legalApi call to succeed
      mockLegalApi.mockResolvedValue(mockResponse)
      // Ensure the flag is off so it uses legalApiUrl
      mockGetStoredFlag.mockReturnValue(false)

      const business = {
        corpType: { code: CorpTypes.BC_COMPANY },
        nameRequest: { legalType: CorpTypes.BC_COMPANY, nrNumber: 'NR1234567' }
      } as Business

      const response = await createNamedBusiness({ filingType: FilingTypes.AMALGAMATION_APPLICATION, business })

      expect(mockLegalApi).toHaveBeenCalledWith('/businesses?draft=true', expect.objectContaining({
        method: 'POST',
        body: expect.objectContaining({
          filing: expect.objectContaining({
            amalgamationApplication: expect.objectContaining({
              type: AmalgamationTypes.REGULAR,
              nameRequest: expect.objectContaining({
                nrNumber: 'NR1234567'
              })
            })
          })
        })
      }))
      expect(response).toEqual(mockResponse)
    })

    it('should attempt to delete affiliation if draft creation fails', async () => {
      // Mock the $legalApi call to return undefined (simulating failure)
      mockLegalApi.mockResolvedValue(undefined)
      mockAuthApi.mockResolvedValue({})
      // Ensure the flag is off so it uses legalApiUrl
      mockGetStoredFlag.mockReturnValue(false)

      const business = {
        businessIdentifier: 'BC1234567',
        corpType: { code: CorpTypes.BC_COMPANY },
        nameRequest: { legalType: CorpTypes.BC_COMPANY, nrNumber: 'BC1234567' }
      } as Business

      const response = await createNamedBusiness({ filingType: FilingTypes.AMALGAMATION_APPLICATION, business })

      // Verify both API calls were made
      expect(mockLegalApi).toHaveBeenCalledWith('/businesses?draft=true', expect.any(Object))
      expect(mockAuthApi).toHaveBeenCalledWith('/orgs/12345/affiliations/BC1234567', expect.objectContaining({
        method: 'DELETE',
        body: expect.objectContaining({
          data: expect.objectContaining({
            logDeleteDraft: true,
            passcodeResetEmail: undefined,
            resetPasscode: false
          })
        })
      }))
      expect(response).toEqual({ errorMsg: 'Cannot add business due to some technical reasons' })
    })
  })
})
