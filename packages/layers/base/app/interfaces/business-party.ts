export interface BusinessParty {
  actions: ActionType[]
  deliveryAddress: ConnectAddress
  mailingAddress: ConnectAddress
  officer: ApiPerson
  roles: Role[]
  sameAsDelivery: boolean
  id?: string
}

export interface BusinessPartyTableState {
  new: BusinessParty
  old?: BusinessParty
}
