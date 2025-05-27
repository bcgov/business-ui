import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { NrRequestActionCodes, NrRequestTypeCodes } from '@bcrs-shared-components/enums'

const mockNrResponse: NameRequestResponse = {
  actions: [],
  consentFlag: undefined,
  names: [],
  id: 1,
  legalType: CorpTypes.BC_COMPANY,
  state: undefined,
  applicantEmail: null,
  applicantPhone: null,
  enableIncorporation: true,
  folioNumber: undefined,
  target: undefined,
  entityTypeCd: undefined,
  requestTypeCd: undefined,
  requestActionCd: undefined,
  natureOfBusiness: undefined,
  expirationDate: undefined,
  nrNum: undefined,
  stateCd: undefined,
  natureBusinessInfo: undefined,
  applicants: undefined,
  corpNum: undefined
}

const mockGetStoredFlag = vi.fn()
mockNuxtImport('useConnectLaunchdarklyStore', () => {
  return () => (
    {
      getStoredFlag: mockGetStoredFlag
    }
  )
})

describe('name-request util', () => {
  describe('mapRequestActionCdToNrType', () => {
    it('should return "Amalgamation" for the AMALGAMATE action code', () => {
      const result = mapRequestActionCdToNrType(NrRequestActionCodes.AMALGAMATE)
      expect(result).toBe('Amalgamation')
    })

    it('should return an empty string for an unhandled action code', () => {
      const result = mapRequestActionCdToNrType('UNKNOWN_CODE' as NrRequestActionCodes)
      expect(result).toBe('')
    })
  })

  describe('mapRequestTypeCdToNrType', () => {
    it('should return the correct type for a valid request type code', () => {
      const result = mapRequestTypeCdToNrType(NrRequestTypeCodes.CHANGE_COOP)
      expect(result).toBe('Name Change')
    })

    it('should return undefined for an unknown request type code', () => {
      const result = mapRequestTypeCdToNrType('UNKNOWN_CODE' as NrRequestTypeCodes)
      expect(result).toBeUndefined()
    })
  })

  describe('buildNameRequestObject', () => {
    it('should build the correct name request object when LDFlags.EnableBcCccUlc = true', () => {
      mockGetStoredFlag.mockReturnValue(true)
      const result = buildNameRequestObject(mockNrResponse)

      expect(result).toEqual({
        actions: mockNrResponse.actions,
        names: mockNrResponse.names,
        id: mockNrResponse.id,
        legalType: mockNrResponse.legalType,
        nrNumber: mockNrResponse.nrNum,
        state: mockNrResponse.stateCd,
        applicantEmail: mockNrResponse.applicantEmail,
        applicantPhone: mockNrResponse.applicantPhone,
        enableIncorporation: false,
        folioNumber: mockNrResponse.folioNumber,
        target: 'lear',
        entityTypeCd: mockNrResponse.entityTypeCd,
        requestTypeCd: mockNrResponse.requestTypeCd,
        requestActionCd: mockNrResponse.requestActionCd,
        natureOfBusiness: mockNrResponse.natureBusinessInfo,
        expirationDate: mockNrResponse.expirationDate,
        applicants: mockNrResponse.applicants,
        corpNum: mockNrResponse.corpNum
      })
    })

    it('should build the correct name request object when LDFlags.EnableBcCccUlc = false', () => {
      mockGetStoredFlag.mockReturnValue(false)
      const result = buildNameRequestObject(mockNrResponse)

      expect(result).toEqual({
        actions: mockNrResponse.actions,
        names: mockNrResponse.names,
        id: mockNrResponse.id,
        legalType: mockNrResponse.legalType,
        nrNumber: mockNrResponse.nrNum,
        state: mockNrResponse.stateCd,
        applicantEmail: mockNrResponse.applicantEmail,
        applicantPhone: mockNrResponse.applicantPhone,
        enableIncorporation: false,
        folioNumber: mockNrResponse.folioNumber,
        target: 'colin',
        entityTypeCd: mockNrResponse.entityTypeCd,
        requestTypeCd: mockNrResponse.requestTypeCd,
        requestActionCd: mockNrResponse.requestActionCd,
        natureOfBusiness: mockNrResponse.natureBusinessInfo,
        expirationDate: mockNrResponse.expirationDate,
        applicants: mockNrResponse.applicants,
        corpNum: mockNrResponse.corpNum
      })
    })
  })

  describe('isApprovedName', () => {
    it('should return true if the name is approved', () => {
      const name: Names = {
        decision_text: 'n/a',
        name_type_cd: 'n/a',
        designation: 'n/a',
        name: 'Test Name',
        state: NrState.APPROVED
      }
      expect(isApprovedName(name)).toBe(true)
    })

    it('should return false if the name is not approved', () => {
      const name: Names = {
        decision_text: 'n/a',
        name_type_cd: 'n/a',
        designation: 'n/a',
        name: 'Test Name',
        state: NrState.REJECTED
      }
      expect(isApprovedName(name)).toBe(false)
    })
  })

  describe('isRejectedName', () => {
    it('should return true if the name is rejected', () => {
      const name: Names = {
        decision_text: 'n/a',
        name_type_cd: 'n/a',
        designation: 'n/a',
        name: 'Test Name',
        state: NrState.REJECTED
      }
      expect(isRejectedName(name)).toBe(true)
    })

    it('should return false if the name is not rejected', () => {
      const name: Names = {
        decision_text: 'n/a',
        name_type_cd: 'n/a',
        designation: 'n/a',
        name: 'Test Name',
        state: NrState.DRAFT
      }
      expect(isRejectedName(name)).toBe(false)
    })
  })

  describe('isNameRequest', () => {
    it('should return true if the business is a name request', () => {
      const business: Business = {
        corpType: { code: CorpTypes.NAME_REQUEST },
        nameRequest: { legalType: CorpTypes.BC_COMPANY },
        businessIdentifier: '123'
      }
      expect(isNameRequest(business)).toBe(true)
    })

    it('should return false if the business is not a name request', () => {
      const business: Business = {
        corpType: { code: CorpTypes.COOP },
        businessIdentifier: '123'
      }
      expect(isNameRequest(business)).toBe(false)
    })
  })
})
