// NB: CODPayload / CODFiling come from the base layer (interfaces/filing-bodies.ts)

/** Change of directors specific filing header fields (not part of the shared filing header). */
export interface ChangeOfDirectorsHeader {
  // required by the legal-api validator - it bounds the director appointment/cessation dates
  effectiveDate: ApiDateTimeUtc
}

export type CODDraftState = FilingDraftState<CODFiling, ChangeOfDirectorsHeader>
