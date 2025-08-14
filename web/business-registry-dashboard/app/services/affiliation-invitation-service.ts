export default class AffiliationInvitationService {
  /**
   * Gets the authenticated Auth API client.
   * This method is called within class methods to ensure useNuxtApp() is only executed
   * when the methods are called from within the proper Nuxt context (like components, plugins).
   * Direct usage of useNuxtApp() at the class level would cause errors as it would execute
   * outside the Nuxt lifecycle.
   */
  private static getAuthApi () {
    return useNuxtApp().$authApiBRD
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
      const response = await this.getAuthApi()<{ affiliationInvitations: AffiliationInviteInfo[] }>(
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
      await this.getAuthApi()(
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
    return await this.getAuthApi()(
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
    return await this.getAuthApi()(
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
    return await this.getAuthApi()(
      `/affiliationInvitations/${id}/token/${invitationToken}`,
      { method: 'PUT' }
    )
  }
}
