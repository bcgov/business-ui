/* eslint-disable */ // Duplicate enum member value Alteration
export enum NrRequestTypeStrings {
  // Alteration
  BECV = 'Alteration', // BC Benefit Company Incorporation
  CSSO = 'Alteration', // Society
  ULBE = 'Alteration', // BC Benefit Company
  ULCR = 'Alteration', // B.C. limited Company
  XCSO = 'Alteration', // Extraprovincial Society

  // Amalgamation
  ASO = 'Amalgamation', // Society
  BEAM = 'Amalgamation', // BC Benefit Company Incorporation
  XCUL = 'Amalgamation', // (Future) Extraprovincial Unlimited Liability Company

  // Assumed Name (not used to display NR type, kept for reference)
  // AL = 'Assumed Name', // Extraprovincial Limited Liability Company
  // AS = 'Assumed Name', // (Future) Extraprovincial Cooperative
  // UA = 'Assumed Name', // (Future) Extraprovincial Unlimited Liability Company
  XASO = 'Assumed Name', // Extraprovincial Society

  // Change Assumed Name (not used to display NR type, kept for reference)
  XCASO = 'Change Assumed Name', // Extraprovincial Society

  // Continuation in
  BECT = 'Continuation In', // BC Benefit Company Incorporation
  CCCT = 'Continuation In', // Community Contribution Co.
  CT = 'Continuation In', // B.C. Company
  CTC = 'Continuation In', // Cooperative
  CTSO = 'Continuation In', // Society
  ULCT = 'Continuation In', // Unlimited Liability Co.

  // Conversion
  BECR = 'Conversion (Act)', // BC Benefit Company Incorporation
  CCV = 'Conversion (Act)', // Community Contribution Co.
  UC = 'Conversion (Act)', // Unlimited Liability Co.
  ULCB = 'Conversion (Act)', // Unlimited Liability Co.

  // Incorporation
  BC = 'Incorporation', // BC Benefit Company Incorporation
  CC = 'Incorporation', // Community Contribution Co.
  CP = 'Incorporation', // Cooperative
  CR = 'Incorporation', // B.C. Company
  FI = 'Incorporation', // Financial Institution (BC)
  PA = 'Incorporation', // Private Act
  PAR = 'Incorporation', // Parish
  SO = 'Incorporation', // Society
  UL = 'Incorporation', // Unlimited Liability Co.
  XCR = 'Incorporation', // (Future) Extraprovincial Corporation
  XCP = 'Incorporation', // Extraprovincial Cooperative
  XSO = 'Incorporation', // Extraprovincial Society
  XUL = 'Incorporation', // (Future) Extraprovincial Unlimited Liability Company

  // Name Change
  BEC = 'Name Change', // BC Benefit Company Incorporation
  CCC = 'Name Change', // Community Contribution Co.
  CCP = 'Name Change', // Cooperative
  CCR = 'Name Change', // B.C. Company
  CFI = 'Name Change', // Financial Institution (BC)
  CFR = 'Name Change', // Sole Proprietorship/General Partnership/DBA
  CLC = 'Name Change', // Extraprovincial Limited Liability Company
  CLL = 'Name Change', // Limited Liability Partnership
  CLP = 'Name Change', // Limited Partnership
  CSO = 'Name Change', // Society
  CUL = 'Name Change', // Unlimited Liability Co.
  XCCP = 'Name Change', // Extraprovincial Cooperative
  XCCR = 'Name Change', // (Future) Extraprovincial Corporation
  XCLL = 'Name Change', // Extraprovincial Limited Liability Partnership
  XCLP = 'Name Change', // Extraprovincial Limited Partnership

  // Registration
  FR = 'Registration', // Sole Proprietorship/General Partnership/DBA
  LC = 'Registration', // Extraprovincial Limited Liability Company
  LL = 'Registration', // Limited Liability Partnership
  LP = 'Registration', // Limited Partnership
  XLL = 'Registration', // Extraprovincial Limited Liability Partnership
  XLP = 'Registration', // Extraprovincial Limited Partnership

  // Reinstatement
  RLC = 'Reinstatement', // Extraprovincial Limited Liability Company
  XRCR = 'Reinstatement', // (Future) Extraprovincial Corporation

  // Restoration
  BERE = 'Restoration', // BC Benefit Company Incorporation
  RCC = 'Restoration', // Community Contribution Co.
  RCP = 'Restoration', // Cooperative
  RCR = 'Restoration', // B.C. Company
  RFI = 'Restoration', // Financial Institution (BC)
  RSO = 'Restoration', // Society
  RUL = 'Restoration', // Unlimited Liability Co.
  XRCP = 'Restoration', // Extraprovincial Cooperative
  XRSO = 'Restoration', // Extraprovincial Society
  XRUL = 'Restoration', // (Future) Extraprovincial Unlimited Liability Company
  AL = 'PLACEHOLDER' // TODO: find this enum value
}
