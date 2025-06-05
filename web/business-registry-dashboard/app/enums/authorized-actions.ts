/**
 * List of actions authorized via roles. See Authorizations module.
 * Ultimately, this will be combined into the Authorization Roles enum.
 */
export enum AuthorizedActions {
  ADD_ENTITY_NO_AUTHENTICATION,
  MANAGE_BUSINESS,
  MANAGE_NR,
  MANAGE_SOCIETY,
  RESUME_DRAFT,
  MANAGE_OTHER_ORGANIZATION,
  RESTORATION_REINSTATEMENT_FILING,
  SEARCH_ENTITIES,
  STAFF_DASHBOARD
}
