export interface OfficerRoleObj {
  roleType: OfficerRole
  appointmentDate: string // YYYY-MM-DD
  cessationDate?: string | null
  roleClass?: string
}

export interface Officer {
  id?: string
  firstName: string
  middleName: string
  lastName: string
  preferredName: string
  roles: OfficerRoleObj[]
  mailingAddress: UiAddress
  deliveryAddress: UiAddress
  sameAsDelivery: boolean
  hasPreferredName: boolean
}

// export interface OfficerTableState {
//   state: {
//     officer: Officer
//     actions: OfficerFormAction[]
//   }
//   history: Array<{
//     officer: Officer
//     actions: OfficerFormAction[]
//   }>
// }
export interface OfficerTableState {
  new: Officer
  old?: Officer
}

export interface OfficerRolePayload {
  appointmentDate: string // isodate
  cessationDate: string | null // isodate
  roleClass?: 'OFFICER'
  roleType: RoleType
}

export interface OfficerRelationshipPayload {
  deliveryAddress: ApiAddress
  mailingAddress?: ApiAddress
  roles: OfficerRolePayload[]
  entity: {
    alternateName: string
    familyName: string
    givenName: string
    identifier?: string
    middleInitial: string
  }
}

export interface OfficerPayload {
  relationships: OfficerRelationshipPayload[]
}

export interface ChangeOfOfficersPayload {
  changeOfOfficers: {
    relationships: OfficerRelationshipPayload[]
  }
}
