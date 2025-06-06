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
