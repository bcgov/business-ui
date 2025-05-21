/**
 * List of actions authorized via roles. See Authorizations module.
 * Ultimately, this will be combined into the Authorization Roles enum.
 */
export enum AuthorizedActions {
  ADD_BUSINESS_SILENTLY,
  ADD_NAME_REQUEST_SILENTLY,
  REDIRECT_STEP_TO_RESTORE_PAGE,
  RESTORE_FORM,
  RESTORE_REINSTATE_NOW,
  STAFF_CREATE_AFFILIATION,
  STAFF_CREATE_NR_AFFILIATION,
  STAFF_DASHBOARD,
  STAFF_LOAD_AFFILIATIONS,
  STAFF_REMOVE_BUSINESS
}
