// TODO: add launch darkly
/**
 * Determines the display name of a given business object.
 *
 * @param {string} legalName - The legal name of the business.
 * @param {CorpTypes} legalType - The type of corporation (e.g., Sole Proprietorship, Partnership).
 * @param {string} identifier - The identifier of the business.
 * @param {AlternateNames[]} alternateNames - An array of alternate names for the business.
 *
 * @returns {string} The display name of the business. If the business is a sole proprietorship or partnership,
 *                   it returns the operating name if found in the alternate names array. Otherwise, it returns
 *                   the legal name.
 */
export function determineDisplayName (
  legalName?: string,
  legalType?: CorpTypes,
  identifier?: string,
  alternateNames?: AlternateNames[]
): string {
  // if (!LaunchDarklyService.getFlag(LDFlags.AlternateNamesMbr, false)) {
  //   return legalName
  // }
  if (!legalName) {
    return ''
  }
  if (legalType &&
      identifier &&
      alternateNames &&
    [CorpTypes.SOLE_PROP, CorpTypes.PARTNERSHIP].includes(legalType)) {
    // Intentionally show blank, if the alternate name is not found. This is to avoid showing the legal name.
    return alternateNames?.find(alt => alt.identifier === identifier)?.operatingName ?? ''
  } else {
    return legalName
  }
}
