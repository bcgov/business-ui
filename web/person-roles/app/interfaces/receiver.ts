// TODO: consolidate with Officer and move into base business
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
  new?: BusinessParty
  old?: BusinessParty
}

export interface ReceiverPayload extends Record<string, unknown> {
  // NOTE: these may change depending on the API
  appointReceiver?: {
    parties: OrgPerson[]
  }
  ceaseReceiver?: {
    parties: OrgPerson[]
  }
}

export interface ReceiverPayloadDraft extends Record<string, unknown> {
  parties: BusinessPartyTableState[]
  // TODO: court order, staff payment?
}
