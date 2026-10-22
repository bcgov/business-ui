export interface BusinessWarning {
  code: string
  message: string
  warningType: string
  filing?: string
  data?: {
    amalgamationDate?: FormattedDateTimeGmt
    nextLiquidationReportMinDate?: FormattedDateTimeGmt
    officeType?: OfficeType // MISSING_REQUIRED_BUSINESS_INFO office codes
    overdueARs?: boolean
    overdueTransition?: boolean
    partyId?: number // MISSING_REQUIRED_BUSINESS_INFO director codes (= parties.id)
    stage_1_date?: ApiDateTimeUtc // the date the business entered stage 1
    stage_2_date?: ApiDateTimeUtc // the date the business entered stage 2
    targetDissolutionDate?: IsoDatePacific
    targetStage2Date?: IsoDatePacific
    userDelays?: number
  }
}
