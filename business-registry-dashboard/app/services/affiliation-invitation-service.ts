import { useRuntimeConfig } from '#app'

export default class AffiliationInvitationService {
  /**
   * Retrieves the runtime configuration and Keycloak token.
   * @returns An object containing the config and token.
   */
  private static async getConfigAndToken () {
    const config = useRuntimeConfig()
    const keycloak = useKeycloak()
    const token = await keycloak.getToken()
    return { config, token }
  }

  /**
   * Fetches affiliation invitations for a given organization.
   * @param orgIdentifier - The organization's identifier (number or string).
   * @param status - Optional status filter for the invitations.
   * @returns An array of AffiliationInviteInfo objects.
   */
  static async getAffiliationInvitations (orgIdentifier: number | string, status?: AffiliationInvitationStatus): Promise<AffiliationInviteInfo[]> {
    const { config, token } = await this.getConfigAndToken()
    try {
      const params: any = { orgId: orgIdentifier, businessDetails: true }
      if (status) {
        params.status = status
      }
      const response = await $fetch<{ affiliationInvitations: AffiliationInviteInfo[] }>(`${config.public.authApiURL}/affiliationInvitations`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return response.affiliationInvitations
    } catch (err) {
      console.error(err)
      return []
    }
  }

  /**
   * Removes an affiliation invitation.
   * @param affiliationInvitationId - The ID of the invitation to remove.
   * @returns A boolean indicating success (true) or failure (false).
   */
  static async removeAffiliationInvitation (affiliationInvitationId: number): Promise<boolean> {
    const { config, token } = await this.getConfigAndToken()
    try {
      await $fetch(`${config.public.authApiURL}/affiliationInvitations/${affiliationInvitationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  /**
   * Creates a new affiliation invitation.
   * @param payload - The CreateAffiliationInvitation object containing invitation details.
   * @returns The response from the API call.
   */
  static async createInvitation (payload: CreateAffiliationInvitation): Promise<any> {
    const { config, token } = await this.getConfigAndToken()
    return $fetch(`${config.public.authApiURL}/affiliationInvitations`, {
      method: 'POST',
      body: payload,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  }

  /**
   * Updates an existing affiliation invitation.
   * @param id - The ID of the invitation to update.
   * @returns The response from the API call.
   */
  static async updateInvitation (id: string): Promise<any> {
    const { config, token } = await this.getConfigAndToken()
    return $fetch(`${config.public.authApiURL}/affiliationInvitations/${id}`, {
      method: 'PATCH',
      body: {},
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  }

  /**
   * Accepts an affiliation invitation.
   * @param id - The ID of the invitation to accept.
   * @param invitationToken - The token associated with the invitation.
   * @returns The response from the API call.
   */
  static async acceptInvitation (id: string, invitationToken: string): Promise<any> {
    const { config, token } = await this.getConfigAndToken()
    return $fetch(`${config.public.authApiURL}/affiliationInvitations/${id}/token/${invitationToken}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      method: 'PUT'
    })
  }
}
