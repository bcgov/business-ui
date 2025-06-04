/**
 * List of actions authorized via roles. See Authorizations module.
 * Ultimately, this will be combined into the Authorization Roles enum.
 */
export enum AuthorizedActions {
  ADD_ENTITY_NO_AUTHENTICATION,
  HANDLE_BUSINESSES,
  HANDLE_NAME_REQUESTS,
  HANDLE_SOCIETIES,
  HANDLE_TEMPORARY_BUSINESSES,
  MANAGE_OTHER_ORGANIZATION,
  RESTORATION_REINSTATEMENT_FILING,
  SEARCH_BUSINESSES,
  STAFF_DASHBOARD
}
