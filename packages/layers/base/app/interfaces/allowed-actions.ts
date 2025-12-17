export interface AllowedActions {
  filing: {
    filingSubmissionLink: string
    filingTypes: Array<{
      displayName: string
      feeCode: string
      name: string
      type?: string
    }>
  }
  digitalBusinessCard: boolean
  viewAll: boolean
}
