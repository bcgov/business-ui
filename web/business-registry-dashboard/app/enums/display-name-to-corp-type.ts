import { CorpTypeCd, GetCorpFullDescription } from '@bcrs-shared-components/corp-type-module'

/**
 * Maps display names (filter values in table) to their corresponding corp type codes.
 * This is essentially a reverse mapping of GetCorpFullDescription + special cases.
 */
export const DisplayNameToCorpType: Record<string, string> = {
  // Generate the mappings from the CorpTypes enum codes
  [GetCorpFullDescription(CorpTypeCd.BC_COMPANY)]: CorpTypeCd.BC_COMPANY,
  [GetCorpFullDescription(CorpTypeCd.BENEFIT_COMPANY)]: CorpTypeCd.BENEFIT_COMPANY,
  [GetCorpFullDescription(CorpTypeCd.BC_CCC)]: CorpTypeCd.BC_CCC,
  [GetCorpFullDescription(CorpTypeCd.BC_ULC_COMPANY)]: CorpTypeCd.BC_ULC_COMPANY,
  [GetCorpFullDescription(CorpTypeCd.COOP)]: CorpTypeCd.COOP,
  [GetCorpFullDescription(CorpTypeCd.PARTNERSHIP)]: CorpTypeCd.PARTNERSHIP,
  [GetCorpFullDescription(CorpTypeCd.SOLE_PROP)]: CorpTypeCd.SOLE_PROP,

  // Special cases that need manual mapping
  'Name Request': CorpTypes.NAME_REQUEST,
  'Incorporation Application': CorpTypes.INCORPORATION_APPLICATION,
  'Amalgamation Application': CorpTypes.AMALGAMATION_APPLICATION,
  Registration: CorpTypes.REGISTRATION,
  'Continuation Application': CorpTypes.CONTINUE_IN,
  'Extraprovincial Company': CorpTypeCd.EXTRA_PRO_A
}
