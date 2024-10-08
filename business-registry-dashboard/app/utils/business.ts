import { FilingTypes, AmalgamationTypes } from '@bcrs-shared-components/enums'

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
  const ldStore = useConnectLaunchdarklyStore()
  const enableAltNamesMbr = ldStore.getStoredFlag(LDFlags.AlternateNamesMbr)
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
    corpType: { code: resp.draftType || resp.legalType! }, // TODO: confirm legalType is never undefined?
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

export function isModernizedEntity (item: Business): boolean {
  const ldStore = useConnectLaunchdarklyStore()
  const supportedEntityFlags = ldStore.getStoredFlag(LDFlags.IaSupportedEntities)
  const entityType = getEntityType(item)
  if (typeof supportedEntityFlags === 'string') {
    return supportedEntityFlags.split(' ').includes(entityType)
  } else {
    return false
  }
}

export function isSupportedAmalgamationEntities (item: Business): boolean {
  const ldStore = useConnectLaunchdarklyStore()
  const entityType = getEntityType(item)
  const supportedEntityFlags = ldStore.getStoredFlag(LDFlags.SupportedAmalgamationEntities)
  if (typeof supportedEntityFlags === 'string') {
    return supportedEntityFlags.split(' ').includes(entityType)
  } else {
    return false
  }
}

export function isSupportedContinuationInEntities (item: Business): boolean {
  const ldStore = useConnectLaunchdarklyStore()
  const entityType = getEntityType(item)
  const supportedEntityFlags = ldStore.getStoredFlag(LDFlags.SupportedContinuationInEntities)
  if (typeof supportedEntityFlags === 'string') {
    return supportedEntityFlags.split(' ').includes(entityType)
  } else {
    return false
  }
}

export function isSupportedRestorationEntities (item: Business): boolean {
  const ldStore = useConnectLaunchdarklyStore()
  const entityType = getEntityType(item)
  const supportedEntityFlags = ldStore.getStoredFlag(LDFlags.SupportRestorationEntities)
  if (typeof supportedEntityFlags === 'string') {
    return supportedEntityFlags.split(' ').includes(entityType)
  } else {
    return false
  }
}

export async function createNamedBusiness ({ filingType, business }: { filingType: FilingTypes, business: Business}) {
  if (!business.nameRequest) {
    throw new Error('Name request is required to create a named business')
  }

  const currentAccountId = useConnectAccountStore().currentAccount.id
  let filingBody: BusinessRequest = {} as BusinessRequest

  // add in Business Type for SP
  const addBusinessTypeforSP = (filingBody: BusinessRequest, business: Business): BusinessRequest => {
    if (business.nameRequest) {
      const registration = filingBody?.filing?.registration

      if (registration) {
        if (business.nameRequest.entityTypeCd === NrEntityType.FR) {
          registration.businessType = CorpTypes.SOLE_PROP
        } else if (business.nameRequest.entityTypeCd === NrEntityType.DBA) {
          registration.businessType = NrEntityType.DBA
        }
      }
    }
    return filingBody
  }

  switch (filingType) {
    case FilingTypes.AMALGAMATION_APPLICATION: {
      filingBody = {
        filing: {
          business: {
            legalType: business.nameRequest.legalType
          },
          header: {
            accountId: Number(currentAccountId),
            name: filingType
          },
          amalgamationApplication: {
            type: AmalgamationTypes.REGULAR,
            nameRequest: {
              legalType: business.nameRequest.legalType,
              nrNumber: business.businessIdentifier || business.nameRequest.nrNumber
            }
          }
        }
      }
      break
    }

    case FilingTypes.INCORPORATION_APPLICATION: {
      filingBody = {
        filing: {
          business: {
            legalType: business.nameRequest.legalType
          },
          header: {
            accountId: Number(currentAccountId),
            name: filingType
          },
          incorporationApplication: {
            nameRequest: {
              legalType: business.nameRequest.legalType,
              nrNumber: business.businessIdentifier || business.nameRequest.nrNumber
            }
          }
        }
      }

      // add in Business Type for SP
      if (business.nameRequest.legalType === CorpTypes.SOLE_PROP) {
        addBusinessTypeforSP(filingBody, business)
      }
      break
    }

    case FilingTypes.REGISTRATION: {
      filingBody = {
        filing: {
          business: {
            legalType: business.nameRequest.legalType
          },
          header: {
            accountId: Number(currentAccountId),
            name: filingType
          },
          registration: {
            business: {
              natureOfBusiness: business.nameRequest.natureOfBusiness
            },
            nameRequest: {
              legalType: business.nameRequest.legalType,
              nrNumber: business.nameRequest.nrNumber
            }
          }
        }
      }

      // add in Business Type for SP
      addBusinessTypeforSP(filingBody, business)
      break
    }

    case FilingTypes.CONTINUATION_IN: {
      filingBody = {
        filing: {
          business: {
            legalType: business.nameRequest.legalType
          },
          header: {
            accountId: Number(currentAccountId),
            name: filingType
          },
          continuationIn: {
            nameRequest: {
              legalType: business.nameRequest.legalType,
              nrNumber: business.nameRequest.nrNumber
            }
          }
        }
      }
    }
  }

  const keycloak = useKeycloak()
  const token = await keycloak.getToken()
  const legalApiUrl = useRuntimeConfig().public.legalApiUrl
  const authApiUrl = useRuntimeConfig().public.authApiURL

  // create an affiliation between implicit org and requested business
  // const response = await BusinessService.createDraftFiling(filingBody)
  const response = await $fetch(`${legalApiUrl}/businesses?draft=true`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: filingBody
  })
  // if (response?.status >= 200 && response?.status < 300) {
  if (response) {
    return response
  }

  // delete the created affiliation if the update failed for avoiding orphan records
  // unable to do this from backend, since it causes a circular dependency
  const incorporationNumber = business.businessIdentifier
  // await OrgService.removeAffiliation(Number(currentAccountId), incorporationNumber, undefined, false)
  await $fetch(`${authApiUrl}/orgs/${currentAccountId}/affiliations/${incorporationNumber}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: { data: { passcodeResetEmail: undefined, resetPasscode: false, logDeleteDraft: true } }
  })

  return { errorMsg: 'Cannot add business due to some technical reasons' }
}
