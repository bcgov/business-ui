/**
 * Continuation out filing payload.
 * See: https://github.com/bcgov/business-schemas/blob/main/src/registry_schemas/schemas/continuation_out.json
 *
 * NB: the effective date of the filing lives in this body as `continuationOutDate` -
 * never as `header.effectiveDate` (that would make the filing future effective).
 *
 * FUTURE: continuationOutDate, foreignJurisdiction, legalName (the name in the new jurisdiction),
 * documents[] (fileKey/fileName/fileLastModified/fileSize) and details (staff ledger comment).
 * NB: courtOrder comes from FilingPayloadData - only sent when a number is entered.
 */
export type ContOutPayload = FilingPayloadData

export interface ContOutFiling {
  continuationOut: ContOutPayload
}

/** Continuation out specific filing header fields (not part of the shared filing header). */
export interface ContinuationOutHeader {
  // the continuation out fee (COUTI) is always waived - staff only filing
  waiveFees: boolean
  authorizationReceived: boolean
  documentOptionalEmail: string
}

/**
 * The continuation out draft filing loaded on page init.
 * NB: draft is always pre-created (filing id is a required route param),
 * so never an "unsaved/new filing" state.
 */
export type ContOutDraftState = FilingDraftState<ContOutFiling, ContinuationOutHeader>

/**
 * The consent to continue out (`?consentFilingId`) this continuation out is filed against.
 * The window is kept in the API's UTC date-time format.
 */
export interface ContOutConsentInfo {
  consentFilingId?: string
  validFrom?: ApiDateTimeUtc // the consent filing's header.effectiveDate
  validTo?: ApiDateTimeUtc // validFrom + 6 months
}
