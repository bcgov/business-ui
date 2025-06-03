/**
 * Whether the specified action is authorized for the current user.
 * Ultimately we'll just check if the auth roles includes the specified action.
 * @returns True or False
 */
export function IsAuthorized (action: AuthorizedActions): boolean {
  switch (true) {
    case isBusinessRegistryStaff(): return BusinessRegistryStaffRoles.includes(action)
    case isMaximusStaff(): return MaximusStaffRoles.includes(action)
    case isContactCentreStaff(): return ContactCentreStaffRoles.includes(action)
    case isSbcFieldOfficeStaff(): return SbcFieldOfficeStaffRoles.includes(action)
    case isPublicUser(): return PublicUserActions.includes(action)
    default: return false
  }
}

/**
 * Whether the user is Business Registry Staff.
 * Ultimately we won't need this function and we'll just fetch permissions.
 */
function isBusinessRegistryStaff (): boolean {
  const keycloak = reactive(useKeycloak())
  return keycloak?.kcUser?.roles?.includes(AuthorizationRoles.STAFF) || false
}

/**
 * Whether the user is Maximus Staff.
 * Ultimately we won't need this function and we'll just fetch permissions.
 */
function isMaximusStaff (): boolean {
  const keycloak = reactive(useKeycloak())
  return keycloak?.kcUser?.roles?.includes(AuthorizationRoles.MAXIMUS_STAFF) || false
}

/**
 * Whether the user is Contact Centre Staff.
 * Ultimately we won't need this function and we'll just fetch permissions.
 */
function isContactCentreStaff (): boolean {
  const keycloak = reactive(useKeycloak())
  return keycloak?.kcUser?.roles?.includes(AuthorizationRoles.CONTACT_CENTRE_STAFF) || false
}

/**
 * Whether the user is SBC Field Office Staff.
 * Ultimately we won't need this function and we'll just fetch permissions.
 */
function isSbcFieldOfficeStaff (): boolean {
  const keycloak = reactive(useKeycloak())
  return keycloak?.kcUser?.roles?.includes(AuthorizationRoles.SBC_STAFF) || false
}

/**
 * Whether the user is Public User.
 * Ultimately we won't need this function and we'll just fetch permissions.
 */
function isPublicUser (): boolean {
  const keycloak = reactive(useKeycloak())
  // need to check other functions since some accounts have overlapping roles
  return (
    !isBusinessRegistryStaff() &&
    !isMaximusStaff() &&
    !isContactCentreStaff() &&
    !isSbcFieldOfficeStaff() &&
    keycloak?.kcUser?.roles?.includes(AuthorizationRoles.PUBLIC_USER)
  )
}

/**
 * The roles if the user is Business Registry Staff.
 * Ultimately we won't need this list and we'll just check auth roles for everything.
 */
const BusinessRegistryStaffRoles = [
  AuthorizedActions.ADD_ENTITY_NO_AUTHENTICATION,
  AuthorizedActions.STAFF_DASHBOARD,
  AuthorizedActions.MANAGE_OTHER_ORGANIZATION,
  AuthorizedActions.RESTORATION_REINSTATEMENT_FILING
]

/**
 * The roles if the user is Maximus Staff.
 * Ultimately we won't need this list and we'll just check auth roles for everything.
 */
const MaximusStaffRoles = [
  AuthorizedActions.MANAGE_OTHER_ORGANIZATION
]

/**
 * The roles if the user is Contact Centre Staff.
 * Ultimately we won't need this list and we'll just check auth roles for everything.
 */
const ContactCentreStaffRoles = [] as AuthorizedActions[]

/**
 * The roles if the user is SBC Field Office Staff (aka SBC Staff Tier 2).
 * Ultimately we won't need this list and we'll just check auth roles for everything.
 */
const SbcFieldOfficeStaffRoles = [
  AuthorizedActions.ADD_ENTITY_NO_AUTHENTICATION,
  AuthorizedActions.STAFF_DASHBOARD,
  AuthorizedActions.MANAGE_OTHER_ORGANIZATION
]

/**
 * The authorized actions if user is Public User.
 * Ultimately we won't need this array and we'll just fetch these.
 */
const PublicUserActions = [] as AuthorizedActions[]
