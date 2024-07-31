/* returns the affiliation invitation status */
export const getAffiliationInvitationStatus = (affiliationInviteInfos: AffiliationInviteInfo[]): string => {
  if (affiliationInviteInfos[0]?.status) {
    return affiliationInviteInfos[0].status
  } else {
    return 'N/A'
  }
}
