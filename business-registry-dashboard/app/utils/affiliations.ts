import {
  CorpTypeCd,
  GetCorpFullDescription,
  GetCorpNumberedDescription
} from '@bcrs-shared-components/corp-type-module'

export const getAffiliationInvitationStatus = (affiliationInviteInfos: AffiliationInviteInfo[]): string => {
  if (affiliationInviteInfos[0]?.status) {
    return affiliationInviteInfos[0].status
  } else {
    return 'N/A'
  }
}

export function getElementWithSmallestId<Type extends {id:number}> (arrayToSearch: Type[]): Type | undefined {
  if (arrayToSearch.length === 0) {
    return undefined
  }
  return arrayToSearch.reduce((currentMin, curr) => (currentMin.id <= curr.id ? currentMin : curr))
}

export const getRequestForAuthorizationStatusText = (affiliationInviteInfos: AffiliationInviteInfo[]) => {
  const affiliationWithSmallestId = getElementWithSmallestId<AffiliationInviteInfo>(affiliationInviteInfos) ?? false
  if (affiliationWithSmallestId &&
    affiliationWithSmallestId.toOrg &&
    affiliationWithSmallestId.toOrg.id &&
    isCurrentOrganization(affiliationWithSmallestId.toOrg?.id)) {
    // incoming request for access
    const andOtherAccounts = affiliationInviteInfos.length > 1 ? ` and ${affiliationInviteInfos.length - 1} other account(s)` : ''
    return `Request for Authorization to manage from: <strong>${affiliationWithSmallestId.fromOrg.name}${andOtherAccounts}</strong>`
  } else {
    let statusText = ''
    if (affiliationWithSmallestId && affiliationWithSmallestId.status) {
      // outgoing request for access
      switch (affiliationWithSmallestId.status) {
        case AffiliationInvitationStatus.Pending:
          statusText = affiliationWithSmallestId.type === AffiliationInvitationType.REQUEST
            ? 'Request'
            : 'Confirmation Email'
          statusText += ' sent, pending authorization.'
          break
        case AffiliationInvitationStatus.Accepted:
          statusText = '<strong>Authorized</strong> - you can now manage this business.'
          break
        case AffiliationInvitationStatus.Failed:
          statusText = '<strong>Not Authorized</strong>. Your request to manage this business has been declined.'
          break
        case AffiliationInvitationStatus.Expired:
          statusText = 'Not authorized. The <strong>confirmation email has expired.</strong>'
          break
        default:
          break
      }
    }
    return `Authorization to manage: ${statusText}`
  }
}

/** Returns the temp business description. */
export const tempDescription = (business: Business): string => {
  switch ((business.corpType?.code || business.corpType) as CorpTypes) {
    case CorpTypes.AMALGAMATION_APPLICATION:
      return AffiliationTypes.AMALGAMATION_APPLICATION
    case CorpTypes.INCORPORATION_APPLICATION:
      return AffiliationTypes.INCORPORATION_APPLICATION
    case CorpTypes.REGISTRATION:
      return AffiliationTypes.REGISTRATION
    default:
      return '' // should never happen
  }
}

/** Returns true if the affiliation is a temporary business. */
export const isTemporaryBusiness = (business: Business): boolean => {
  return (
    (business.corpType?.code || business.corpType) === CorpTypes.AMALGAMATION_APPLICATION ||
    (business.corpType?.code || business.corpType) === CorpTypes.INCORPORATION_APPLICATION ||
    (business.corpType?.code || business.corpType) === CorpTypes.REGISTRATION
  )
}

/** Returns the type of the affiliation. */
export const affiliationType = (business: Business): string => {
  if (isTemporaryBusiness(business)) {
    return tempDescription(business)
  }
  if (isNameRequest(business)) {
    return AffiliationTypes.NAME_REQUEST
  }
  const code: unknown = business.corpType.code
  return GetCorpFullDescription(code as CorpTypeCd)
}

/** Returns the status of the affiliation. */ // TODO: add i18n for these states
export const affiliationStatus = (business: Business): string => {
  if (isTemporaryBusiness(business)) {
    return BusinessState.DRAFT
  }
  if (isNameRequest(business)) {
    // Format name request state value
    const state = NrState[(business.nameRequest?.state ?? '').toUpperCase() as keyof typeof NrState]

    if (!state) {
      return 'Unknown'
    }

    if (state === NrState.INPROGRESS) {
      return NrDisplayStates.DRAFT
    }

    if (state === NrState.APPROVED && (!business.nameRequest?.expirationDate)) {
      return NrDisplayStates.PROCESSING
    } else if (
      business.corpType.code === CorpTypes.INCORPORATION_APPLICATION ||
      business.corpType.code === CorpTypes.REGISTRATION ||
      state === NrState.DRAFT) {
      return NrDisplayStates[NrState.HOLD]
    }

    return NrDisplayStates[state] || 'Unknown'
  }
  if (business.status) {
    return business.status.charAt(0)?.toUpperCase() + business.status?.slice(1)?.toLowerCase()
  }
  return BusinessState.ACTIVE
}

/** Draft IA with Expired NR */
export const isExpired = (item: Business): boolean => {
  if (item.nameRequest?.expirationDate) {
    return isDraft(affiliationStatus(item)) && (item.nameRequest && (item.nameRequest.expirationDate !== null) &&
    (new Date(item.nameRequest.expirationDate) < new Date())) && isIA(affiliationType(item))
  } else {
    return false
  }
}

export const isFrozed = (item: Business): boolean => {
  return item.adminFreeze ?? false
}

export const isBadstanding = (item: Business) => {
  // Currently affiliation invitations don't return good standing etc.
  return item?.goodStanding === false
}

export const isDissolution = (item: Business) => {
  return item.dissolved
}

export const getDetails = (item: Business): EntityAlertTypes[] => {
  const details = []
  if (isExpired(item)) {
    details.push(EntityAlertTypes.EXPIRED)
  }
  if (isFrozed(item)) {
    details.push(EntityAlertTypes.FROZEN)
  }
  if (isBadstanding(item)) {
    details.push(EntityAlertTypes.BADSTANDING)
  }
  if (isDissolution(item)) {
    details.push(EntityAlertTypes.DISSOLUTION)
  }
  return details
}

export const isDraft = (state: string): boolean => {
  return NrState.DRAFT === state.toUpperCase()
}

export const isIA = (type: string): boolean => {
  return (type === AffiliationTypes.INCORPORATION_APPLICATION || type === AffiliationTypes.REGISTRATION)
}

export const isProcessing = (state: string): boolean => {
  return NrDisplayStates.PROCESSING === state
}

// /** Returns true if the affiliation is a numbered IA. */
const isNumberedIncorporationApplication = (item: Business): boolean => {
  if (!item.corpSubType?.code) {
    return false
  }
  return (
    (item.corpType?.code) === CorpTypes.INCORPORATION_APPLICATION &&
    !item.nrNumber &&
    [CorpTypes.BENEFIT_COMPANY,
      CorpTypes.BC_ULC_COMPANY,
      CorpTypes.BC_COMPANY,
      CorpTypes.BC_CCC
    ].includes(item.corpSubType?.code)
  )
}

// /** Returns the identifier of the affiliation. */
export const number = (business: Business): string => {
  if (isNumberedIncorporationApplication(business)) {
    return AffidavitNumberStatus.PENDING
  }
  if (isTemporaryBusiness(business) || isNameRequest(business)) {
    return business.nameRequest?.nrNumber || business.nrNumber || ''
  }
  return business.businessIdentifier
}

const getApprovedName = (business: Business): string => {
  const approvedNameObj = business.nameRequest?.names?.find(each => each.state === NrState.APPROVED)
  const approvedName = approvedNameObj?.name
  return approvedName || ''
}

/** Returns the name of the affiliation. */
export const name = (item: Business): string => {
  if (isNumberedIncorporationApplication(item)) {
    const legalType: unknown = item.corpSubType?.code
    // provide fallback for old numbered IAs without corpSubType
    return GetCorpNumberedDescription(legalType as CorpTypeCd) || 'Numbered Company'
  }
  if (item.nameRequest) {
    return getApprovedName(item)
  }
  return item.name ?? ''
}

// /** Returns the type description. */
export const typeDescription = (business: Business): string => {
  // if this is a name request then show legal type
  if (isNameRequest(business)) {
    const legalType: unknown = business.nameRequest?.legalType
    return GetCorpFullDescription(legalType as CorpTypeCd)
  }
  // if this is an IA or registration then show legal type
  if (isTemporaryBusiness(business)) {
    const legalType: unknown = (business.corpSubType?.code || business.corpSubType)
    return GetCorpFullDescription(legalType as CorpTypeCd) // may return ''
  }
  // else show nothing
  return ''
}

// /** Returns true if the affiliation is approved to start an IA or Registration. */
export const canUseNameRequest = (business: Business): boolean => {
  return (
    isNameRequest(business) && // Is this a Name Request
    business.nameRequest?.enableIncorporation && // Is the Nr state approved (conditionally) or registration
    isModernizedEntity(business) && // Feature flagged Nr types
    !!business.nameRequest.expirationDate // Ensure NR isn't processing still
  ) ?? false
}

/** Returns the Name Request type using the NR action code or the NR type code */
export const nameRequestType = (business: Business): string => {
  let nrType: string = ''
  if (isNameRequest(business) && business.nameRequest?.requestActionCd) {
    // Try action code first, and if not found in the enum then use type code
    nrType = mapRequestActionCdToNrType(business.nameRequest?.requestActionCd)
    if (business.nameRequest?.requestTypeCd) {
      nrType = nrType || mapRequestTypeCdToNrType(business.nameRequest?.requestTypeCd)
    }
    if (nrType) {
      const emDash = '—' // ALT + 0151
      return `${emDash} ${nrType}`
    }
  }
  return nrType
}

export const getEntityType = (item: Business): CorpTypes => {
  let entityType: CorpTypes = item.corpType.code
  if (isNameRequest(item) && item.nameRequest?.legalType) {
    entityType = item.nameRequest?.legalType
  }
  return entityType
}

// export const isBusinessAffiliated = (businessIdentifier: string): boolean => {
//     if (!businessIdentifier) {
//       return false
//     }
//     return affiliations.results.some(business => businessIdentifier === business.businessIdentifier)
//   }
