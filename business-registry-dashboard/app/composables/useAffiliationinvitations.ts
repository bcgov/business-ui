// TODO: implement

// export const useAffiliationInvitations = () => {
//   const { $keycloak } = useNuxtApp()
//   const authApiUrl = useRuntimeConfig().public.authApiURL

//   async function getAffiliationInvitations (orgIdentifier: number | string, status?: AffiliationInvitationStatus): Promise<AffiliationInviteInfo[] | null> {
//     try {
//       let params: any = { orgId: orgIdentifier, businessDetails: true }
//       if (status) {
//         params = { ...params, status }
//       }
//       const response = await $fetch<{ affiliationInvitations: AffiliationInviteInfo[]}>(`${authApiUrl}/affiliationInvitations`,
//         {
//           params,
//           headers: {
//             Authorization: `Bearer ${$keycloak.token}`
//           }
//         }
//       )

//       if (response.affiliationInvitations.length > 0) {
//         return response.affiliationInvitations
//       } else {
//         return null
//       }
//     } catch (err) {
//       console.log(err)
//       return null
//     }
//   }
//   // async function removeAffiliationInvitation (affiliationInvitationId: number) : Promise<boolean> {
//   //   try {
//   //     await $fetch(`${authApiUrl}/affiliationInvitations/${affiliationInvitationId}`,
//   //       {
//   //         method: 'DELETE',
//   //         headers: {
//   //           Authorization: `Bearer ${$keycloak.token}`
//   //         }
//   //       }
//   //     )
//   //     return true
//   //   } catch (err) {
//   //     console.log(err)
//   //     return false
//   //   }
//   // }
//   // async function createInvitation (payload: CreateAffiliationInvitation): Promise<AxiosResponse<any>> {
//   //   return axios.post(`${authApiUrl}/affiliationInvitations`, payload)
//   // }
//   // async function updateInvitation (id: string): Promise<AxiosResponse<any>> {
//   //   return axios.patch(`${authApiUrl}/affiliationInvitations/${id}`, {})
//   // }
//   // async function acceptInvitation (id: string, invitationToken: string): Promise<AxiosResponse<AffiliationInvitation>> {
//   //   return axios.put(`${authApiUrl}/affiliationInvitations/${id}/token/${invitationToken}`)
//   // }

//   return {
//     getAffiliationInvitations
//     // removeAffiliationInvitation,
//     // createInvitation,
//     // updateInvitation,
//     // acceptInvitation
//   }
// }
