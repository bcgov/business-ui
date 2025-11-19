import { isEqual } from 'es-toolkit'

export const useBusinessParty = () => {
  const businessApi = useBusinessApi()

  async function getBusinessParties(
    businessId: string,
    roleClass?: RoleClass,
    roleType?: RoleType
  ) {
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

          return {
            old: {
              id,
              officer: p.officer,
              mailingAddress,
              deliveryAddress,
              sameAsDelivery: isEqual(mailingAddress, deliveryAddress),
              roles
            }
          } as BusinessPartyTableState
        })
      }
    })
  }

  return {
    getBusinessParties
  }
}
