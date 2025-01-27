import { NrRequestActionCodes, NrRequestTypeCodes } from '@bcrs-shared-components/enums'
// import { type AlternateNameIF } from '@bcrs-shared-components/interfaces'

export interface CreateAffiliationRequestBody {
  businessIdentifier: string
  certifiedByName?: string
  passCode?: string
}

export interface CreateNRAffiliationRequestBody {
  businessIdentifier: string
  phone?: string
  email?: string
}

export interface Affiliation {
  organization: Organization
  business: Business
}

export interface AffiliationFilter {
  businessName?: string,
  businessNumber?: string,
  type?: string,
  status?: string,
  actions?: string
}

export interface AlternateNames {
  entityType?: string
  identifier?: string
  nameRegisteredDate?: string
  nameStartDate?: string
  operatingName?: string
  name?: string
}

export interface AffiliationResponse {
  identifier?: string
  draftType?: CorpTypes
  draftStatus?: string
  legalType?: CorpTypes
  businessNumber?: string
  name?: string
  legalName?: string
  alternateNames?: AlternateNames[]
  contacts?: Contact[]
  corpType?: CorpType
  corpSubType?: CorpType
  folioNumber?: string
  lastModified?: string
  modified?: string
  modifiedBy?: string
  nameRequest?: NameRequestResponse
  nrNumber?: string
  state?: string
  goodStanding?: boolean
  adminFreeze?: boolean
  inDissolution?: boolean
}

export interface NameRequestResponse {
  actions?: Array<Action>
  consentFlag?: string
  names?: Array<Names>
  id?: number
  legalType: CorpTypes
  state?: string
  applicantEmail?: string | null
  applicantPhone?: string | null
  enableIncorporation?: boolean
  folioNumber?: string
  target?: NrTargetTypes
  entityTypeCd?: string
  requestTypeCd?: NrRequestTypeCodes
  requestActionCd?: NrRequestActionCodes
  natureOfBusiness?: string
  expirationDate?: Date
  nrNum?: string
  stateCd?: string
  natureBusinessInfo?: string
  applicants?: Array<Applicant>
  corpNum?: string
}

export interface AffiliationsResponse {
  entities: AffiliationResponse[]
}

export interface AffiliationFilterParams {
  isActive: boolean
  filterPayload: AffiliationFilter
}

export interface AffiliationState {
  [x: string]: any

  affiliations: any
  filters: {
    isActive: boolean
    filterPayload: AffiliationFilter
  }
  loading: boolean
  results: Business[]
  count: number
}

export interface AffiliationInviteInfo {
  id: number
  type: AffiliationInvitationType
  status: string
  entity: Business
  fromOrg: OrgNameAndId
  toOrg?: OrgNameAndId
  recipientEmail?: string
}

export interface AffiliatedAccounts {
  orgsDetails: Array<{branchName: string, name: string, uuid: string }>
}
