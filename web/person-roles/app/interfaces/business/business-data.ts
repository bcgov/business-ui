/**
 * Interface for business information object in store
 * and sent to/from the API.
 * Ref: https://github.com/bcgov/business-schemas/blob/main/src/registry_schemas/schemas/business.json
 */
export interface BusinessDataSlim {
  adminFreeze: boolean
  alternateNames: AlternateName[]
  foundingDate: ApiDateTimeUtc
  goodStanding: boolean
  identifier: string
  inDissolution: boolean
  legalName: string
  legalType: CorpTypeCd
  lastModified: ApiDateTimeUtc
  state: EntityState
  taxId?: string // incorporation number
}

export interface BusinessData extends BusinessDataSlim {
  cacheId?: number
  allowedActions: AllowedActions
  arMaxDate: IsoDatePacific
  arMinDate: IsoDatePacific
  associationType?: AssociationType | null
  complianceWarnings: unknown[]
  fiscalYearEndDate: IsoDatePacific
  hasCorrections: boolean
  hasCourtOrders: boolean
  hasRestrictions: boolean | null
  lastAddressChangeDate: IsoDatePacific
  lastAnnualGeneralMeetingDate: IsoDatePacific
  lastAnnualReportDate: IsoDatePacific
  lastDirectorChangeDate: IsoDatePacific
  lastLedgerTimestamp: ApiDateTimeUtc
  naicsCode: string | null
  naicsDescription: string | null
  naicsKey: string | null
  nextAnnualReport: ApiDateTimeUtc
  noDissolution: boolean
  submitter: string
  warnings: BusinessWarning[]
  // nrNumber?: string // TODO: include these values
  // startDate?: IsoDatePacific // YYYY-MM-DD
  // stateFiling?: string
}
