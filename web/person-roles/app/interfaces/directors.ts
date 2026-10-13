// NB: CODPayload / CODFiling come from the base layer (interfaces/filing-bodies.ts)

/** Change of directors specific filing header fields. */
export interface ChangeOfDirectorsHeader {
  // required by the api validation
  effectiveDate: ApiDateTimeUtc
}

export type CODDraftState = FilingDraftState<CODFiling, ChangeOfDirectorsHeader>
