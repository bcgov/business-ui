/**
 * Interface for business information object in store
 * and sent to/from the API.
 * Ref: https://github.com/bcgov/business-schemas/blob/main/src/registry_schemas/schemas/business.json
 */
export interface BusinessDataPublic {
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
  // available when not pulling slim data (edge case requests can be very slow)
  warnings?: BusinessWarning[]
}

export interface BusinessData extends BusinessDataPublic {
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
  // nrNumber?: string // TODO: include these values
  // startDate?: IsoDatePacific // YYYY-MM-DD
  // stateFiling?: string
}
