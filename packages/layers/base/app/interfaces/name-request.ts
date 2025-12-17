/**
 * Name request applicant interface.
 * Includes only the properties we care about.
 */
export interface NrApplicant {
  addrLine1: string
  addrLine2: string
  addrLine3: string
  city: string
  countryTypeCd: string
  emailAddress: string
  firstName: string
  lastName: string
  middleName: string
  phoneNumber: string
  postalCd: string
  stateProvinceCd: string
}

/**
 * Name request name interaface.
 * Includes only the properties we care about.
 */
export interface NrName {
  name: string
  state: NameRequestState
}

/**
 * Interface for name request objects we fetch from Namex (via Legal API).
 * Includes only the properties we care about.
 */
export interface NameRequest {
  applicants: NrApplicant // object not array
  consentFlag: string // R, N, Y or null
  corpNum?: string // eg, "BC1234567"
  expirationDate: ApiDateTimeUtc
  furnished: string // eg, "Y"
  legalType: CorpTypeCd
  names: Array<NrName>
  nrNum: string // eg, "NR 1234567"
  priorityCd: string // eg, "N"
  requestTypeCd: NrRequestTypeCode
  request_action_cd: NrRequestActionCode
  state: NameRequestState
}
