/**
 * Correction filing interfaces.
 *
 * Reference: https://github.com/bcgov/business-schemas/blob/main/src/registry_schemas/schemas/correction.json
 *
 * A correction filing allows correcting data from a previously filed filing.
 * The CorrectionPayload contains the corrected data that will be submitted to the API.
 */

/** The type of correction being filed */
export enum CorrectionType {
  CLIENT = 'CLIENT',
  STAFF = 'STAFF'
}

/**
 * Payload interface for the correction filing data sent to/from the API.
 *
 * Based on CorrectionInformationIF from the legacy app:
 * - comment: required detail comment (max 4096 characters)
 * - correctedFilingId: the filing ID of the original filing being corrected
 * - correctedFilingDate: the date of the original filing (YYYY-MM-DD)
 * - correctedFilingType: the type of the original filing being corrected
 * - type: whether this is a CLIENT or STAFF correction
 */
export interface CorrectionPayload extends FilingPayloadData {
  comment: string // max 4096 characters
  correctedFilingId: number
  correctedFilingDate?: string // YYYY-MM-DD
  correctedFilingType: FilingType
  type: CorrectionType
  legalType?: CorpTypeCd

  // Optional corrected business data
  business?: {
    identifier: string
    naics?: {
      naicsCode: string
      naicsDescription: string
    }
  }

  contactPoint?: {
    email: string
    phone?: string
    extension?: string
  }

  // Name-related corrections
  nameRequest?: {
    legalName: string
    nrNumber?: string
  }
  nameTranslations?: Array<{
    id?: string
    name: string
    oldName?: string
    action?: string
  }>

  // Office corrections
  offices?: ApiEntityOfficeAddress

  // Party/Director corrections — uses BusinessRelationship format (with `entity`)
  // All party types (directors, receivers, liquidators) are combined in one array
  relationships?: BusinessRelationship[]

  // Completing party (client corrections) — uses legacy parties format
  parties?: Array<{
    officer: {
      firstName: string
      middleName?: string
      lastName: string
    }
    mailingAddress: ApiAddress
    roles: Array<{
      roleType: string
      appointmentDate?: string
    }>
  }>

  // Share structure corrections
  // API returns ShareClass format with extra `action` (singular) field;
  // UI submits with `actions` (plural) array — using flexible type for both directions
  shareStructure?: {
    shareClasses: Array<ShareClass & { action?: string, actions?: ActionType[] }>
    resolutionDates?: string[]
  }

  // TODO: add additional correction-specific fields as needed
  // memorandum?: unknown
  // rules?: unknown
  // resolution?: unknown
}

export interface CorrectionFiling {
  correction: CorrectionPayload
}

export type CorrectionDraftState = FilingGetByIdResponse<CorrectionFiling>
