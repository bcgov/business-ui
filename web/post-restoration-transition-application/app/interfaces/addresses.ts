export interface AddressesResponse {
  recordsOffice: {
    deliveryAddress: ApiAddress
    mailingAddress: ApiAddress
  }
  registeredOffice: {
    deliveryAddress: ApiAddress
    mailingAddress: ApiAddress
  }
}

export interface Office {
  officeType: string
  deliveryAddress: UiAddress
  mailingAddress: UiAddress
}
