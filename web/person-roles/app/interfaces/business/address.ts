/**
 * Interface to define a base address.
 * See:
 * https://github.com/bcgov/business-schemas/blob/main/src/registry_schemas/schemas/address.json
 */
export interface Address {
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
export interface BaseAddressObj {
  mailingAddress: Address
  // Delivery Address is required for directors and offices.
  // Delivery Address is optional for completing party and incorporators.
  deliveryAddress?: Address
}

/** Interface to define the incorporation addresses. */
export interface IncorporationAddress {
  registeredOffice: BaseAddressObj
  // Records Address is required for BCOMPs.
  // Records Address may be optional for other app types.
  recordsOffice?: BaseAddressObj
}
