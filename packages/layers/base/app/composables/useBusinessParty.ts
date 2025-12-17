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

  function getPartiesMergedWithRelationships(
    tableState: TableBusinessState<PartySchema>[],
    relationships: BusinessRelationship[]
  ) {
    for (const relationship of relationships) {
      const partyId = relationship.entity.identifier
      const existingParty = partyId ? tableState.find(party => party.new.id === partyId) : undefined
      if (existingParty) {
        existingParty.new = formatRelationshipUi(relationship)
      } else {
        // New party
        tableState.push({
          new: formatRelationshipUi(relationship),
          old: undefined
        })
      }
    }
    return tableState
  }

  return {
    getBusinessParties,
    getPartiesMergedWithRelationships
  }
}
