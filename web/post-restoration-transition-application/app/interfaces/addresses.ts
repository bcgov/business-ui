export interface OfficeAddress {
  addressCity: string
  addressCountry: string
  addressRegion: string
  addressType: string
  deliveryInstructions: string
  id: number
  postalCode: string
  streetAddress: string
  streetAddressAdditional: string
}

export interface AddressesResponse {
  recordsOffice: {
    deliveryAddress: OfficeAddress
    mailingAddress: OfficeAddress
  }
  registeredOffice: {
    deliveryAddress: OfficeAddress
    mailingAddress: OfficeAddress
  }
}

export interface Office {
  officeType: string
  deliveryAddress: UiAddress
  mailingAddress: UiAddress
}
