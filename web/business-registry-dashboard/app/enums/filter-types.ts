export enum FilterTypes {
  AMALGAMATION_APPLICATION = 'Amalgamation Application',
  BC_BENEFIT_COMPANY = 'BC Benefit Company',
  BC_COMMUNITY_CONTRIBUTION_COMPANY = 'BC Community Contribution Company',
  BC_COOPERATIVE_ASSOCIATION = 'BC Cooperative Association',
  BC_GENERAL_PARTNERSHIP = 'BC General Partnership',
  BC_LIMITED_COMPANY = 'BC Limited Company',
  BC_SOLE_PROPRIETORSHIP = 'BC Sole Proprietorship',
  BC_UNLIMITED_LIABILITY_COMPANY = 'BC Unlimited Liability Company',
  CONTINUATION_APPLICATION = 'Continuation Application',
  EXTRAPROVINCIAL_COMPANY = 'Extraprovincial Company',
  INCORPORATION_APPLICATION = 'Incorporation Application',
  NAME_REQUEST = 'Name Request',
  REGISTRATION = 'Registration'
}

/** Order of the types here is important for the filter. Please don't change the order or alphabetize. */
export const TYPE_FILTER_OPTIONS = [
  FilterTypes.BC_SOLE_PROPRIETORSHIP,
  FilterTypes.BC_LIMITED_COMPANY,
  FilterTypes.BC_UNLIMITED_LIABILITY_COMPANY,
  FilterTypes.BC_GENERAL_PARTNERSHIP,
  FilterTypes.BC_BENEFIT_COMPANY,
  FilterTypes.BC_COMMUNITY_CONTRIBUTION_COMPANY,
  FilterTypes.BC_COOPERATIVE_ASSOCIATION,
  FilterTypes.EXTRAPROVINCIAL_COMPANY,
  FilterTypes.NAME_REQUEST,
  FilterTypes.REGISTRATION,
  FilterTypes.INCORPORATION_APPLICATION,
  FilterTypes.CONTINUATION_APPLICATION,
  FilterTypes.AMALGAMATION_APPLICATION
]

/**
 * Mirrors TYPE_FILTER_OPTIONS but marks where a section break should appear in the UI.
 *
 * Guidelines:
 * - Keep the same order and items as TYPE_FILTER_OPTIONS (do not reorder or alphabetize).
 * - Comment out items that are NOT break points — this preserves the visual mapping to TYPE_FILTER_OPTIONS.
 * - Uncomment items that should start a new group in the filter UI.
 */
export const TYPE_FILTER_OPTIONS_SECTION_BREAK_BEFORE = [
  // FilterTypes.BC_SOLE_PROPRIETORSHIP,
  // FilterTypes.BC_LIMITED_COMPANY,
  // FilterTypes.BC_UNLIMITED_LIABILITY_COMPANY,
  // FilterTypes.BC_GENERAL_PARTNERSHIP,
  // FilterTypes.BC_BENEFIT_COMPANY,
  // FilterTypes.BC_COMMUNITY_CONTRIBUTION_COMPANY,
  // FilterTypes.BC_COOPERATIVE_ASSOCIATION,
  // FilterTypes.EXTRAPROVINCIAL_COMPANY,
  FilterTypes.NAME_REQUEST,
  // FilterTypes.REGISTRATION,
  FilterTypes.INCORPORATION_APPLICATION
  // FilterTypes.CONTINUATION_APPLICATION,
  // FilterTypes.AMALGAMATION_APPLICATION
]
