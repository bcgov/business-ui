/**
 * Amalgamation info returned in the business slim/public json when the
 * business has been amalgamated into another company.
 */
export interface BusinessAmalgamatedInto {
  amalgamationDate: ApiDateTimeUtc
  amalgamationType?: string
  courtApproval?: boolean
  identifier?: string
  legalName?: string
}

/** Filing body values returned by GET businesses/{id}/filings/{filingId}?public=true */
export interface PublicStateFilingBody {
  type?: string
  reason?: string
  expiryDate?: IsoDatePacific
  dissolutionDate?: IsoDatePacific
}

/** Response from GET businesses/{id}/filings/{filingId}?public=true */
export interface PublicStateFilingResponse {
  filing: {
    header: {
      name: string
      effectiveDate: ApiDateTimeUtc
    }
  } & Partial<Record<string, PublicStateFilingBody>>
}
