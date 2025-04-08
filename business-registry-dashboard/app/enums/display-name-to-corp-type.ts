/**
 * Maps display names (filter values in table) to their corresponding corp type codes.
 */
export enum DisplayNameToCorpType {
  'BC Limited Company' = CorpTypes.BC_COMPANY,
  'Benefit Company' = CorpTypes.BENEFIT_COMPANY,
  'BC Community Contribution Company' = CorpTypes.BC_CCC,
  'BC Unlimited Liability Company' = CorpTypes.BC_ULC_COMPANY,
  'BC Cooperative Association' = CorpTypes.COOP,
  'BC General Partnership' = CorpTypes.PARTNERSHIP,
  'BC Sole Proprietorship' = CorpTypes.SOLE_PROP,
  'Name Request' = CorpTypes.NAME_REQUEST,
  'Incorporation Application' = CorpTypes.INCORPORATION_APPLICATION,
  'Amalgamation Application' = CorpTypes.AMALGAMATION_APPLICATION,
  Registration = CorpTypes.REGISTRATION,
  'Continuation Application' = CorpTypes.CONTINUE_IN
}
