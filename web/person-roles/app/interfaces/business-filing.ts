export interface FilingHeaderResponse {
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
  paymentMethod?: ConnectPaymentMethod
}

export type FilingHeaderSubmission = Pick<FilingHeaderResponse,
  'name' |
  'certifiedBy' |
  'accountId' |
  'date' |
  'paymentMethod'
>

export type FilingBusiness = Pick<BusinessData,
  'identifier' |
  'foundingDate' |
  'legalName' |
  'legalType'
>

export interface FilingBaseData {
  header: FilingHeaderResponse
  business: FilingBusiness
}

export interface FilingSubmissionBaseData {
  header: FilingHeaderSubmission
  business: FilingBusiness
}

export type FilingWithPayload<T extends string, P> = FilingBaseData & {
  [K in T]: P // K is the filingName, P is the payload type
}

export type FilingSubmissionWithPayload<T extends string, P> = FilingSubmissionBaseData & {
  [K in T]: P
}

export interface FilingSubmissionBody<T extends string, P> {
  filing: FilingSubmissionWithPayload<T, P>
}

export interface FilingPostResponse<T extends string, P> {
  filing: FilingWithPayload<T, P>
}

export interface FilingPutResponse<T extends string, P> {
  filing: FilingWithPayload<T, P>
  errors: Array<unknown>
}

export interface FilingGetByIdResponse<T extends string, P> {
  filing: FilingWithPayload<T, P>
  filingLink: string // url
  isFutureEffective: boolean
  withdrawalPending: boolean
  commentsCount: number
  commentsLink: string // url
  displayLedger: boolean
  documentsLink: string // url
}
