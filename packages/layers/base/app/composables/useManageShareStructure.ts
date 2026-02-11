import type { ExpandedState } from '@tanstack/vue-table'

export const useManageShareStructure = (stateKey: string = 'manage-share-structure') => {
  const expandedState = useState<ExpandedState | undefined>(`${stateKey}-expanded-state`, () => undefined)
  const tableState = useState<TableBusinessState<ShareClassSchema>[]>(`${stateKey}-table-state`, () => [])

  function addNewShareClass(shareClass: ActiveShareClassSchema) {
    if (!shareClass) {
      return
    }
    const newState: TableBusinessState<ShareClassSchema> = {
      new: {
        ...shareClass,
        name: shareClass.name,
        actions: [ActionType.ADDED]
      },
      old: undefined
    }

    // place new row at the beginning of the list
    tableState.value = [
      JSON.parse(JSON.stringify(newState)),
      ...tableState.value
    ]

    // increase every row priority that was not the row just added by 1
    tableState.value.filter(item => item.new.id !== shareClass.id).forEach(item => item.new.priority++)
  }

  function removeShareClass(row: TableBusinessRow<ShareClassSchema>): void {
    const removedPriority = row.original.new.priority

    if (row.original.old === undefined) {
      tableState.value = tableState.value.filter(item => item.new.id !== row.original.new.id)
      tableState.value.forEach(item => item.new.priority > removedPriority && item.new.priority--)
    } else {
      const rowToUpdate = tableState.value.find(item => item.new.id === row.original.new.id)
      if (rowToUpdate) {
        rowToUpdate.new.actions = [ActionType.REMOVED]
      }
    }
  }

  function undoShareClass(row: TableBusinessRow<ShareClassSchema>): void {
    const rowToUpdate = tableState.value.find(item => item.new.id === row.original.new.id)
    const currentPriority = rowToUpdate?.new.priority
    if (rowToUpdate && row.original.old && currentPriority) {
      rowToUpdate.new = {
        ...row.original.old,
        priority: currentPriority
      }
    }
  }

  function updateShareClass(row: TableBusinessRow<ShareClassSchema>, shareClass: ActiveShareClassSchema): void {
    if (!shareClass) {
      return
    }

    const rowToUpdate = tableState.value.find(item => item.new.id === row.original.new.id)

    if (rowToUpdate) {
      rowToUpdate.new = {
        ...shareClass,
        name: shareClass.name,
        actions: row.original.old ? [ActionType.CHANGED] : [ActionType.ADDED]
      }
    }
  }

  // function applyTableEdits(party: ActivePartySchema, row: TableBusinessRow<PartySchema>): void {
  //   if (!party) {
  //     return
  //   }

  //   const originalPartyState = row.original.old
  //   let newActions: ActionType[] = []

  //   if (originalPartyState === undefined) {
  //     newActions = [ActionType.ADDED]
  //   } else {
  //     const sectionsToCompare: EditedSection[] = ['address', 'name', 'roles']
  //     const editedSections: EditedSection[] = []

  //     for (const section of sectionsToCompare) {
  //       const originalSection = originalPartyState[section]
  //       const newSection = party[section]

  //       if (!isEqual(originalSection, newSection)) {
  //         editedSections.push(section)
  //       }
  //     }

  //     newActions = editedSections.map(section => actionsMap[section])
  //   }

  //   const newState: TableBusinessState<PartySchema> = {
  //     old: originalPartyState,
  //     new: {
  //       ...party,
  //       actions: newActions
  //     }
  //   }

  //   updateTable(newState, row)
  // }

  return {
    expandedState,
    tableState,
    addNewShareClass,
    removeShareClass,
    undoShareClass,
    updateShareClass
    // updateTable
    // addNewParty,
    // removeParty,
    // undoParty,
    // applyTableEdits
  }
}
