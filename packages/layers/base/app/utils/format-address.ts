import { isEqualOmit } from '#business/app/utils/is-equal-omit'

export function formatAddressUi(
  address: ApiAddress | undefined
): (ConnectAddress | AddressSchema['deliveryAddress']) & { id?: string } {
  return {
    id: String(address?.id ?? crypto.randomUUID()),
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
    sameAs: hasMailing && isEqualOmit(mailingAddress, deliveryAddress, ['id'])
  }
}

export function formatAddressApi(
  address: (ConnectAddress | AddressSchema['deliveryAddress']) & { id?: string } | undefined
): ApiAddress {
  // a temp uuid is created for newly added addresses for UI diff's, set to undefined for new addresses or
  const isIdUuid = address?.id && typeof address.id === 'string' && address.id.includes('-')
  return {
    id: isIdUuid || !address?.id ? undefined : Number(address.id),
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
