/**
 * Cooperative (CP) annual report filing payload.
 * See: https://github.com/bcgov/business-schemas/blob/main/src/registry_schemas/schemas/annual_report.json
 *
 * NB: the nested `offices`/`directors` blocks are not used by the filer, but they are used by the report.
 * Office/director changes travel in the sibling `changeOfAddress`/`changeOfDirectors` blocks instead.
 * FUTURE: decide whether to update the report to pull from the db or add `offices`/`directors` blocks here
 */
export interface CoopARPayload extends FilingPayloadData {
  annualReportDate: IsoDatePacific
  annualGeneralMeetingDate: IsoDatePacific | null
  didNotHoldAgm: boolean
}

/** Registered office change bundled under a coop annual report (Phase 2). */
export interface CoopARChangeOfAddressPayload extends FilingPayloadData {
  legalType: CorpTypeCd
  offices: Pick<ApiEntityOfficeAddress, 'registeredOffice'>
}

/** Director change bundled under a coop annual report (Phase 2) - relationships shape only. */
export interface CoopARChangeOfDirectorsPayload extends FilingPayloadData {
  relationships: BusinessRelationship[]
}

export interface CoopARFiling {
  annualReport: CoopARPayload
  changeOfAddress?: CoopARChangeOfAddressPayload
  changeOfDirectors?: CoopARChangeOfDirectorsPayload
}

/**
 * Coop annual report header extras.
 * NB: round-tripped on drafts - the business dashboard AR todo reads them when resuming a draft.
 */
export interface CoopARHeaderExtras {
  ARFilingYear: number
  arMinDate: IsoDatePacific
  arMaxDate: IsoDatePacific
  // the as-of date (AGM date) of the whole bundle - the bundled change of directors requires it
  effectiveDate: ApiDateTimeUtc
}

export type CoopARDraftState = FilingDraftState<CoopARFiling, CoopARHeaderExtras>
