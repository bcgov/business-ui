import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AuthorizedActions } from '~~/app/enums/authorized-actions'
import { AuthorizationRoles } from '~~/app/enums/authorization-roles'

// Import IsAuthorized after mocking
import { IsAuthorized } from '~~/app/utils/authorizations'

// Mock Keycloak user with roles
const mockKcUser = {
  roles: [] as string[]
}

// Mock the useKeycloak composable
mockNuxtImport('useKeycloak', () => {
  return () => ({
    kcUser: mockKcUser
  })
})

describe('Authorizations util', () => {
  beforeEach(() => {
    // Reset the mock roles for each test
    mockKcUser.roles = []
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('IsAuthorized', () => {
    it('should return true when user is Business Registry Staff with matching role action', () => {
      mockKcUser.roles = [AuthorizationRoles.STAFF]

      // MANAGE_OTHER_ORGANIZATION is in BusinessRegistryStaffRoles
      const result = IsAuthorized(AuthorizedActions.MANAGE_OTHER_ORGANIZATION)

      expect(result).toBe(true)
    })

    it('should return false when user is Maximus Staff with any action', () => {
      mockKcUser.roles = [AuthorizationRoles.MAXIMUS_STAFF]

      // MaximusStaffRoles is empty
      const result = IsAuthorized(AuthorizedActions.STAFF_DASHBOARD)

      expect(result).toBe(false)
    })

    it('should return false when user is Contact Centre Staff with any action', () => {
      mockKcUser.roles = [AuthorizationRoles.CONTACT_CENTRE_STAFF]

      // ContactCentreStaffRoles is empty
      const result = IsAuthorized(AuthorizedActions.STAFF_DASHBOARD)

      expect(result).toBe(false)
    })

    it('should return true when user is SBC Field Office Staff with matching role action', () => {
      mockKcUser.roles = [AuthorizationRoles.SBC_STAFF]

      // ADD_ENTITY_NO_AUTHENTICATION is in SbcFieldOfficeStaffRoles
      const result = IsAuthorized(AuthorizedActions.ADD_ENTITY_NO_AUTHENTICATION)

      expect(result).toBe(true)
    })

    it('should return false when user is Public User with any action', () => {
      mockKcUser.roles = [AuthorizationRoles.PUBLIC_USER]

      // PublicUserActions is empty
      const result = IsAuthorized(AuthorizedActions.STAFF_DASHBOARD)

      expect(result).toBe(false)
    })

    it('should return false when user has no roles', () => {
      mockKcUser.roles = []

      const result = IsAuthorized(AuthorizedActions.STAFF_DASHBOARD)

      expect(result).toBe(false)
    })

    it('should return false when kcUser roles is null', () => {
      // Setting roles to null for this test
      mockKcUser.roles = null as any

      const result = IsAuthorized(AuthorizedActions.STAFF_DASHBOARD)

      expect(result).toBe(false)
    })

    it('should correctly detect multiple role types and prioritize them', () => {
      // A user with multiple roles - STAFF should take precedence in the switch statement
      mockKcUser.roles = [
        AuthorizationRoles.STAFF,
        AuthorizationRoles.SBC_STAFF
      ]

      // This should check IsBusinessRegistryStaff first due to the switch statement order
      const result = IsAuthorized(AuthorizedActions.MANAGE_OTHER_ORGANIZATION)

      expect(result).toBe(true)
    })

    it('should return true when Business Registry Staff has STAFF_DASHBOARD action', () => {
      mockKcUser.roles = [AuthorizationRoles.STAFF]

      // STAFF_DASHBOARD is in BusinessRegistryStaffRoles
      const result = IsAuthorized(AuthorizedActions.STAFF_DASHBOARD)

      expect(result).toBe(true)
    })

    it('should return true when SBC Staff has STAFF_DASHBOARD action', () => {
      mockKcUser.roles = [AuthorizationRoles.SBC_STAFF]

      // STAFF_DASHBOARD is in SbcFieldOfficeStaffRoles
      const result = IsAuthorized(AuthorizedActions.STAFF_DASHBOARD)

      expect(result).toBe(true)
    })
  })
})
