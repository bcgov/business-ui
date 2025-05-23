/**
 * List of actions authorized via roles. See Authorizations module.
 * Ultimately, this will be combined into the Authorization Roles enum.
 */
export enum AuthorizedActions {
  ADD_ENTITY_NO_AUTHENTICATION,
  STAFF_CREATE_AFFILIATION,
  STAFF_CREATE_NR_AFFILIATION,
  STAFF_DASHBOARD,
  STAFF_LOAD_AFFILIATIONS,
  STAFF_REMOVE_BUSINESS,
  STAFF_RESTORE_OR_REINSTATE
}
