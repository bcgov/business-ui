// https://github.com/bcgov/business-schemas/blob/main/src/registry_schemas/schemas/review_imported_data.json
export interface ReviewImportedDataPayload extends FilingPayloadData {
  /** Only the offices the user changed - the schema takes offices, relationships or both. */
  offices?: Partial<Record<OfficeType, ApiBaseAddressObj>>
  /** Only the directors the user changed - each carries `entity.identifier` (the party id). */
  relationships?: BusinessRelationship[]
}

export interface ReviewImportedDataFiling {
  reviewImportedData: ReviewImportedDataPayload
}

export type ReviewImportedDataDraftState = FilingDraftState<ReviewImportedDataFiling>

export type MissingAddressFieldName = 'street' | 'city' | 'country' | 'postalCode' | 'region'

/**
 * One MISSING_REQUIRED_BUSINESS_INFO warning parsed from its code (lear #4867):
 * neither key = the office itself is missing, no `field` = the whole address is missing.
 */
export interface MissingAddressField {
  addressType?: 'mailingAddress' | 'deliveryAddress'
  field?: MissingAddressFieldName
}

/** The missing office / director address fields the Legal API flags on a migrated corp. */
export interface MissingInfoSummary {
  offices: Partial<Record<OfficeType, MissingAddressField[]>>
  /** keyed by party id (`entity.identifier`) */
  directors: Record<string, MissingAddressField[]>
}
