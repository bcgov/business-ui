export interface FilingHeaderResponse {
  accountId: number
  affectedFilings: Array<unknown>
  availableOnPaperOnly: boolean
  certifiedBy: string
  colinIds: Array<unknown>
  comments: Array<unknown>
  date: ApiDateTimeUtc
  deletionLocked: boolean
  effectiveDate: ApiDateTimeUtc
  filingId: number
  inColinOnly: boolean
  isCorrected: boolean
  isCorrectionPending: boolean
  isPaymentActionRequired: boolean
  name: FilingType
  paymentAccount: string
  paymentStatusCode: PaymentStatus
  paymentToken: string
  status: FilingStatus
  submitter: string
  latestReviewComment?: string
  paymentDate?: ApiDateTimeUtc
  paymentMethod?: ConnectPayMethod
  folioNumber?: string
  type?: FilingHeaderType
}

export type FilingHeaderSubmission = Pick<FilingHeaderResponse,
  'name'
  | 'certifiedBy'
  | 'accountId'
  | 'date'
  | 'paymentMethod'
  | 'folioNumber'
  | 'type'
>

export type FilingBusiness = Pick<BusinessData,
  'identifier'
  | 'foundingDate'
  | 'legalName'
  | 'legalType'
>

export interface FilingBaseData {
  header: FilingHeaderResponse
  business: FilingBusiness
}

export interface FilingSubmissionBaseData {
  header: FilingHeaderSubmission
  business: FilingBusiness
}

export interface FilingSubmissionBody<F extends Record<string, unknown>> {
  filing: FilingSubmissionBaseData & F
}

export interface FilingPostResponse<F extends Record<string, unknown>> {
  filing: FilingBaseData & F
}

export interface FilingPutResponse<F extends Record<string, unknown>> {
  filing: FilingBaseData & F
  errors: Array<unknown>
}

export interface FilingGetByIdResponse<F> {
  filing: FilingBaseData & F
  filingLink: string // url
  isFutureEffective: boolean
  withdrawalPending: boolean
  commentsCount: number
  commentsLink: string // url
  displayLedger: boolean
  documentsLink: string // url
}
