export interface FilingHeader {
  accountId: number
  affectedFilings: Array<unknown>
  availableOnPaperOnly: boolean
  certifiedBy: string
  colinIds: Array<unknown>
  comments: Array<unknown>
  date: string // isodate
  deletionLocked: boolean
  effectiveDate: string // isodate
  filingId: number
  inColinOnly: boolean
  isCorrected: boolean
  isCorrectionPending: boolean
  isPaymentActionRequired: boolean
  name: string
  paymentAccount: string
  paymentStatusCode: PaymentStatus
  paymentToken: string
  status: FilingStatus
  submitter: string
}

export type FilingBusiness = Pick<BusinessData,
  'identifier' |
  'foundingDate' |
  'legalName' |
  'legalType'
>

export interface FilingPostResponse {
  filing: {
    header: FilingHeader
    business: FilingBusiness
  }
}
