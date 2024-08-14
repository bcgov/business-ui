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

describe('business utils', () => {
  describe('determineDisplayName', () => {
    it('should return the legal name when alternate names are disabled', () => {
      const result = determineDisplayName('Legal Name', undefined, undefined, undefined)
      expect(result).toBe('Legal Name')
    })

    it('should return the correct alternate name if legal type is SOLE_PROP and name matches identifier', () => {
      const alternateNames = [{ identifier: '12345', name: 'Alternate Name' }]
      const result = determineDisplayName('Legal Name', CorpTypes.SOLE_PROP, '12345', alternateNames)
      expect(result).toBe('Alternate Name')
    })

    it('should return an empty string if no matching alternate name is found for SOLE_PROP', () => {
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
      vi.unstubAllGlobals()
    })

    it('should throw an error if nameRequest is missing', async () => {
      const business = { corpType: { code: CorpTypes.BC_COMPANY } } as Business
      await expect(createNamedBusiness({ filingType: FilingTypes.INCORPORATION_APPLICATION, business }))
        .rejects
        .toThrow('Name request is required to create a named business')
    })

    it('should create a draft filing for an amalgamation application', async () => {
      const mockResponse = { filing: { business: { identifier: 'BC1234567' } } }
      const _fetch = vi.fn().mockResolvedValue(mockResponse)
      vi.stubGlobal('$fetch', _fetch)

      const business = {
        corpType: { code: CorpTypes.BC_COMPANY },
        nameRequest: { legalType: CorpTypes.BC_COMPANY, nrNumber: 'NR1234567' }
      } as Business

      const response = await createNamedBusiness({ filingType: FilingTypes.AMALGAMATION_APPLICATION, business })

      expect(_fetch).toHaveBeenCalledWith(expect.stringContaining('/businesses?draft=true'), expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer 123' },
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
      const _fetch = vi.fn()
      vi.stubGlobal('$fetch', _fetch)

      const business = {
        businessIdentifier: 'BC1234567',
        corpType: { code: CorpTypes.BC_COMPANY },
        nameRequest: { legalType: CorpTypes.BC_COMPANY, nrNumber: 'NR1234567' }
      } as Business

      const response = await createNamedBusiness({ filingType: FilingTypes.AMALGAMATION_APPLICATION, business })

      expect(_fetch).toHaveBeenCalledTimes(2)

      const secondCallArgs = _fetch.mock.calls[1]

      expect(secondCallArgs[0]).toContain('/orgs/undefined/affiliations/BC1234567')
      expect(secondCallArgs[1]).toMatchObject({
        method: 'DELETE',
        headers: { Authorization: expect.stringContaining('Bearer') },
        body: expect.objectContaining({
          data: expect.objectContaining({
            logDeleteDraft: true
          })
        })
      })
      expect(response).toEqual({ errorMsg: 'Cannot add business due to some technical reasons' })
    })
  })
})
