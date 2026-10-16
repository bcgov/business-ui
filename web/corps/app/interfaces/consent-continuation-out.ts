// https://github.com/bcgov/business-schemas/blob/main/src/registry_schemas/schemas/consent_continuation_out.json
// NB: courtOrder comes from FilingPayloadData - staff only and only sent when a number is entered
export interface CCOPayload extends FilingPayloadData {
  foreignJurisdiction: ForeignJurisdictionSchema
  // staff only: the filer turns this into a ledger comment on the business
  details?: string
}

export interface CCOFiling {
  consentContinuationOut: CCOPayload
}

/** Consent to continuation out specific filing header fields (not part of the shared filing header). */
export interface ConsentContinuationOutHeader {
  // NB: no effectiveDate - the filer derives the 6 month consent expiry from the real effective date
  authorizationReceived: boolean
  documentOptionalEmail: string
}

export type CCODraftState = FilingDraftState<CCOFiling, ConsentContinuationOutHeader>
