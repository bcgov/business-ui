// Correctable sections by corrected filing type, from the corrections design spreadsheet.
// Corrections should only show the data elements present on the filing being corrected.

/** A section of the correction filing that can be corrected. */
export enum CorrectionSection {
  AMALGAMATION = 'amalgamation',
  COURT_ORDERS = 'courtOrders',
  CUSTODIANS = 'custodians',
  DIRECTORS = 'directors',
  INCORPORATORS = 'incorporators', // FUTURE: no incorporators section yet
  LIQUIDATORS = 'liquidators',
  OFFICES = 'offices',
  RECEIVERS = 'receivers',
  SHARE_STRUCTURE = 'shareStructure',
  YOUR_COMPANY = 'yourCompany'
}

/** Correctable sections for filing types that are not configured below. */
const DEFAULT_SECTIONS: CorrectionSection[] = [
  CorrectionSection.YOUR_COMPANY,
  CorrectionSection.OFFICES,
  CorrectionSection.DIRECTORS,
  CorrectionSection.RECEIVERS,
  CorrectionSection.LIQUIDATORS,
  CorrectionSection.SHARE_STRUCTURE,
  CorrectionSection.COURT_ORDERS
]

/** Key of the sections used when the filing has no subtype, or a subtype that is not configured. */
const DEFAULT_SUBTYPE = 'default'

/**
 * A list of sections for the whole filing type, or a map of subtype to list of sections when the subtype matters.
 * A subtype map must have a DEFAULT_SUBTYPE entry, used when the subtype is missing, empty or not configured.
 */
type SectionsConfig = CorrectionSection[]
  | (Partial<Record<string, CorrectionSection[]>> & Record<typeof DEFAULT_SUBTYPE, CorrectionSection[]>)

const LIQUIDATOR_SECTIONS = [
  CorrectionSection.LIQUIDATORS,
  CorrectionSection.OFFICES, // liquidation records office
  CorrectionSection.COURT_ORDERS
]
const RECEIVER_SECTIONS = [CorrectionSection.RECEIVERS, CorrectionSection.COURT_ORDERS]
const AMALGAMATION_REGULAR_SECTIONS = [
  CorrectionSection.YOUR_COMPANY,
  CorrectionSection.OFFICES,
  CorrectionSection.DIRECTORS,
  CorrectionSection.SHARE_STRUCTURE,
  CorrectionSection.AMALGAMATION, // foreign amalgamating businesses (modify only) and amalgamation statement
  CorrectionSection.COURT_ORDERS
]
const AMALGAMATION_SHORT_FORM_SECTIONS = [
  CorrectionSection.OFFICES,
  CorrectionSection.AMALGAMATION, // foreign amalgamating businesses (modify only) and amalgamation statement
  CorrectionSection.COURT_ORDERS
]

/**
 * Correctable sections by corrected filing type ("Correction Fields (Future)" column of the design spreadsheet).
 * An empty list means there is nothing to correct (comment only).
 */
const CORRECTABLE_SECTIONS: Partial<Record<FilingType, SectionsConfig>> = {
  [FilingType.AGM_EXTENSION]: [],
  [FilingType.AGM_LOCATION_CHANGE]: [],
  [FilingType.AMALGAMATION_APPLICATION]: {
    [FilingSubType.AMALGAMATION_REGULAR]: AMALGAMATION_REGULAR_SECTIONS,
    [FilingSubType.AMALGAMATION_HORIZONTAL]: AMALGAMATION_SHORT_FORM_SECTIONS,
    [FilingSubType.AMALGAMATION_VERTICAL]: AMALGAMATION_SHORT_FORM_SECTIONS,
    [DEFAULT_SUBTYPE]: AMALGAMATION_REGULAR_SECTIONS // an amalgamation with no subtype is a regular amalgamation
  },
  [FilingType.AMALGAMATION_OUT]: [
    CorrectionSection.YOUR_COMPANY, // effective date, jurisdiction and name in foreign jurisdiction
    CorrectionSection.COURT_ORDERS
  ],
  [FilingType.ANNUAL_REPORT]: [],
  [FilingType.CHANGE_OF_ADDRESS]: [CorrectionSection.OFFICES],
  [FilingType.CHANGE_OF_DIRECTORS]: [CorrectionSection.DIRECTORS],
  [FilingType.CHANGE_OF_LIQUIDATORS]: {
    [FilingSubType.INTENT_TO_LIQUIDATE]: [
      CorrectionSection.LIQUIDATORS,
      CorrectionSection.OFFICES // liquidation records office
    ],
    [FilingSubType.APPOINT_LIQUIDATOR]: LIQUIDATOR_SECTIONS,
    [FilingSubType.CEASE_LIQUIDATOR]: LIQUIDATOR_SECTIONS,
    [FilingSubType.CHANGE_ADDRESS_LIQUIDATOR]: LIQUIDATOR_SECTIONS,
    [FilingSubType.LIQUIDATION_REPORT]: [],
    [DEFAULT_SUBTYPE]: LIQUIDATOR_SECTIONS
  },
  // FUTURE: confirm per receiver filing - one receiver table in the spreadsheet also includes liquidators
  [FilingType.CHANGE_OF_RECEIVERS]: {
    [FilingSubType.APPOINT_RECEIVER]: RECEIVER_SECTIONS,
    [FilingSubType.AMEND_RECEIVER]: RECEIVER_SECTIONS,
    [FilingSubType.CEASE_RECEIVER]: RECEIVER_SECTIONS,
    [FilingSubType.CHANGE_ADDRESS_RECEIVER]: RECEIVER_SECTIONS,
    [DEFAULT_SUBTYPE]: RECEIVER_SECTIONS
  },
  [FilingType.CONSENT_AMALGAMATION_OUT]: [CorrectionSection.COURT_ORDERS],
  [FilingType.CONSENT_CONTINUATION_OUT]: [CorrectionSection.COURT_ORDERS],
  [FilingType.CONTINUATION_IN]: [
    CorrectionSection.YOUR_COMPANY, // name, previous jurisdiction details and name translations
    CorrectionSection.OFFICES,
    CorrectionSection.DIRECTORS,
    CorrectionSection.SHARE_STRUCTURE,
    CorrectionSection.COURT_ORDERS
  ],
  [FilingType.CONTINUATION_OUT]: [
    CorrectionSection.YOUR_COMPANY, // date, jurisdiction and name in foreign jurisdiction
    CorrectionSection.COURT_ORDERS
  ],
  [FilingType.COURT_ORDER]: [CorrectionSection.COURT_ORDERS], // number, text and file (add new file only)
  [FilingType.DISSOLUTION]: {
    [FilingSubType.DISSOLUTION_VOLUNTARY]: [
      CorrectionSection.CUSTODIANS,
      CorrectionSection.COURT_ORDERS
    ],
    [DEFAULT_SUBTYPE]: DEFAULT_SECTIONS // FUTURE: configure the other dissolution types
  },
  [FilingType.INCORPORATION_APPLICATION]: [
    CorrectionSection.YOUR_COMPANY,
    CorrectionSection.OFFICES,
    CorrectionSection.INCORPORATORS,
    CorrectionSection.DIRECTORS,
    CorrectionSection.SHARE_STRUCTURE,
    CorrectionSection.COURT_ORDERS
  ],
  [FilingType.REGISTRARS_NOTATION]: [],
  [FilingType.REGISTRARS_ORDER]: []
}

/** Get the correctable sections for a corrected filing type (and subtype, if any). */
export function getCorrectableSections(filingType: FilingType, subType?: string): CorrectionSection[] {
  const sections = CORRECTABLE_SECTIONS[filingType]
  if (!sections) {
    return DEFAULT_SECTIONS
  }
  if (Array.isArray(sections)) {
    return sections
  }
  return (subType && sections[subType]) || sections[DEFAULT_SUBTYPE]
}
