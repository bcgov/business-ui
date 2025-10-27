export interface BusinessWarning {
  code: string
  message: string
  warningType: string
  filing: string
  data?: {
    amalgamationDate?: FormattedDateTimeGmt
    targetDissolutionDate?: IsoDatePacific
  }
}
