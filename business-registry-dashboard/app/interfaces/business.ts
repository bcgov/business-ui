import { AmalgamationTypes, FilingTypes, NrRequestActionCodes, NrRequestTypeCodes } from '@bcrs-shared-components/enums'
import { type AlternateNameIF } from '@bcrs-shared-components/interfaces'

export interface LoginPayload {
    businessIdentifier: string
    passCode?: string
    phone?: string
    email?: string
    certifiedByName?: string
}

export interface FolioNumberload {
    businessIdentifier: string
    folioNumber: string
}

export interface CorpType {
    code: CorpTypes // may be actual corp type or overloaded value
    default?: boolean
    desc?: string
}

// TODO: why are all these properties optional
export interface Business {
    businessIdentifier: string
    businessNumber?: string
    name?: string
    contacts?: Contact[]
    corpType: CorpType
    corpSubType?: CorpType
    draftStatus?: string
    folioNumber?: string
    lastModified?: string
    modified?: string
    modifiedBy?: string
    nameRequest?: NameRequest
    nrNumber?: string
    status?: string
    goodStanding?: boolean
    adminFreeze?: boolean
    inDissolution?: boolean
    affiliationInvites?: AffiliationInviteInfo[]
    dissolved?: boolean
}

export interface BusinessSearchResultDto {
    businessIdentifier: string
    businessNumber?: string
    name?: string
    accessType?: string
    orgType?: string
    statusCode?:string
    account: string
    entity?: string
}

export interface Businesses {
    entities: Business[]
}

// see https://github.com/bcgov/business-schemas/blob/master/src/registry_schemas/schemas/name_request.json
export interface NameRequest {
    actions?: Array<Action>
    consentFlag?: string
    names?: Array<Names>
    id?: number
    legalType: CorpTypes
    nrNumber?: string
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

export interface Applicant {
    emailAddress?: string
    phoneNumber?: string
}

// Names interface to match external data provided from lear.
export interface Names {
    decision_text: string,
    name_type_cd: string,
    designation: string,
    name: string,
    state: string
}

// Actions interface to match external data provided from lear.
export interface Action {
    URL: string,
    entitiesFilingName: string,
    filingName: LearFilingTypes,
}

export interface BusinessRequest {
    filing: {
        header: {
            name: FilingTypes
            accountId: number
        },
        // business is only used in incorporationApplication filing
        business?: {
            legalType: CorpTypes,
        },
        amalgamationApplication?: {
          type: AmalgamationTypes,
          nameRequest: NameRequest
        },
        continuationIn?: {
            nameRequest: NameRequest
        },
        incorporationApplication?: {
            nameRequest: NameRequest
        },
        registration?: {
            nameRequest: NameRequest
            businessType?: string // SP or DBA
            business: {
                natureOfBusiness?: string
            }
        }
    }
}

export interface PasscodeResetLoad {
    businessIdentifier: string,
    passcodeResetEmail: string,
    resetPasscode: boolean
}

export interface LearBusiness {
    identifier: string
    legalName: string
    legalType: string
    alternateNames?: AlternateNameIF[]
    taxId?: string
}
