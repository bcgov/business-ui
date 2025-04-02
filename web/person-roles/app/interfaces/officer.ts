export interface Officer {
  firstName: string
  middleName: string
  lastName: string
  roles: OfficerRole[]
  mailingAddress: ConnectAddress
  deliveryAddress: ConnectAddress
}

export interface OfficerTableState {
  officer: Officer
  history: Officer[]
}
