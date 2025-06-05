/**
 * List of actions authorized via roles. See Authorizations module.
 * Ultimately, this will be combined into the Authorization Roles enum.
 */
export enum AuthorizedActions {
  ADD_ENTITY_NO_AUTHENTICATION,
  MANAGE_BUSINESS,
  MANAGE_NR,
  MANAGE_OTHER_ORGANIZATION,
  MANAGE_SOCIETY,
  RESTORATION_REINSTATEMENT_FILING,
  RESUME_DRAFT,
  SEARCH_BUSINESS_NR,
  STAFF_DASHBOARD
}
