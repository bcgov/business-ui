export interface UiAddress {
  street: string
  streetAdditional: string
  city: string
  region: string
  postalCode: string
  country: string
  locationDescription: string
  streetName?: string
  streetNumber?: string
  unitNumber?: string
}

/**
 * Interface to define a base address.
 * See:
 * https://github.com/bcgov/business-schemas/blob/main/src/registry_schemas/schemas/address.json
 */
export interface ApiAddress {
  id: number
  addressCity: string // max 40 chars
  addressCountry: string
  addressRegion?: string // max 2 chars
  addressType?: string
  deliveryInstructions?: string // max 80 chars
  postalCode: string // max 15 chars
  streetAddress: string // max 50 chars
  streetAddressAdditional?: string // max 50 chars
}

/** Interface to define the joint base addresses. */
export interface ApiBaseAddressObj {
  mailingAddress: ApiAddress
  // Delivery Address is required for directors and offices.
  // Delivery Address is optional for completing party and incorporators.
  deliveryAddress?: ApiAddress
}

/** Interface to define the incorporation addresses. */
export interface IncorporationAddress {
  registeredOffice: ApiBaseAddressObj
  // Records Address is required for BCOMPs.
  // Records Address may be optional for other app types.
  recordsOffice?: ApiBaseAddressObj
}
