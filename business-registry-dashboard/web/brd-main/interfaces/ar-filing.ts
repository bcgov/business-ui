export interface AnnualReport {
  annualGeneralMeetingDate: string | null
  annualReportDate: string
  votedForNoAGM: boolean
  unanimousResolutionDate: string | null
}

export interface FilingHeader {
  completionDate: null | string
  filingDateTime: string
  filingYear: number
  id: number
  name: string
  paymentAccount: string
  paymentStatus: null | string
  paymentToken: number
  status: string
  submitter: null | string
  certifiedBy: string
  certifiedByDisplayName: string
  colinIds: number[]
  date: string
}

export interface FilingDocument {
  name: string
  url: string
}

export interface Filing {
  annualReport: AnnualReport
  header: FilingHeader
  documents: FilingDocument[]
}

export interface ArFiling {
  filing: Filing
}

export interface ArFormData {
  agmDate: string | null,
  votedForNoAGM: boolean,
  unanimousResolutionDate: string | null
}
