export default class AuthorizationsService {
  /**
   * Gets the authenticated Auth API client.
   * This method is called within class methods to ensure useNuxtApp() is only executed
   * when the methods are called from within the proper Nuxt context (like components, plugins).
   * Direct usage of useNuxtApp() at the class level would cause errors as it would execute
   * outside the Nuxt lifecycle.
   */
  private static getAuthApi () {
    return useNuxtApp().$authApi
  }

  /**
   * Fetches the authorizations for an organization.
   * @param orgIdentifier - The identifier of the organization.
   * @returns The authorizations for the organization.
   */
  static async fetchAuthorizations (orgIdentifier: number | string): Promise<Authorization> {
    const response = await this.getAuthApi()<Authorization>(
      `/orgs/${orgIdentifier}/authorizations`
    )
    return response
  }
}
