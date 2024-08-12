import { describe, it, expect } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

mockNuxtImport('useConnectAccountStore', () => {
  return () => (
    {
      currentAccount: {
        id: 1
      }
    }
  )
})

describe('affiliation-invite-info utils', () => {
  const mockAffiliationInviteInfo = {
    fromOrg: { id: 1 },
    toOrg: { id: 2 },
    status: 'PENDING'
  } as AffiliationInviteInfo

  describe('isFromOrg', () => {
    it('should return true if fromOrgId matches the affiliationInviteInfo fromOrg id', () => {
      const result = isFromOrg(mockAffiliationInviteInfo, 1)
      expect(result).toBe(true)
    })

    it('should return false if fromOrgId does not match the affiliationInviteInfo fromOrg id', () => {
      const result = isFromOrg(mockAffiliationInviteInfo, 3)
      expect(result).toBe(false)
    })
  })

  describe('isToOrg', () => {
    it('should return true if toOrgId matches the affiliationInviteInfo toOrg id', () => {
      const result = isToOrg(mockAffiliationInviteInfo, 2)
      expect(result).toBe(true)
    })

    it('should return false if toOrgId does not match the affiliationInviteInfo toOrg id', () => {
      const result = isToOrg(mockAffiliationInviteInfo, 3)
      expect(result).toBe(false)
    })

    it('should return false if toOrg is undefined in affiliationInviteInfo', () => {
      const result = isToOrg({ ...mockAffiliationInviteInfo, toOrg: undefined }, 2)
      expect(result).toBe(false)
    })
  })

  describe('isToOrgAndActive', () => {
    it('should return true if toOrgId matches and the status is Pending', () => {
      const result = isToOrgAndActive(mockAffiliationInviteInfo, 2)
      expect(result).toBe(true)
    })

    it('should return false if toOrgId matches but the status is not Pending', () => {
      const result = isToOrgAndActive({ ...mockAffiliationInviteInfo, status: 'ACCEPTED' }, 2)
      expect(result).toBe(false)
    })

    it('should return false if toOrgId does not match', () => {
      const result = isToOrgAndActive(mockAffiliationInviteInfo, 3)
      expect(result).toBe(false)
    })
  })

  describe('isAccepted', () => {
    it('should return true if the status is Accepted', () => {
      const result = isAccepted({ ...mockAffiliationInviteInfo, status: 'ACCEPTED' })
      expect(result).toBe(true)
    })

    it('should return false if the status is not Accepted', () => {
      const result = isAccepted(mockAffiliationInviteInfo)
      expect(result).toBe(false)
    })
  })
})
