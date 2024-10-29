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
   * Makes an authenticated API request to the auth service.
   * @param endpoint - The API endpoint to call.
   * @param options - Fetch options.
   * @returns The response from the API call.
   */
  private static async authenticatedRequest<T> (endpoint: string, options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    body?: any
    params?: Record<string, any>
  } = {}): Promise<T> {
    const { config, token } = await this.getConfigAndToken()
    const url = `${config.public.authApiURL}${endpoint}`

    return $fetch<T>(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  }

  /**
   * Fetches affiliation invitations for a given organization.
   * @param orgIdentifier - The organization's identifier (number or string).
   * @param status - Optional status filter for the invitations.
   * @returns An array of AffiliationInviteInfo objects.
   */
  static async getAffiliationInvitations (orgIdentifier: number | string, status?: AffiliationInvitationStatus): Promise<AffiliationInviteInfo[]> {
    try {
      const params = { orgId: orgIdentifier, businessDetails: true, ...(status && { status }) }
      const response = await this.authenticatedRequest<{ affiliationInvitations: AffiliationInviteInfo[] }>(
        '/affiliationInvitations',
        { params }
      )
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
    try {
      await this.authenticatedRequest(
        `/affiliationInvitations/${affiliationInvitationId}`,
        { method: 'DELETE' }
      )
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
    return await this.authenticatedRequest(
      '/affiliationInvitations',
      { method: 'POST', body: payload }
    )
  }

  /**
   * Updates an existing affiliation invitation.
   * @param id - The ID of the invitation to update.
   * @returns The response from the API call.
   */
  static async updateInvitation (id: string): Promise<any> {
    return await this.authenticatedRequest(
      `/affiliationInvitations/${id}`,
      { method: 'PATCH', body: {} }
    )
  }

  /**
   * Accepts an affiliation invitation.
   * @param id - The ID of the invitation to accept.
   * @param invitationToken - The token associated with the invitation.
   * @returns The response from the API call.
   */
  static async acceptInvitation (id: string, invitationToken: string): Promise<any> {
    return await this.authenticatedRequest(
      `/affiliationInvitations/${id}/token/${invitationToken}`,
      { method: 'PUT' }
    )
  }
}
