/**
 * List of actions authorized via roles. See Authorizations module.
 * Ultimately, this will be combined into the Authorization Roles enum.
 */
export enum AuthorizedActions {
  ADD_ENTITY_NO_AUTHENTICATION,
  LOAD_AFFILIATIONS,
  MANAGE_OTHER_ORGANIZATION,
  RESTORE_OR_REINSTATE,
  STAFF_DASHBOARD
}
