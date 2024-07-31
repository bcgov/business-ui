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
