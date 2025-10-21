export interface NameRequestFilingData {
  legalType: CorpTypeCd
  legalName?: string // only set when there is an NR
  nrNumber?: string // only set when there is an NR
  correctNameOption?: CorrectNameOption
}

export interface BootstrapFilingData {
  nameRequest?: NameRequestFilingData
  offices?: EntityOfficeAddress
  parties?: OrgPerson
}

export type BootstrapBusiness = Pick<FilingBusiness,
  'identifier'
  | 'legalType'
>

export interface BootstrapFiling {
  business: BootstrapBusiness
  header: FilingHeaderResponse
  amalgamationApplication?: AmalgamationApplication
  continuationIn?: BootstrapFilingData
  incorporationApplication?: IncorporationApplication
  noticeOfWithdrawal?: unknown
  registration?: BootstrapFilingData
}
