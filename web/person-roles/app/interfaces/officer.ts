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
  preferredName?: string
  roles: OfficerRoleObj[]
  mailingAddress: UiAddress
  deliveryAddress: UiAddress
  sameAsDelivery: boolean
  hasPreferredName: boolean
}

export interface OfficerTableState {
  state: {
    officer: Officer
    actions: OfficerFormAction[]
  }
  history: Array<{
    officer: Officer
    actions: OfficerFormAction[]
  }>
}
