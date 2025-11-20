import { isEqual } from 'es-toolkit'

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
          const mailingAddress = formatAddressUi(p.mailingAddress)
          const deliveryAddress = formatAddressUi(p.deliveryAddress)
          const roles = p.roles.filter(role => roleType ? role.roleType === roleType : true)
          const id = p.officer.id ? String(p.officer.id) : undefined
          const party: PartyStateBase = {
            id,
            name: {
              firstName: p.officer.firstName ?? '',
              middleName: p.officer.middleInitial ?? '',
              lastName: p.officer.lastName ?? '',
              businessName: p.officer.organizationName,
              partyType: p.officer.partyType
            },
            address: {
              mailingAddress,
              deliveryAddress,
              sameAs: isEqual(mailingAddress, deliveryAddress)
            },
            roles,
            actions: []
          }
          return {
            new: party,
            old: party
          }
        })
      }
    })
  }

  return {
    getBusinessParties
  }
}
