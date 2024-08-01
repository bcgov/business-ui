export function isFromOrg (affiliationInviteInfo: AffiliationInviteInfo, fromOrgId: number): boolean {
  return affiliationInviteInfo.fromOrg.id === fromOrgId
}

export function isToOrg (affiliationInviteInfo: AffiliationInviteInfo, toOrgId: number): boolean {
  return affiliationInviteInfo.toOrg?.id === toOrgId
}

export function isToOrgAndActive (affiliationInviteInfo: AffiliationInviteInfo, toOrgId: number): boolean {
  return isToOrg(affiliationInviteInfo, toOrgId) && affiliationInviteInfo.status === AffiliationInvitationStatus.Pending
}

export function isAccepted (affiliationInviteInfo: AffiliationInviteInfo): boolean {
  return affiliationInviteInfo.status === AffiliationInvitationStatus.Accepted
}
