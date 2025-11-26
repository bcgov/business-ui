import { toApiAddress } from '~/utils/address'

export interface Office {
  officeType: 'recordsOffice' | 'registeredOffice'
  deliveryAddress: ConnectAddress
  mailingAddress: ConnectAddress
}

export type ApiOffice = ApiBaseAddressObj
export type ApiOffices = IncorporationAddress

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
