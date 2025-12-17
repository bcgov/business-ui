export * from './mutations'
export * from './queries'
export * from './query-keys'

export const useBusinessService = () => {
  const query = useBusinessQuery()

  /**
   * Fetches the business info of the current business.
   * @param businessId the identifier of the business
   * @param slim return BusinessDataSlim or BusinessData
   * @returns a promise to return business data
   */
  function getBusiness(businessId: string, slim: true): Promise<BusinessDataSlim>
  function getBusiness(businessId: string, slim?: false): Promise<BusinessData>
  async function getBusiness(
    businessId: string,
    slim = false
  ): Promise<BusinessDataSlim | BusinessData> {
    const { data, refresh } = query.getBusiness(businessId, slim)
    await refresh(true)
    return data.value!.business
  }

  return {
    getBusiness
  }
}
