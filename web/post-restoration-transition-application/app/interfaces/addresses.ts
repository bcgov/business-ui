export interface Office {
  officeType: 'recordsOffice' | 'registeredOffice'
  deliveryAddress: UiAddress
  mailingAddress: UiAddress
}

export type ApiOffice = ApiBaseAddressObj
export type ApiOffices = IncorporationAddress

export const toApiAddress = (address: UiAddress): ApiAddress | undefined => {
  if (!address) {
    return undefined
  }
  return {
    streetAddress: address.street ?? '',
    streetAddressAdditional: address.streetAdditional ?? '',
    addressCity: address.city ?? '',
    addressRegion: address.region ?? '',
    postalCode: address.postalCode ?? '',
    addressCountry: address.country ?? '',
    deliveryInstructions: address.locationDescription ?? ''
  }
}

export const toApiOffice = (office: Office | undefined): ApiOffice | undefined => {
  if (!office) {
    return undefined
  }
  if (!office || !office.mailingAddress) {
    return undefined
  }
  return {
    deliveryAddress: toApiAddress(office.deliveryAddress),
    // this as ApiAddress works as we checked above that office.mailingAddress exists (required field)
    mailingAddress: toApiAddress(office.mailingAddress) as ApiAddress
  }
}

export const toStandaloneTransitionOffices = (offices: Office[]): ApiOffices | undefined => {
  const registeredOffice = toApiOffice(offices.find(office => office.officeType === 'registeredOffice'))
  let recordsOffice = toApiOffice(offices.find(office => office.officeType === 'recordsOffice')) as ApiOffice

  if (!registeredOffice) {
    return undefined
  }

  // todo: verify with business if this is correct ?!
  if (!recordsOffice) {
    recordsOffice = registeredOffice
  }

  return {
    registeredOffice,
    recordsOffice
  }
}
