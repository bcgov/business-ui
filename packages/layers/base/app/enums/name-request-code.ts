/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
//
// Various codes found in NR objects.
// (may be sorted by code)
//

// ref: https://github.com/bcgov/namex/blob/main/api/namex/constants/__init__.py
// ref: https://github.com/bcgov/lear/blob/main/legal-api/src/legal_api/resources/v1/nr_type_map.py
export enum NrRequestTypeCode {
  // change name
  CHANGE_BEN = 'BEC', // used for both BEN and CBEN
  CHANGE_CC = 'CCC', // used for both CC and CCC
  CHANGE_COOP = 'CCP',
  CHANGE_CORP = 'CCR', // used for both BC and C
  CHANGE_FIRM = 'CFR', // SP, DBA or GP
  CHANGE_ULC = 'CUL', // used for both ULC and CUL

  // continuation in
  CONTINUATION_IN_BEN = 'BECT',
  CONTINUATION_IN_CCC = 'CCCT',
  CONTINUATION_IN_COOP = 'CTC',
  CONTINUATION_IN_CORP = 'CT',
  CONTINUATION_IN_ULC = 'ULCT',

  // convert (aka alteration)
  CONVERT_BC_TO_BEN = 'BECV', // BC Limited -> Benefit Company // used for both BC and C
  CONVERT_BC_TO_CCC = 'CCV', // BC Limited -> Community Contribution Company // used for both BC and C
  CONVERT_BC_TO_ULC = 'UC', // BC Limited -> Unlimited Liability Company // used for both BC and C
  CONVERT_BEN_TO_BC = 'BECR', // Benefit Company -> BC Limited Company // used for both BEN and CBEN
  CONVERT_BEN_TO_CCC = 'BECC', // Benefit Company -> Community Contribution Company // used for both BEN and CBEN
  CONVERT_ULC_TO_BC = 'ULCB', // Unlimited Liability Company -> BC Limited Company // used for both ULC and CUL
  CONVERT_ULC_TO_BEN = 'ULBE', // Unlimited Liability Company -> Benefit Company // used for both ULC and CUL

  // new (or amalgamation)
  NEW_BC = 'BC', // Benefit Company
  NEW_CCC = 'CC', // Community Contribution Company
  NEW_COOP = 'CP', // Cooperative
  NEW_CORP = 'CR', // Corporation = BC Limited Company
  NEW_FIRM = 'FR', // Firm = Sole Proprietorship/General Partnership/DBA
  NEW_ULC = 'UL', // Unlimited Liability Company
  NEW_XPRO_CORP = 'XCR', // Corporation (Foreign)

  // restoration
  RESTORATION_CCC = 'RCC', // used for both CC and CCC
  RESTORATION_COOP = 'RCP',
  RESTORATION_CORP = 'RCR', // used for both BC and C
  RESTORATION_SOC = 'RSO',
  RESTORATION_BEN = 'BERE', // used for both BEN and CBEN
  RESTORATION_ULC = 'RUL', // used for both ULC and CUL

  // others, may be legacy or future
  LC = 'LC', // new XPRO_LL_PARTNR
  CLC = 'CLC', // change XPRO_LL_PARTNR
  RLC = 'RLC', // restoration XPRO_LL_PARTNR
  AL = 'AL', // assumed name XPRO_LL_PARTNR
  LL = 'LL', // new LL_PARTNERSHIP
  CLL = 'CLL', // change LL_PARTNERSHIP
  XLL = 'XLL', // new XPRO_LL_PARTNR
  XCLL = 'XCLL', // change XPRO_LL_PARTNR
  LP = 'LP', // new LIM_PARTNERSHIP
  CLP = 'CLP', // change LIM_PARTNERSHIP
  SO = 'SO', // new SOCIETY
  ASO = 'ASO', // amlagamate SOCIETY
  CSO = 'CSO', // change SOCIETY
  RSO = 'RSO', // restoration SOCIETY
  CTSO = 'CTSO', // move SOCIETY
  CSSO = 'CSSO', // convert SOCIETY
  XSO = 'XSO', // new XPRO_SOCIETY
  XCSO = 'XCSO', // change XPRO_SOCIETY
  XRSO = 'XRSO', // restoration XPRO_SOCIETY
  XASO = 'XASO', // assumed name XPRO_SOCIETY
  XCASO = 'XCASO', // achg XPRO_SOCIETY
  XCP = 'XCP', // new XPRO_COOP
  XCCP = 'XCCP', // change XPRO_COOP
  XRCP = 'XRCP', // restoration XPRO_COOP
  FI = 'FI', // new FINANCIAL
  CFI = 'CFI', // change FINANCIAL
  RFI = 'RFI', // restoration FINANCIAL
  PA = 'PA', // new PRIVATE_ACT
  PAR = 'PAR', // new PARISHES
  BEAM = 'BEAM' // amalgamate BCOMP
}

export enum NrRequestActionCode {
  AMALGAMATE = 'AML',
  ASSUMED = 'ASSUMED', // FUTURE: should be AS (as in LEAR)?
  CHANGE_NAME = 'CHG',
  CONVERSION = 'CNV', // aka Alteration
  DBA = 'DBA', // doing business as
  MOVE = 'MVE', // continuation in
  NEW_BUSINESS = 'NEW', // incorporate or register
  RESTORE = 'REH', // restore or reinstate
  RENEW = 'REN', // restore with new name request
  RESTORATION = 'REST', // FUTURE: unused? delete?
  RESUBMIT = 'RESUBMIT', // FUTURE: unused? delete?

  INFO = 'INFO' // special value for sub-menu
}
