// NB: COAPayload / COAFiling come from the base layer (interfaces/filing-bodies.ts)

/** Change of address specific filing header fields (not part of the shared filing header). */
export interface ChangeOfAddressHeader {
  // NB: api forces a corps change of address effective 00:01 PT the day after submission
  futureEffectiveDate: ApiDateTimeUtc
}

export type COADraftState = FilingDraftState<COAFiling, ChangeOfAddressHeader>
