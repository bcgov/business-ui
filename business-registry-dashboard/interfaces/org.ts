export interface OrgAddress {
  city: string
  country: string
  postalCode: string
  region: string
  street: string
  streetAdditional: string
}

export interface Org {
  accessType: string
  branchName: string
  created: string
  createdBy: string
  hasApiAccess: boolean
  id: number
  isBusinessAccount: boolean
  mailingAddress: OrgAddress[]
  modified: string
  name: string
  orgStatus: string
  orgType: string
  statusCode: string
  uuid: string
}
