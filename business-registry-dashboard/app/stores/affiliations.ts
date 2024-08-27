// import { type AlternateNameIF } from '@bcrs-shared-components/interfaces'

export const useAffiliationsStore = defineStore('brd-affiliations-store', () => {
  const { $authApi } = useNuxtApp()

  function removeInvite (inviteId: number) {
    return $authApi(`/affiliationInvitations/${inviteId}`, {
      method: 'DELETE'
    })
  }

  // function $reset () {
  //   loading.value = true
  //   affiliations.value = []
  // }

  return {
    removeInvite
    // $reset,
    // loading,
    // affiliations
  }
}
// { persist: true } // persist store values in session storage
)
