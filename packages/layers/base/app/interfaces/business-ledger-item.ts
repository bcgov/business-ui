export interface BusinessLedgerItem {
  availableOnPaperOnly: boolean
  businessIdentifier: string
  commentsCount: number
  commentsLink: string // URL to fetch this filing's comments
  displayName: string
  displayLedger: boolean // whether to display this ledger item
  documentsLink: string // URL to fetch this filing's documents
  effectiveDate: FormattedDateTimeGmt
  filingId: number
  filingLink: string // URL to fetch this filing
  filingSubType?: FilingSubType
  isFutureEffective: boolean
  name: FilingType
  status: FilingStatus
  paymentDate?: FormattedDateTimeGmt
  submittedDate: FormattedDateTimeGmt
  submitter: string
  withdrawalPending: boolean

  // correction filings only - TODO: figure out which one is right
  correctedFilingId?: string // ID of filing this filing corrects
  correctedLink?: string // URL to fetch filing this filing corrects
  correctionFilingId?: string // ID of this filing's correction
  correctionLink?: string // URL to fetch this filing's correction

  // continuation in filings only // copied it on 2024-07-25
  latestReviewComment?: string

  // filing-specific data (not always present)
  data?: {
    applicationDate?: ApiDateTimeUtc
    legalFilings?: Array<string>
    withdrawnDate?: ApiDateTimeUtc

    adminFreeze?: {
      freeze: boolean
    }

    agmExtension?: {
      year: IsoDatePacific
      isFirstAgm: boolean
      prevAgmRefDate: IsoDatePacific
      extReqForAgmYear: boolean
      expireDateCurrExt: IsoDatePacific
      totalApprovedExt: number // in months
      extensionDuration: number // in months
      expireDateApprovedExt: IsoDatePacific
    }

    agmLocationChange?: {
      year: string
      reason: string
      agmLocation: string
    }

    alteration?: {
      fromLegalType?: CorpTypeCd
      toLegalType?: CorpTypeCd
    }

    amalgamationApplication?: {
      type: AmalgamationType
    }

    amalgamationOut?: {
      amalgamationOutDate: IsoDatePacific
      courtOrder?: unknown
      country: string
      details?: string
      legalName: string
      region: string // may be null
    }

    annualReport?: {
      annualGeneralMeetingDate: IsoDatePacific
      annualReportDate: IsoDatePacific
      annualReportFilingYear?: number
    }

    changeOfAddress?: unknown

    changeOfDirectors?: unknown

    consentAmalgamationOut?: {
      country: string
      expiry: IsoDatePacific
      region: string // may be null
    }

    consentContinuationOut?: {
      country: string
      expiry: IsoDatePacific
      region: string // may be null
    }

    continuationIn?: unknown

    continuationOut?: {
      continuationOutDate: IsoDatePacific
      courtOrder?: unknown
      country: string
      details?: string
      legalName: string
      region: string // may be null
    }

    conversion?: unknown

    order?: {
      effectOfOrder?: 'planOfArrangement'
      fileNumber: string // may be null
      orderDate?: string
      orderDetails?: string
    }

    dissolution?: {
      custodialOffice?: unknown // FUTURE: use a proper address type here
      dissolutionDate: IsoDatePacific
      dissolutionType: 'administrative' | 'involuntary' | 'voluntary'
    }

    incorporationApplication?: unknown

    registrarsNotation?: unknown

    registrarsOrder?: unknown

    restoration?: {
      expiry: IsoDatePacific
      toLegalName: string
    }

    putBackOff?: {
      expiryDate: string // YYYY-MM-DD
      reason: string
    }

    specialResolution?: {
      meetingDate?: string
      resolution?: string
      resolutionDate?: string
      signingDate?: string
      signatory?: Person
    }

    transition?: unknown
  }

  // properties added by the UI
  comments?: BusinessComment[]
  documents?: BusinessDocument[]
}
