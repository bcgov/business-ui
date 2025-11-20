export const useBusinessParty = () => {
  const businessApi = useBusinessApi()

  async function getBusinessParties(
    businessId: string,
    roleClass?: RoleClass,
    roleType?: RoleType
  ): Promise<{
    error: Error | undefined | null
    data: TableBusinessState<PartySchema>[] | undefined
  }> {
    const resp = await businessApi.getParties(businessId, {
      ...(roleClass ? { roleClass } : {}),
      ...(roleType ? { role: roleType } : {})
    })
    return resp.refresh().then((state) => {
      return {
        error: state.error,
        data: state.data?.parties.map((p) => {
          return {
            new: formatPartyUi(p, roleType),
            old: formatPartyUi(p, roleType)
          }
        })
      }
    })
  }

  return {
    getBusinessParties
  }
}
