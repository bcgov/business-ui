import {
  CorpTypeCd,
  GetCorpFullDescription,
  GetCorpNumberedDescription
} from '@bcrs-shared-components/corp-type-module'
import {
  EntityStates
} from '@bcrs-shared-components/enums'
import moment from 'moment-timezone'

export const getAffiliationInvitationStatus = (affiliationInviteInfos: AffiliationInviteInfo[]): string => {
  const invite = affiliationInviteInfos[0]
  if (invite && invite.status) {
    return invite.status
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
    case CorpTypes.CONTINUATION_IN:
      return AffiliationTypes.CONTINUATION_APPLICATION
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
    (business.corpType?.code || business.corpType) === CorpTypes.CONTINUATION_IN ||
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
    if (business?.draftStatus) {
      if (business.draftStatus === EntityStates.WITHDRAWN) {
        return EntityStateStatus.WITHDRAWN
      }
      // For now seperating out Cont In's, but leaving in ability to switch messages to other filing types
      if (business.corpType.code === CorpTypes.CONTINUATION_IN) {
        switch (business.draftStatus) {
          case (EntityStates.AWAITING_REVIEW):
            return EntityStateStatus.AWAITING_REVIEW
          case (EntityStates.REJECTED):
            return EntityStateStatus.REJECTED
          case (EntityStates.CHANGE_REQUESTED):
            return EntityStateStatus.CHANGE_REQUESTED
          case (EntityStates.APPROVED):
            return EntityStateStatus.APPROVED
          case (EntityStates.PENDING):
            return EntityStateStatus.ACTIVE
          case (EntityStates.PAID):
            return EntityStateStatus.ACTIVE
          default:
            return EntityStateStatus.DRAFT
        }
      }
    }
    if (business.effectiveDate) {
      return EntityStateStatus.FUTURE_EFFECTIVE
    }
    return EntityStateStatus.DRAFT
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

    // When the NR is conditionally approved, and the consent flag is received or waived
    // (or null which means not required), then the NR is considered approved
    if (state === NrState.CONDITIONAL && (
      business.nameRequest?.consentFlag === NrConditionalStates.RECEIVED ||
      business.nameRequest?.consentFlag === NrConditionalStates.WAIVED ||
      business.nameRequest?.consentFlag === null
    )) {
      return NrDisplayStates.APPROVED
    }

    return NrDisplayStates[state] || 'Unknown'
  }
  if (business.status) {
    return business.status.charAt(0)?.toUpperCase() + business.status?.slice(1)?.toLowerCase()
  }
  return EntityStateStatus.ACTIVE
}

/**
 * Checks if an item has an expired Name Request
 * @param item - The business to check
 * @param type - Optional corp type to check for
 * @returns True if the item has an expired Name Request matching the criteria
 */
export const isExpired = (item: Business, type?: CorpTypes): boolean => {
  // Return false if there's no expiration date
  if (!item.nameRequest?.expirationDate) {
    return false
  }

  // Using moment-timezone with a specific timezone (America/Vancouver) for date comparison
  // This approach addresses several issues with using new Date():
  // Prevents manipulation by users who might change their system clock
  // Ensures consistent timezone handling across all users regardless of their location
  const expirationDate = moment(item.nameRequest.expirationDate).tz('America/Vancouver')
  const currentDate = moment().tz('America/Vancouver')
  const isExpiredDate = expirationDate.isBefore(currentDate)

  if (!isExpiredDate) {
    return false
  }
  // If type is specified, use that for specific checking
  if (type === CorpTypes.CONTINUATION_IN) {
    return affiliationStatus(item) === EntityStateStatus.APPROVED
  }
  if (isDraft(affiliationStatus(item))) {
    return (isIA(affiliationType(item)) || isAmalgamation(affiliationType(item)))
  }

  return isExpiredDate
}

export const isExpiringSoon = (item: Business): { daysDiff: number, isSoon: boolean } => {
  // Return default if there's no expiration date
  if (!item.nameRequest?.expirationDate || isExpired(item)) {
    return { daysDiff: NaN, isSoon: false }
  }

  const expirationDate = moment(item.nameRequest.expirationDate).tz('America/Vancouver')
  const currentDate = moment().tz('America/Vancouver')

  let daysDiff = expirationDate.diff(currentDate.startOf('day'), 'days')
  if (daysDiff === 0 && expirationDate.isBefore(currentDate)) {
    daysDiff = -1
  }
  const isSoon = daysDiff >= 0 && daysDiff <= 10

  return { daysDiff, isSoon }
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

export const isFutureEffective = (item: Business) => {
  return item.effectiveDate
}

export const isChangeRequested = (item: Business) => {
  return item.draftStatus === EntityStates.CHANGE_REQUESTED
}

/**
 * Determines what alert icons/messages to display for a business item
 * @param item The business entity to check for alert conditions
 * @returns Array of alert types to display
 */
export const getDetails = (item: Business): EntityAlertTypes[] => {
  const { t } = useNuxtApp().$i18n
  const details = []
  const { daysDiff, isSoon } = isExpiringSoon(item)
  console.log('isExpired', isExpired(item))
  // Check for expired Name Requests for IAs/Registrations/Amalgamations
  // These are draft filings that haven't been submitted yet
  if (isExpired(item)) {
    const typeMap = {
      [CorpTypes.REGISTRATION]: t('entityTypes.registration'),
      [CorpTypes.INCORPORATION_APPLICATION]: t('entityTypes.incorporationApplication'),
      [CorpTypes.AMALGAMATION_APPLICATION]: t('entityTypes.amalgamationApplication')
    }
    const type = typeMap[item.corpType?.code as keyof typeof typeMap] || t('entityTypes.incorporationApplication')
    details.push({ type: EntityAlertTypes.EXPIRED, data: { type } })
  }
  // Special case: Check for expired Name Requests for Continuation Applications
  // Unlike other filings, Continuation Applications can expire even when in APPROVED status
  if (isExpired(item, CorpTypes.CONTINUATION_IN)) {
    details.push({ type: EntityAlertTypes.EXPIRED, data: { type: t('entityTypes.continuationApplication') } })
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
  if (isFutureEffective(item)) {
    details.push(EntityAlertTypes.FUTURE_EFFECTIVE)
  }
  if (isChangeRequested(item)) {
    details.push(EntityAlertTypes.CHANGE_REQUESTED)
  }
  if (isSoon) {
    details.push({ type: EntityAlertTypes.EXPIRING_SOON, data: { daysDiff } })
  }
  return details
}

export const isDraft = (state: string): boolean => {
  return NrState.DRAFT === state.toUpperCase()
}

export const isIA = (type: string): boolean => {
  return (type === AffiliationTypes.INCORPORATION_APPLICATION || type === AffiliationTypes.REGISTRATION)
}

export const isAmalgamation = (type: string): boolean => {
  return (type === AffiliationTypes.AMALGAMATION_APPLICATION)
}

export const isProcessing = (state: string): boolean => {
  return NrDisplayStates.PROCESSING === state
}

// /** Returns true if the affiliation is a numbered IA. */
export const isNumberedIncorporationApplication = (item: Business): boolean => {
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
  if (isTemporaryBusiness(business) || isNameRequest(business)) {
    return business.nameRequest?.nrNumber || business.nrNumber || ''
  }
  return business.businessIdentifier
}

export const getApprovedName = (business: Business): string => {
  const approvedNameObj = business.nameRequest?.names?.find(each => each.state === NrState.APPROVED)
  const approvedName = approvedNameObj?.name
  return approvedName || ''
}

export const getConditionalName = (business: Business): string => {
  const conditionalNameObj = business.nameRequest?.names?.find(each =>
    each.state === NrState.NE || each.state === NrState.CONDITIONAL || each.state === NrState.CONDITION
  )
  const conditionalName = conditionalNameObj?.name
  return conditionalName || ''
}

/** Returns the name of the affiliation. */
export const affiliationName = (item: Business): string => {
  if (isNumberedIncorporationApplication(item)) {
    const legalType: unknown = item.corpSubType?.code
    // provide fallback for old numbered IAs without corpSubType
    return GetCorpNumberedDescription(legalType as CorpTypeCd) || 'Numbered Company'
  }
  if (item.nameRequest) {
    return getApprovedName(item) || getConditionalName(item)
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
    nrType = mapRequestActionCdToNrType(business.nameRequest?.requestActionCd) // this only returns if its an almagation
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

export function isBusinessAffiliated (affiliations: Business[], businessIdentifier: string): boolean {
  if (!businessIdentifier) {
    return false
  }
  return affiliations.some(business => businessIdentifier === business.businessIdentifier)
}

/**
 * Checks if a Name Request is already affiliated with any business in the affiliations list
 * @param affiliations - Array of affiliated businesses
 * @param nrNumber - Name Request number to check
 * @returns true if the Name Request is already affiliated with a business
 */
export function isNameRequestAffiliated (affiliations: Business[], nrNumber: string): boolean {
  if (!nrNumber) {
    return false
  }
  return affiliations.some(business => nrNumber === business.nameRequest?.nrNumber)
}

/**
 * Gets the temporary business identifier associated with a Name Request
 * @param affiliations - Array of affiliated businesses
 * @param nrNumber - Name Request number to look up
 * @returns The business identifier if found, undefined otherwise
 */
export function getTempBusinessIdentifierOfNameRequest (affiliations: Business[], nrNumber: string): string | null {
  if (isNameRequestAffiliated(affiliations, nrNumber)) {
    return affiliations.find(business => business.nameRequest?.nrNumber === nrNumber)?.businessIdentifier || null
  }
  return null
}
