export const useAuthApi = () => {
  const { $authApi } = useNuxtApp()

  /**
   * Fetches the auth info of the current business.
   * @returns a promise to return the data
   */
  async function getAuthInfo(businessId: string): Promise<AuthInformation> {
    return $authApi(`/entities/${businessId}`)
  }

  return {
    getAuthInfo
  }
}
