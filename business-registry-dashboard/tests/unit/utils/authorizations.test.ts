import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AuthorizedActions } from '~~/app/enums/authorized-actions'
import { AuthorizationRoles } from '~~/app/enums/authorization-roles'

// Import IsAuthorized after mocking
import { IsAuthorized } from '~~/app/utils/authorizations'

// We need to mock the store before importing the module that uses it
const mockAffStore = {
  authorizations: {
    roles: []
  }
}

// Mock the useAffiliationsStore function
vi.mock('~~/app/stores/affiliations', () => ({
  useAffiliationsStore: vi.fn(() => mockAffStore)
}))

describe('Authorizations util', () => {
  beforeEach(() => {
    // Reset the mock state for each test
    mockAffStore.authorizations = { roles: [] }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('IsAuthorized', () => {
    it('should return true when user is Business Registry Staff with matching role action', () => {
      mockAffStore.authorizations.roles = [AuthorizationRoles.STAFF] as any

      // STAFF_CREATE_AFFILIATION is in BusinessRegistryStaffRoles
      const result = IsAuthorized(AuthorizedActions.STAFF_CREATE_AFFILIATION)

      expect(result).toBe(true)
    })

    it('should return false when user is Maximus Staff with any action', () => {
      mockAffStore.authorizations.roles = [AuthorizationRoles.MAXIMUS_STAFF] as any

      // MaximusStaffRoles is empty
      const result = IsAuthorized(AuthorizedActions.STAFF_DASHBOARD)

      expect(result).toBe(false)
    })

    it('should return false when user is Contact Centre Staff with any action', () => {
      mockAffStore.authorizations.roles = [AuthorizationRoles.CONTACT_CENTRE_STAFF] as any

      // ContactCentreStaffRoles is empty
      const result = IsAuthorized(AuthorizedActions.STAFF_DASHBOARD)

      expect(result).toBe(false)
    })

    it('should return true when user is SBC Field Office Staff with matching role action', () => {
      mockAffStore.authorizations.roles = [AuthorizationRoles.SBC_STAFF] as any

      // ADD_ENTITY_NO_AUTHENTICATION is in SbcFieldOfficeStaffRoles
      const result = IsAuthorized(AuthorizedActions.ADD_ENTITY_NO_AUTHENTICATION)

      expect(result).toBe(true)
    })

    it('should return false when user has no specific role and action is not in DefaultRoles', () => {
      mockAffStore.authorizations.roles = [AuthorizationRoles.VIEW] as any

      // STAFF_DASHBOARD is not in DefaultRoles
      const result = IsAuthorized(AuthorizedActions.STAFF_DASHBOARD)

      expect(result).toBe(false)
    })

    it('should return false when authorizations is undefined', () => {
      // Setting authorizations to undefined for this test
      mockAffStore.authorizations = undefined as any

      const result = IsAuthorized(AuthorizedActions.STAFF_DASHBOARD)

      expect(result).toBe(false)
    })

    it('should return false when authorizations roles is null', () => {
      // Setting roles to null for this test
      mockAffStore.authorizations = { roles: null } as any

      const result = IsAuthorized(AuthorizedActions.STAFF_DASHBOARD)

      expect(result).toBe(false)
    })

    it('should correctly detect multiple role types and prioritize them', () => {
      // A user with multiple roles - STAFF should take precedence in the switch statement
      mockAffStore.authorizations.roles = [
        AuthorizationRoles.STAFF,
        AuthorizationRoles.SBC_STAFF
      ] as any

      // This should check IsBusinessRegistryStaff first due to the switch statement order
      const result = IsAuthorized(AuthorizedActions.STAFF_CREATE_AFFILIATION)

      expect(result).toBe(true)
    })
  })
})
