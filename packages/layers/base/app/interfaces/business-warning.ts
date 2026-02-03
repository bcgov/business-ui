export interface BusinessWarning {
  code: string
  message: string
  warningType: string
  filing: string
  data?: {
    amalgamationDate?: FormattedDateTimeGmt
    stage_1_date?: ApiDateTimeUtc // the date the business entered stage 1
    stage_2_date?: ApiDateTimeUtc // the date the business entered stage 2
    targetDissolutionDate?: IsoDatePacific
    targetStage2Date?: IsoDatePacific
    userDelays?: number
  }
}
