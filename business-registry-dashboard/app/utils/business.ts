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
  legalName: string,
  legalType?: CorpTypes,
  identifier?: string,
  alternateNames?: AlternateNames[]
): string {
  const enableAltNamesMbr = true // TODO: add launch darkly
  // if (!LaunchDarklyService.getFlag(LDFlags.AlternateNamesMbr, false)) { enable-alternate-names-mbr: true
  if (!enableAltNamesMbr) {
    return legalName ?? ''
  }
  if (legalType &&
      identifier &&
      alternateNames &&
    [CorpTypes.SOLE_PROP, CorpTypes.PARTNERSHIP].includes(legalType)) {
    // Intentionally show blank, if the alternate name is not found. This is to avoid showing the legal name.
    return alternateNames?.find(alt => alt.identifier === identifier)?.name ?? '' // TODO: verify .operatingName not in use
  } else {
    return legalName
  }
}

// TODO: fix ts error
/* Internal function to build the business object. */
export function buildBusinessObject (resp: AffiliationResponse): Business {
  return {
    businessIdentifier: resp.identifier ?? '',
    ...(resp.businessNumber && { businessNumber: resp.businessNumber }),
    ...(resp.legalName &&
        {
          name: determineDisplayName(
            resp.legalName, resp.legalType, resp.identifier, resp.alternateNames)
        }),
    ...(resp.contacts && { contacts: resp.contacts }),
    ...((resp.draftType || resp.legalType) && { corpType: { code: resp.draftType || resp.legalType } }),
    ...(resp.legalType && { corpSubType: { code: resp.legalType } }),
    ...(resp.folioNumber && { folioNumber: resp.folioNumber }),
    ...(resp.lastModified && { lastModified: resp.lastModified }),
    ...(resp.modified && { modified: resp.modified }),
    ...(resp.modifiedBy && { modifiedBy: resp.modifiedBy }),
    ...(resp.nrNumber && { nrNumber: resp.nrNumber }),
    ...(resp.adminFreeze !== undefined ? { adminFreeze: resp.adminFreeze } : { adminFreeze: false }),
    ...(resp.goodStanding !== undefined ? { goodStanding: resp.goodStanding } : { goodStanding: true }),
    ...(resp.state && { status: resp.state })
  }
}

export function isOtherEntities (item: Business): boolean {
  return [CorpTypes.FINANCIAL, CorpTypes.PRIVATE_ACT, CorpTypes.PARISHES,
    CorpTypes.LL_PARTNERSHIP, CorpTypes.LIM_PARTNERSHIP, CorpTypes.XPRO_LIM_PARTNR].includes(getEntityType(item))
}

export function isForRestore (item: Business): boolean {
  return [CorpTypes.BC_COMPANY, CorpTypes.BC_CCC, CorpTypes.BC_ULC_COMPANY,
    CorpTypes.COOP, CorpTypes.BENEFIT_COMPANY].includes(getEntityType(item))
}

export function isSocieties (item: Business): boolean {
  return [CorpTypes.CONT_IN_SOCIETY, CorpTypes.SOCIETY, CorpTypes.XPRO_SOCIETY].includes(getEntityType(item))
}

// TODO: add launch darkly
export function isModernizedEntity (item: Business): boolean {
  const entityType = getEntityType(item)
  // const supportedEntityFlags = launchdarklyServices.getFlag(LDFlags.IaSupportedEntities)?.split(' ') || []
  const ldFlag = 'BC BEN C CBEN CC CCC CP CR CS CUL EPR FI GP LLC PA PAR S SP UL ULC XL XS'
  const supportedEntityFlags = ldFlag.split(' ') || []
  return supportedEntityFlags.includes(entityType)
}
// is modernized entity uses:
// ia-supported-entities: "BC BEN C CBEN CC CCC CP CR CS CUL EPR FI GP LLC PA PAR S SP UL ULC XL XS"

// TODO: add launch darkly
export function isSupportedAmalgamationEntities (item: Business): boolean {
  const entityType = getEntityType(item)
  const ldFlag = 'BC BEN CC ULC'
  // const supportedEntityFlags = launchdarklyServices.getFlag(LDFlags.SupportedAmalgamationEntities)?.split(' ') || []
  const supportedEntityFlags = ldFlag.split(' ') || []
  return supportedEntityFlags.includes(entityType)
}
// isSupportedAmalgamationEntities uses:
// supported-amalgamation-entities: "BC BEN CC ULC"

// TODO: add launch darkly
export function isSupportedContinuationInEntities (item: Business): boolean {
  const entityType = getEntityType(item)
  const ldFlag = 'C CBEN CCC CUL'
  const supportedEntityFlags = ldFlag.split(' ') || []
  // const supportedEntityFlags = launchdarklyServices.getFlag(LDFlags.SupportedContinuationInEntities)?.split(' ') || []
  return supportedEntityFlags.includes(entityType)
}
// isSupportedContinuationInEntities uses:
// supported-continuation-in-entities: "C CBEN CCC CUL"

// TODO: add launch darkly
export function isSupportedRestorationEntities (item: Business): boolean {
  const entityType = getEntityType(item)
  const ldFlag = ''
  const supportedEntityFlags = ldFlag.split(' ') || []
  // const supportedEntityFlags = launchdarklyServices.getFlag(LDFlags.SupportRestorationEntities)?.split(' ') || []
  return supportedEntityFlags.includes(entityType)
}
// isSupportedRestorationEntities uses:
// supported-restoration-entities: ""
