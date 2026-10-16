// https://github.com/bcgov/business-schemas/blob/main/src/registry_schemas/schemas/consent_amalgamation_out.json
// NB: courtOrder comes from FilingPayloadData - staff only and only sent when a number is entered
// NB: unlike consentContinuationOut there is no details property - the filer creates no ledger comment
export interface CAOPayload extends FilingPayloadData {
  foreignJurisdiction: ForeignJurisdictionSchema
}

export interface CAOFiling {
  consentAmalgamationOut: CAOPayload
}

/** Consent to amalgamation out specific filing header fields (not part of the shared filing header). */
export interface ConsentAmalgamationOutHeader {
  // NB: no effectiveDate - the filer derives the 6 month consent expiry from the real effective date
  authorizationReceived: boolean
  documentOptionalEmail: string
}

export type CAODraftState = FilingDraftState<CAOFiling, ConsentAmalgamationOutHeader>
