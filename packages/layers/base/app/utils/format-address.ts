import { isEqual } from 'es-toolkit'

export function formatAddressUi(address: ApiAddress | undefined): ConnectAddress {
  return {
    street: address?.streetAddress ?? '',
    streetAdditional: address?.streetAddressAdditional ?? '',
    city: address?.addressCity ?? '',
    region: address?.addressRegion ?? '',
    postalCode: address?.postalCode ?? '',
    country: address?.addressCountry ?? '',
    locationDescription: address?.deliveryInstructions ?? ''
  }
}

export function formatBaseAddressUi(address: ApiBaseAddressObj | undefined): UiBaseAddressObj {
  const mailing = address?.mailingAddress
  const delivery = address?.deliveryAddress
  return {
    mailingAddress: formatAddressUi(mailing),
    deliveryAddress: formatAddressUi(delivery),
    sameAs: !!mailing && isEqual(mailing, delivery)
  }
}

export function formatAddressApi(address: ConnectAddress | undefined): ApiAddress {
  return {
    streetAddress: address?.street ?? '',
    streetAddressAdditional: address?.streetAdditional ?? '',
    addressCity: address?.city ?? '',
    addressRegion: address?.region ?? '',
    postalCode: address?.postalCode ?? '',
    addressCountry: address?.country ?? '',
    deliveryInstructions: address?.locationDescription ?? ''
  }
}
