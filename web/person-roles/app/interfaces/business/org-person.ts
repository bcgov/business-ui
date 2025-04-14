import type { PartyType } from '~/enums'

export interface ApiPerson {
  id?: number // used by UI only
  partyType: PartyType
  firstName?: string // required when partyType="person"
  middleName?: string
  lastName?: string // required when partyType="person"
  organizationName?: string // required when partyType="organization"
  email?: string
  identifier?: string // aka Incorporation/Registration number
  taxId?: string
}

export interface OrgPerson {
  officer: ApiPerson
  roles: Role[]
  mailingAddress: ApiAddress
  deliveryAddress?: ApiAddress
  actions?: ActionType[]
  confirmNameChange?: boolean // for UI use only
  confirmBusiness?: boolean // for firms only // for UI use only
  confirmDocuments?: boolean // for proprietor-orgs only // for UI use only
  isLookupBusiness?: boolean // for firms only // for UI use only
}
