/**
 * Validates if a specific filing type is allowed for a given business
 * based on its `allowedActions` property.
 *
 * @param {BusinessData} business The business data object, which contains the
 * list of allowed filing types from the API.
 * @param {string} filingName The name of the filing type to validate (e.g., 'changeOfOfficers').
 * @returns {boolean} True if the filing is allowed for the business, otherwise false.
 */
export function validateBusinessAllowedFilings(business: BusinessData, filingName: string) {
  const allowedFilings = business.allowedActions.filing.filingTypes
  const isAllowed = allowedFilings.some(f => f.name === filingName)
  return isAllowed
}
