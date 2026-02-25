import { isEqual, omit } from 'es-toolkit'

export function formatAddressUi(address: ApiAddress | undefined): ConnectAddress | AddressSchema['deliveryAddress'] {
  return {
    id: address?.id,
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
  const mailingAddress = formatAddressUi(address?.mailingAddress)
  const deliveryAddress = formatAddressUi(address?.deliveryAddress)
  const hasMailing = !!address?.mailingAddress?.streetAddress
  return {
    mailingAddress,
    deliveryAddress,
    sameAs: hasMailing && isEqual(omit(mailingAddress, ['id']), omit(deliveryAddress, ['id']))
  }
}

export function formatAddressApi(
  address: (ConnectAddress | AddressSchema['deliveryAddress']) & { id?: number } | undefined
): ApiAddress {
  return {
    id: address?.id,
    streetAddress: address?.street ?? '',
    streetAddressAdditional: address?.streetAdditional ?? '',
    addressCity: address?.city ?? '',
    addressRegion: address?.region ?? '',
    postalCode: address?.postalCode ?? '',
    addressCountry: address?.country ?? '',
    deliveryInstructions: address?.locationDescription ?? ''
  }
}

export function formatOfficeApi(
  office: UiBaseAddressObj | undefined
): { mailingAddress: ApiAddress, deliveryAddress: ApiAddress } {
  return {
    mailingAddress: formatAddressApi(office?.mailingAddress),
    deliveryAddress: formatAddressApi(office?.deliveryAddress)
  }
}
