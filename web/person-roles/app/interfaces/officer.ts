export interface Officer {
  firstName: string
  middleName: string
  lastName: string
  preferredName?: string
  roles: OfficerRole[]
  mailingAddress: ConnectAddress
  deliveryAddress: ConnectAddress
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
