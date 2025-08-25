export const areUiAddressesEqual = (address1: UiAddress, address2: UiAddress): boolean => {
  return address1.street === address2.street
    && address1.streetAdditional === address2.streetAdditional
    && address1.city === address2.city
    && address1.region === address2.region
    && address1.postalCode === address2.postalCode
    && address1.country === address2.country
    && address1.locationDescription === address2.locationDescription
    && address1.streetName === address2.streetName
    && address1.streetNumber === address2.streetNumber
    && address1.unitNumber === address2.unitNumber
}

export const areApiAddressesEqual = (address1: ApiAddress, address2: ApiAddress): boolean => {
  return address1.addressCity === address2.addressCity
    && address1.addressCountry === address2.addressCountry
    && address1.addressRegion === address2.addressRegion
    && address1.addressType === address2.addressType
    && address1.deliveryInstructions === address2.deliveryInstructions
    && address1.postalCode === address2.postalCode
    && address1.streetAddress === address2.streetAddress
    && address1.streetAddressAdditional === address2.streetAddressAdditional
}

export const convertAddress = (address: ApiAddress | UiAddress, toState: boolean) => {
  if (typeof address === 'undefined') {
    return {}
  }
  if (toState) {
    return {
      country: address.addressCountry,
      street: address.streetAddress,
      city: address.addressCity,
      region: address.addressRegion,
      postalCode: address.postalCode,
      province: address.addressRegion
    }
  }
  return {
    addressCountry: address.country,
    streetAddress: address.street,
    addressCity: address.city,
    addressRegion: address.region,
    postalCode: address.postalCode,
    addressType: address.addressType,
    deliveryInstructions: address.deliveryInstructions,
    streetAddressAdditional: address.streetAddressAdditional
  }
}