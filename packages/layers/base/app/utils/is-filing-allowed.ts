/**
 * Validates if a specific filing type is allowed for a given business
 * based on its `allowedActions` property.
 *
 * @param business The business data object, which contains the
 * list of allowed filing types from the API.
 * @param filingName The name of the filing type to validate (e.g., 'changeOfOfficers').
 * @returns True if the filing is allowed for the business, otherwise false.
 */
export function isFilingAllowed(business: BusinessData, filingName: string) {
  try {
    const allowedFilings = business.allowedActions.filing.filingTypes
    const isAllowed = allowedFilings.some(f => f.name === filingName)
    return isAllowed
  } catch {
    return false
  }
}
