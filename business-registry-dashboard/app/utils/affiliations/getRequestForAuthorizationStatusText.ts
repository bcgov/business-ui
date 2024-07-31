function getElementWithSmallestId<Type extends {id:number}> (arrayToSearch: Type[]): Type | undefined {
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
