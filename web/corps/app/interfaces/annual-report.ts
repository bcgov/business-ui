// https://github.com/bcgov/business-schemas/blob/main/src/registry_schemas/schemas/annual_report.json
// NB: the schema's nested 'directors' and 'offices' blocks are not used for corps AR
export interface AnnualReportPayload extends FilingPayloadData {
  annualReportDate: IsoDatePacific
  nextARDate: IsoDatePacific
}

export interface ARFiling {
  annualReport: AnnualReportPayload
}

/** Annual report specific filing header fields (not part of the shared filing header). */
export interface AnnualReportHeader {
  // the dashboard todo list uses ARFilingYear to label and resume draft annual reports
  ARFilingYear: number
  effectiveDate: ApiDateTimeUtc
}

export type AnnualReportDraftState = FilingDraftState<ARFiling, AnnualReportHeader>
