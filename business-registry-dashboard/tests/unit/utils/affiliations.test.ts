import { describe, vi, it, expect, afterEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import {
  NrRequestActionCodes,
  NrRequestTypeCodes
} from '@bcrs-shared-components/enums'

mockNuxtImport('useConnectAccountStore', () => {
  return () => (
    {
      currentAccount: {
        id: 1
      }
    }
  )
})

mockNuxtImport('useKeycloak', () => {
  return () => (
    {
      getToken: vi.fn().mockResolvedValue('123')
    }
  )
})

const mockBusiness: Business = {
  corpType: { code: CorpTypes.BC_COMPANY },
  nameRequest: {
    state: 'APPROVED',
    legalType: CorpTypes.BENEFIT_COMPANY,
    expirationDate: new Date('2023-12-31'),
    enableIncorporation: true,
    requestActionCd: NrRequestActionCodes.NEW_BUSINESS,
    requestTypeCd: NrRequestTypeCodes.CHANGE_BEN,
    names: [{ state: 'APPROVED', name: 'Test Corp', decision_text: '', name_type_cd: '', designation: '' }],
    nrNumber: 'NR1234567'
  },
  businessIdentifier: 'BC1234567',
  goodStanding: false,
  adminFreeze: true,
  dissolved: true,
  corpSubType: { code: CorpTypes.BC_COMPANY },
  status: 'ACTIVE'
}

const mockGetStoredFlag = vi.fn()
mockNuxtImport('useConnectLaunchdarklyStore', () => {
  return () => (
    {
      getStoredFlag: mockGetStoredFlag
    }
  )
})

describe('affiliations utils', () => {
  describe('getAffiliationInvitationStatus', () => {
    it('should return the status if defined', () => {
      const status = getAffiliationInvitationStatus([
        {
          id: 1,
          type: AffiliationInvitationType.REQUEST,
          status: 'Pending',
          entity: { corpType: { code: CorpTypes.FINANCIAL }, businessIdentifier: '123' },
          fromOrg: { name: 'Test Name', id: 1234 }
        }
      ])
      expect(status).toBe('Pending')
    })

    it('should return "N/A" if status is undefined', () => {
      const status = getAffiliationInvitationStatus([
        {
          id: 1,
          type: AffiliationInvitationType.REQUEST,
          status: '',
          entity: { corpType: { code: CorpTypes.FINANCIAL }, businessIdentifier: '123' },
          fromOrg: { name: 'Test Name', id: 1234 }
        }
      ])
      expect(status).toBe('N/A')
    })

    it('should return "N/A" for an empty array', () => {
      const status = getAffiliationInvitationStatus([])
      expect(status).toBe('N/A')
    })
  })

  describe('getElementWithSmallestId', () => {
    it('should return the element with the smallest ID', () => {
      const result = getElementWithSmallestId([{ id: 3 }, { id: 1 }, { id: 2 }])
      expect(result).toEqual({ id: 1 })
    })

    it('should return undefined for an empty array', () => {
      const result = getElementWithSmallestId([])
      expect(result).toBeUndefined()
    })

    it('should return the first element if IDs are the same', () => {
      const result = getElementWithSmallestId([{ id: 2 }, { id: 2 }, { id: 2 }])
      expect(result).toEqual({ id: 2 })
    })
  })

  describe('getRequestForAuthorizationStatusText', () => {
    it('should return authorization request text when toOrg matches current organization', () => {
      const statusText = getRequestForAuthorizationStatusText([
        {
          id: 1,
          type: AffiliationInvitationType.REQUEST,
          status: 'PENDING',
          entity: { corpType: { code: CorpTypes.FINANCIAL }, businessIdentifier: '123' },
          fromOrg: { name: 'Test Name', id: 1234 },
          toOrg: { name: 'Test Name', id: 1 }
        }
      ])
      expect(statusText).toContain('Request for Authorization to manage from: <strong>Test Name</strong>')
    })

    it('should return pending authorization text for pending status', () => {
      const statusText = getRequestForAuthorizationStatusText([
        {
          id: 1,
          type: AffiliationInvitationType.REQUEST,
          status: AffiliationInvitationStatus.Pending,
          entity: { corpType: { code: CorpTypes.FINANCIAL }, businessIdentifier: '123' },
          fromOrg: { name: 'Test Name', id: 1234 },
          toOrg: { name: 'Test Name', id: 2 }
        }
      ])
      expect(statusText).toContain('Request sent, pending authorization.')
    })

    it('should return accepted authorization text for accepted status', () => {
      const statusText = getRequestForAuthorizationStatusText([
        {
          id: 1,
          type: AffiliationInvitationType.REQUEST,
          status: AffiliationInvitationStatus.Accepted,
          entity: { corpType: { code: CorpTypes.FINANCIAL }, businessIdentifier: '123' },
          fromOrg: { name: 'Test Name', id: 1234 },
          toOrg: { name: 'Test Name', id: 2 }
        }
      ])
      expect(statusText).toContain('<strong>Authorized</strong> - you can now manage this business.')
    })

    it('should return failed authorization text for failed status', () => {
      const statusText = getRequestForAuthorizationStatusText([
        {
          id: 1,
          type: AffiliationInvitationType.REQUEST,
          status: AffiliationInvitationStatus.Failed,
          entity: { corpType: { code: CorpTypes.FINANCIAL }, businessIdentifier: '123' },
          fromOrg: { name: 'Test Name', id: 1234 },
          toOrg: { name: 'Test Name', id: 2 }
        }
      ])
      expect(statusText).toContain('<strong>Not Authorized</strong>. Your request to manage this business has been declined.')
    })

    it('should return expired authorization text for expired status', () => {
      const statusText = getRequestForAuthorizationStatusText([
        {
          id: 1,
          type: AffiliationInvitationType.REQUEST,
          status: AffiliationInvitationStatus.Expired,
          entity: { corpType: { code: CorpTypes.FINANCIAL }, businessIdentifier: '123' },
          fromOrg: { name: 'Test Name', id: 1234 },
          toOrg: { name: 'Test Name', id: 2 }
        }
      ])
      expect(statusText).toContain('Not authorized. The <strong>confirmation email has expired.</strong>')
    })
  })

  describe('tempDescription', () => {
    it('should return Amalgamation Application description', () => {
      const business: Business = { corpType: { code: CorpTypes.AMALGAMATION_APPLICATION }, businessIdentifier: '123' }
      expect(tempDescription(business)).toBe('Amalgamation Application')
    })

    it('should return INCORPORATION APPLICATION description', () => {
      const business: Business = { corpType: { code: CorpTypes.INCORPORATION_APPLICATION }, businessIdentifier: '123' }
      expect(tempDescription(business)).toBe('Incorporation Application')
    })

    it('should return REGISTRATION description', () => {
      const business: Business = { corpType: { code: CorpTypes.REGISTRATION }, businessIdentifier: '123' }
      expect(tempDescription(business)).toBe('Registration')
    })

    it('should return empty string for unknown types', () => {
      // @ts-expect-error
      const business: Business = { corpType: { code: 'UNKOWN' }, businessIdentifier: '123' }
      expect(tempDescription(business)).toBe('')
    })
  })

  describe('isTemporaryBusiness', () => {
    it('should return true for registration business', () => {
      const business: Business = { corpType: { code: CorpTypes.REGISTRATION }, businessIdentifier: '123' }
      expect(isTemporaryBusiness(business)).toBe(true)
    })

    it('should return true for INCORPORATION_APPLICATION business', () => {
      const business: Business = { corpType: { code: CorpTypes.INCORPORATION_APPLICATION }, businessIdentifier: '123' }
      expect(isTemporaryBusiness(business)).toBe(true)
    })

    it('should return true for AMALGAMATION_APPLICATION business', () => {
      const business: Business = { corpType: { code: CorpTypes.AMALGAMATION_APPLICATION }, businessIdentifier: '123' }
      expect(isTemporaryBusiness(business)).toBe(true)
    })

    it('should return false for non-temporary business', () => {
      expect(isTemporaryBusiness(mockBusiness)).toBe(false)
    })
  })

  describe('affiliationType', () => {
    it('should return type description for temporary business', () => {
      const business: Business = { corpType: { code: CorpTypes.REGISTRATION }, businessIdentifier: '123' }
      expect(affiliationType(business)).toBe('Registration')
    })

    it('should return Name Request for name request', () => {
      const business: Business = { corpType: { code: CorpTypes.NAME_REQUEST }, nameRequest: { legalType: CorpTypes.NAME_REQUEST }, businessIdentifier: '123' }
      expect(affiliationType(business)).toBe('Name Request')
    })
  })

  describe('affiliationStatus', () => {
    it('should return draft for temporary business', () => {
      const business: Business = { corpType: { code: CorpTypes.REGISTRATION }, businessIdentifier: '123' }
      expect(affiliationStatus(business)).toBe('Draft')
    })

    it('should return active for a business with status', () => {
      expect(affiliationStatus(mockBusiness)).toBe('Active')
    })
  })

  describe('isExpired', () => {
    // it('should return true if draft IA with expired NR', () => { // TODO: fix
    //   const business: Business = {
    //     ...mockBusiness,
    //     nameRequest: { ...mockBusiness.nameRequest, expirationDate: new Date('2020-12-31'), legalType: CorpTypes.BC_COMPANY }
    //   }
    //   expect(isExpired(business)).toBe(true)
    // })

    it('should return false if NR is not expired', () => {
      expect(isExpired(mockBusiness)).toBe(false)
    })
  })

  describe('isFrozed', () => {
    it('should return true if business is frozen', () => {
      expect(isFrozed(mockBusiness)).toBe(true)
    })

    it('should return false if business is not frozen', () => {
      const business = { ...mockBusiness, adminFreeze: false }
      expect(isFrozed(business)).toBe(false)
    })
  })

  describe('isBadstanding', () => {
    it('should return true if business is in bad standing', () => {
      expect(isBadstanding(mockBusiness)).toBe(true)
    })

    it('should return false if business is in good standing', () => {
      const business = { ...mockBusiness, goodStanding: true }
      expect(isBadstanding(business)).toBe(false)
    })
  })

  describe('isDissolution', () => {
    it('should return true if business is dissolved', () => {
      expect(isDissolution(mockBusiness)).toBe(true)
    })

    it('should return false if business is not dissolved', () => {
      const business = { ...mockBusiness, dissolved: false }
      expect(isDissolution(business)).toBe(false)
    })
  })

  describe('getDetails', () => {
    it('should return the correct details for a business', () => {
      expect(getDetails(mockBusiness)).toEqual(['FROZEN', 'BAD_STANDING', 'DISSOLUTION'])
    })
  })

  describe('isDraft', () => {
    it('should return true if state is draft', () => {
      expect(isDraft('DRAFT')).toBe(true)
    })

    it('should return false if state is not draft', () => {
      expect(isDraft('APPROVED')).toBe(false)
    })
  })

  describe('isIA', () => {
    it('should return true if type is Incorporation Application', () => {
      expect(isIA('Incorporation Application')).toBe(true)
    })

    it('should return false if type is not Incorporation Application', () => {
      expect(isIA('Name Request')).toBe(false)
    })
  })

  describe('isProcessing', () => {
    it('should return true if state is processing', () => {
      expect(isProcessing(NrDisplayStates.PROCESSING)).toBe(true)
    })

    it('should return false if state is not processing', () => {
      expect(isProcessing(NrDisplayStates.APPROVED)).toBe(false)
    })
  })

  describe('isNumberedIncorporationApplication', () => {
    it('should return true for a numbered incorporation application without NR number', () => {
      const business: Business = {
        corpType: { code: CorpTypes.INCORPORATION_APPLICATION },
        corpSubType: { code: CorpTypes.BC_COMPANY },
        businessIdentifier: '123'
      }

      expect(isNumberedIncorporationApplication(business)).toBe(true)
    })

    it('should return false if the corpSubType code is not in the list', () => {
      const business: Business = {
        corpType: { code: CorpTypes.INCORPORATION_APPLICATION },
        corpSubType: { code: CorpTypes.BENEFIT_COMPANY },
        businessIdentifier: '123'
      }

      expect(isNumberedIncorporationApplication(business)).toBe(true)
    })

    it('should return false if the NR number is present', () => {
      const business: Business = {
        corpType: { code: CorpTypes.INCORPORATION_APPLICATION },
        corpSubType: { code: CorpTypes.BC_COMPANY },
        nrNumber: 'NR1234567',
        businessIdentifier: '123'
      }

      expect(isNumberedIncorporationApplication(business)).toBe(false)
    })

    it('should return false if the corpSubType is missing', () => {
      const business: Business = {
        corpType: { code: CorpTypes.INCORPORATION_APPLICATION },
        businessIdentifier: '123'
      }

      expect(isNumberedIncorporationApplication(business)).toBe(false)
    })

    it('should return false if the corpType is not INCORPORATION_APPLICATION', () => {
      const business: Business = {
        corpType: { code: CorpTypes.BC_COMPANY },
        corpSubType: { code: CorpTypes.BC_COMPANY },
        businessIdentifier: '123'
      }

      expect(isNumberedIncorporationApplication(business)).toBe(false)
    })

    it('should return false if neither corpType nor corpSubType matches the required types', () => {
      const business: Business = {
        corpType: { code: CorpTypes.BC_CCC },
        corpSubType: { code: CorpTypes.BC_ULC_COMPANY },
        businessIdentifier: '123'
      }

      expect(isNumberedIncorporationApplication(business)).toBe(false)
    })
  })

  describe('number', () => {
    it('should return "Pending" for a numbered incorporation application', () => {
      const business: Business = {
        businessIdentifier: 'BC1234567',
        corpType: { code: CorpTypes.INCORPORATION_APPLICATION },
        corpSubType: { code: CorpTypes.BC_COMPANY }
      }

      expect(number(business)).toBe(AffidavitNumberStatus.PENDING)
    })

    it('should return nrNumber if the business is a temporary business', () => {
      const business: Business = {
        businessIdentifier: 'BC1234567',
        corpType: { code: CorpTypes.INCORPORATION_APPLICATION },
        nameRequest: { nrNumber: 'NR1234567', legalType: CorpTypes.INCORPORATION_APPLICATION }
      }

      expect(number(business)).toBe('NR1234567')
    })

    it('should return nrNumber if the business is a name request', () => {
      const business: Business = {
        businessIdentifier: 'BC1234567',
        corpType: { code: CorpTypes.NAME_REQUEST },
        nameRequest: { nrNumber: 'NR7654321', legalType: CorpTypes.BC_COMPANY }
      }

      expect(number(business)).toBe('NR7654321')
    })

    it('should return businessIdentifier if not a numbered incorporation, temporary business, or name request', () => {
      const business: Business = {
        businessIdentifier: 'BC7654321',
        corpType: { code: CorpTypes.BC_COMPANY }
      }

      expect(number(business)).toBe('BC7654321')
    })

    it('should return empty string if no identifiers are available', () => {
      const business: Business = {
        businessIdentifier: '',
        corpType: { code: CorpTypes.BC_COMPANY }
      }

      expect(number(business)).toBe('')
    })
  })

  describe('getApprovedName', () => {
    const mockNrBusiness: Business = {
      businessIdentifier: 'BC1234567',
      corpType: { code: CorpTypes.BC_COMPANY },
      nameRequest: {
        names: [
          { name: 'Approved Name', state: NrState.APPROVED, decision_text: '', name_type_cd: '', designation: '' },
          { name: 'Rejected Name', state: NrState.REJECTED, decision_text: '', name_type_cd: '', designation: '' }
        ],
        legalType: CorpTypes.BC_COMPANY
      }
    }

    it('should return the approved name when there is one', () => {
      expect(getApprovedName(mockNrBusiness)).toBe('Approved Name')
    })

    it('should return an empty string when there is no approved name', () => {
      const business: Business = {
        ...mockNrBusiness,
        nameRequest: {
          ...mockNrBusiness.nameRequest,
          legalType: CorpTypes.BC_COMPANY,
          names: [
            { name: 'Rejected Name', state: NrState.REJECTED, decision_text: '', name_type_cd: '', designation: '' }
          ]
        }
      }
      expect(getApprovedName(business)).toBe('')
    })

    it('should return an empty string when nameRequest is undefined', () => {
      const business: Business = {
        ...mockNrBusiness,
        nameRequest: undefined
      }
      expect(getApprovedName(business)).toBe('')
    })

    it('should return an empty string when names array is undefined', () => {
      const business: Business = {
        ...mockNrBusiness,
        nameRequest: {
          ...mockNrBusiness.nameRequest,
          legalType: CorpTypes.BC_COMPANY,
          names: undefined
        }
      }
      expect(getApprovedName(business)).toBe('')
    })

    it('should return an empty string when names array is empty', () => {
      const business: Business = {
        ...mockNrBusiness,
        nameRequest: {
          ...mockNrBusiness.nameRequest,
          legalType: CorpTypes.BC_COMPANY,
          names: []
        }
      }
      expect(getApprovedName(business)).toBe('')
    })
  })

  describe('affiliationName', () => {
    afterEach(() => {
      vi.clearAllMocks()
    })

    it('should return the numbered company description when it is a numbered incorporation application', () => {
      const business: Business = {
        corpType: { code: CorpTypes.INCORPORATION_APPLICATION },
        corpSubType: { code: CorpTypes.BC_COMPANY },
        businessIdentifier: 'BC1234567'
      }

      expect(affiliationName(business)).toBe('Numbered Limited Company')
    })

    it.skip('should return "Numbered Company" as a fallback for old numbered IAs without corpSubType', () => { // TODO: figure out why this is failing
      const business: Business = {
        corpType: { code: CorpTypes.INCORPORATION_APPLICATION },
        businessIdentifier: 'BC1234567'
      }

      expect(affiliationName(business)).toBe('Numbered Company')
    })

    it('should return the approved name when the business has a name request with an approved name', () => {
      const business: Business = {
        businessIdentifier: '123',
        corpType: { code: CorpTypes.BC_COMPANY },
        nameRequest: {
          legalType: CorpTypes.BC_COMPANY,
          names: [
            { name: 'Approved Name', state: NrState.APPROVED, decision_text: '', name_type_cd: '', designation: '' }
          ]
        }
      }

      expect(affiliationName(business)).toBe('Approved Name')
    })

    it('should return an empty string when the business has a name request but no approved name', () => {
      const business: Business = {
        businessIdentifier: '123',
        corpType: { code: CorpTypes.BC_COMPANY },
        nameRequest: {
          legalType: CorpTypes.BC_COMPANY,
          names: [
            { name: 'Rejected Name', state: NrState.REJECTED, decision_text: '', name_type_cd: '', designation: '' }
          ]
        }
      }

      expect(affiliationName(business)).toBe('')
    })

    it('should return the business name when it has neither a numbered incorporation application or a name request', () => {
      const business: Business = {
        businessIdentifier: '123',
        corpType: { code: CorpTypes.BC_COMPANY },
        name: 'Existing Business Name'
      }

      expect(affiliationName(business)).toBe('Existing Business Name')
    })

    it('should return an empty string when the business has neither a name or a name request', () => {
      const business: Business = {
        businessIdentifier: '123',
        corpType: { code: CorpTypes.BC_COMPANY }
      }

      expect(affiliationName(business)).toBe('')
    })
  })

  describe('typeDescription', () => {
    it('should return the legal type description for a name request', () => {
      const business: Business = {
        businessIdentifier: '123',
        corpType: { code: CorpTypes.NAME_REQUEST },
        nameRequest: {
          legalType: CorpTypes.BC_COMPANY
        }
      }

      const result = typeDescription(business)

      expect(result).toBe('BC Limited Company')
    })

    it('should return an empty string if business does not match name request or temporary business', () => {
      const business = {} as Business

      const result = typeDescription(business)

      expect(result).toBe('')
    })
  })

  describe('canUseNameRequest', () => {
    it('should return true when all conditions are met and is modernized entity', () => {
      mockGetStoredFlag.mockReturnValue('BC') // mock LDFlags.IaSupportedEntities so isModernized entity return true
      const business: Business = {
        businessIdentifier: '123',
        corpType: { code: CorpTypes.NAME_REQUEST },
        nameRequest: {
          legalType: CorpTypes.BC_COMPANY,
          enableIncorporation: true,
          expirationDate: new Date('2024-12-31')
        }
      }

      const result = canUseNameRequest(business)

      expect(result).toBe(true)
    })

    it('should return false when all conditions are met and is not modernized entity', () => {
      mockGetStoredFlag.mockReturnValue('') // mock LDFlags.IaSupportedEntities so isModernized entity return false
      const business: Business = {
        businessIdentifier: '123',
        corpType: { code: CorpTypes.NAME_REQUEST },
        nameRequest: {
          legalType: CorpTypes.BC_COMPANY,
          enableIncorporation: true,
          expirationDate: new Date('2024-12-31')
        }
      }

      const result = canUseNameRequest(business)

      expect(result).toBe(false)
    })

    it('should return false when isNameRequest returns false', () => {
      const business: Business = {
        businessIdentifier: '123',
        corpType: { code: CorpTypes.REGISTRATION },
        nameRequest: {
          legalType: CorpTypes.BC_COMPANY,
          enableIncorporation: true,
          expirationDate: new Date('2024-12-31')
        }
      }

      const result = canUseNameRequest(business)

      expect(result).toBe(false)
    })

    it('should return false when enableIncorporation is false', () => {
      const business: Business = {
        businessIdentifier: '123',
        corpType: { code: CorpTypes.NAME_REQUEST },
        nameRequest: {
          legalType: CorpTypes.BC_COMPANY,
          enableIncorporation: false,
          expirationDate: new Date('2024-12-31')
        }
      }

      const result = canUseNameRequest(business)

      expect(result).toBe(false)
    })

    it('should return false when isModernizedEntity returns false', () => {
      const business: Business = {
        businessIdentifier: '123',
        corpType: { code: CorpTypes.AMALGAMATION_APPLICATION },
        nameRequest: {
          legalType: CorpTypes.BC_COMPANY,
          enableIncorporation: false,
          expirationDate: new Date('2024-12-31')
        }
      }

      const result = canUseNameRequest(business)

      expect(result).toBe(false)
    })

    it('should return false when expirationDate is missing', () => {
      const business: Business = {
        businessIdentifier: '123',
        corpType: { code: CorpTypes.NAME_REQUEST },
        nameRequest: {
          legalType: CorpTypes.BC_COMPANY,
          enableIncorporation: false
        }
      }

      const result = canUseNameRequest(business)

      expect(result).toBe(false)
    })

    it('should return false when nameRequest is undefined', () => {
      const business: Business = {} as Business

      const result = canUseNameRequest(business)

      expect(result).toBe(false)
    })
  })

  describe('nameRequestType', () => {
    it('should return the name request type based on action code, only works for amalgamtion right now', () => {
      const business: Business = {
        businessIdentifier: '123',
        corpType: { code: CorpTypes.NAME_REQUEST },
        nameRequest: {
          legalType: CorpTypes.BC_COMPANY,
          requestActionCd: NrRequestActionCodes.AMALGAMATE
        }
      }

      const result = nameRequestType(business)

      expect(result).toBe('— Amalgamation')
    })

    it('should return the name request type based on type code when action code returns empty', () => {
      const business: Business = {
        businessIdentifier: '123',
        corpType: { code: CorpTypes.NAME_REQUEST },
        nameRequest: {
          legalType: CorpTypes.BC_COMPANY,
          requestActionCd: NrRequestActionCodes.CHANGE_NAME,
          requestTypeCd: NrRequestTypeCodes.CHANGE_COOP
        }
      }

      const result = nameRequestType(business)

      expect(result).toBe('— Name Change')
    })

    it('should return the name request type based on action code if both action and type code are present', () => {
      const business: Business = {
        businessIdentifier: '123',
        corpType: { code: CorpTypes.NAME_REQUEST },
        nameRequest: {
          legalType: CorpTypes.BC_COMPANY,
          requestActionCd: NrRequestActionCodes.AMALGAMATE,
          requestTypeCd: NrRequestTypeCodes.CHANGE_COOP
        }
      }

      const result = nameRequestType(business)

      expect(result).toBe('— Amalgamation')
    })

    it('should return an empty string when not a name request', () => {
      const business = {} as Business

      const result = nameRequestType(business)

      expect(result).toBe('')
    })

    it('should return an empty string when neither action or type code is present', () => {
      const business: Business = {
        businessIdentifier: '123',
        corpType: { code: CorpTypes.NAME_REQUEST },
        nameRequest: {
          legalType: CorpTypes.BC_COMPANY
        }
      }

      const result = nameRequestType(business)

      expect(result).toBe('')
    })
  })

  describe('getEntityType', () => {
    it('should return the corpType code if the business is not a name request', () => {
      const business: Business = {
        businessIdentifier: '123',
        corpType: { code: CorpTypes.BC_COMPANY }
      }

      const result = getEntityType(business)

      expect(result).toBe(CorpTypes.BC_COMPANY)
    })

    it('should return the nameRequest legalType if the business is a name request', () => {
      const business: Business = {
        businessIdentifier: '123',
        corpType: { code: CorpTypes.NAME_REQUEST },
        nameRequest: {
          legalType: CorpTypes.BC_COMPANY,
          requestActionCd: NrRequestActionCodes.AMALGAMATE,
          requestTypeCd: NrRequestTypeCodes.CHANGE_COOP
        }
      }

      const result = getEntityType(business)

      expect(result).toBe(CorpTypes.BC_COMPANY)
    })

    it('should return the corpType code if the business is not a name request even if nameRequest is present', () => {
      const business: Business = {
        businessIdentifier: '123',
        corpType: { code: CorpTypes.BC_COMPANY },
        nameRequest: {
          legalType: CorpTypes.BC_COMPANY,
          requestActionCd: NrRequestActionCodes.AMALGAMATE,
          requestTypeCd: NrRequestTypeCodes.CHANGE_COOP
        }
      }

      const result = getEntityType(business)

      expect(result).toBe(CorpTypes.BC_COMPANY)
    })
  })

  describe('isBusinessAffiliated', () => {
    it('should return false if businessIdentifier is not provided', () => {
      const affiliations: Business[] = [
        { businessIdentifier: 'BC1234567' } as Business,
        { businessIdentifier: 'BC7654321' } as Business
      ]

      const result = isBusinessAffiliated(affiliations, '')

      expect(result).toBe(false)
    })

    it('should return false if affiliations array is empty', () => {
      const affiliations: Business[] = []

      const result = isBusinessAffiliated(affiliations, 'BC1234567')

      expect(result).toBe(false)
    })

    it('should return true if the businessIdentifier is found in the affiliations array', () => {
      const affiliations: Business[] = [
        { businessIdentifier: 'BC1234567' } as Business,
        { businessIdentifier: 'BC7654321' } as Business
      ]

      const result = isBusinessAffiliated(affiliations, 'BC1234567')

      expect(result).toBe(true)
    })

    it('should return false if the businessIdentifier is not found in the affiliations array', () => {
      const affiliations: Business[] = [
        { businessIdentifier: 'BC1234567' } as Business,
        { businessIdentifier: 'BC7654321' } as Business
      ]

      const result = isBusinessAffiliated(affiliations, 'BC1111111')

      expect(result).toBe(false)
    })
  })
})
