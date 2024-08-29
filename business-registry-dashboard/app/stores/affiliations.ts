// import { type AlternateNameIF } from '@bcrs-shared-components/interfaces'

export const useAffiliationsStore = defineStore('brd-affiliations-store', () => {
  const { $authApi } = useNuxtApp()

  function removeInvite (inviteId: number) {
    return $authApi(`/affiliationInvitations/${inviteId}`, {
      method: 'DELETE'
    })
  }

  /** Remove Accepted affiliation invitations from business. */
  async function removeAcceptedAffiliationInvitations (business: Business) {
    const invitations = business.affiliationInvites || []
    for (const affiliationInvitation of invitations) {
      if (affiliationInvitation.status === AffiliationInvitationStatus.Accepted) {
        await removeInvite(affiliationInvitation.id)
      }
    }
  }

  // function $reset () {
  //   loading.value = true
  //   affiliations.value = []
  // }

  return {
    removeInvite,
    removeAcceptedAffiliationInvitations
    // $reset,
    // loading,
    // affiliations
  }
}
// { persist: true } // persist store values in session storage
)
