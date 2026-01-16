export const useBusinessParty = () => {
  const service = useBusinessService()

  async function getBusinessParties(
    businessId: string,
    roleClass?: RoleClass,
    roleType?: RoleType
  ): Promise<TableBusinessState<PartySchema>[] | undefined> {
    const resp = await service.getParties(businessId, {
      ...(roleClass ? { roleClass } : {}),
      ...(roleType ? { role: roleType } : {})
    })

    return resp.map(p => ({
      new: formatPartyUi(p, roleType),
      old: formatPartyUi(p, roleType)
    }))
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
