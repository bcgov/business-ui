const ADDRESS_INPUT_FIELDS = ['street', 'streetAdditional', 'city', 'region', 'postalCode'] as const

/**
 * Whether the user (or the record) entered anything in an address beyond the defaulted country,
 * so a table cell can show the partial address above an "incomplete" marker instead of only the marker.
 */
export function hasAddressInput(address?: Partial<ConnectAddress>): boolean {
  return !!address && ADDRESS_INPUT_FIELDS.some(field => !!address[field]?.trim())
}
