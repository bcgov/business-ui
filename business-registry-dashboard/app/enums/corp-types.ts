// NB: Corp Type is sometimes called Legal Type
// see also https://github.com/bcgov/bcrs-shared-components/blob/main/src/modules/corp-type-module/corp-type-module.ts
export enum CorpTypes {
  // actual corp types

  BC_CCC = 'CC',
  BC_COMPANY = 'BC',
  BC_ULC_COMPANY = 'ULC',

  BENEFIT_COMPANY = 'BEN',
  COOP = 'CP',
  PARTNERSHIP = 'GP',
  SOLE_PROP = 'SP',

  CONTINUE_IN = 'C',
  BEN_CONTINUE_IN = 'CBEN',
  CCC_CONTINUE_IN = 'CCC',
  ULC_CONTINUE_IN = 'CUL',

  // colin
  BC_CORPORATION = 'CR', // SPECIAL NAMEREQUEST-ONLY ENTITY TYPE
  EXTRA_PRO_REG = 'EPR',
  LL_PARTNERSHIP = 'LL',
  LIMITED_CO = 'LLC',
  LIM_PARTNERSHIP = 'LP',
  BC_UNLIMITED = 'UL', // SPECIAL NAMEREQUEST-ONLY ENTITY TYPE
  XPRO_LL_PARTNR = 'XL',
  XPRO_LIM_PARTNR = 'XP',

  // others
  FINANCIAL = 'FI',
  PRIVATE_ACT = 'PA',
  PARISHES = 'PAR',

  // societies
  CONT_IN_SOCIETY = 'CS',
  SOCIETY = 'S',
  XPRO_SOCIETY = 'XS',

  // overloaded values
  AMALGAMATION_APPLICATION = 'ATMP',
  INCORPORATION_APPLICATION = 'TMP',
  CONTINUATION_IN = 'CTMP',
  NAME_REQUEST = 'NR',
  REGISTRATION = 'RTMP'
}
