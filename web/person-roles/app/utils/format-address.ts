export function formatAddressUi(address: ApiAddress | undefined): UiAddress {
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
