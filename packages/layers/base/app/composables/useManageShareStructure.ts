import type { ExpandedState } from '@tanstack/vue-table'
// import { isEqual } from 'es-toolkit'

// type EditedSection = 'address' | 'name' | 'roles'
// const actionsMap: Record<EditedSection, ActionType> = {
//   name: ActionType.NAME_CHANGED,
//   address: ActionType.ADDRESS_CHANGED,
//   roles: ActionType.ROLES_CHANGED
// }

export const useManageShareStructure = (stateKey: string = 'manage-share-structure') => {
  const expandedState = useState<ExpandedState | undefined>(`${stateKey}-expanded-state`, () => undefined)
  const tableState = useState<TableBusinessState<ShareClassSchema>[]>(`${stateKey}-table-state`, () => [])

  // function
  // updateTable(newState: TableBusinessState<ShareClassSchema>, row?: TableBusinessRow<ShareClassSchema>): void {
  //   if (!row) {
  //     tableState.value = [
  //       JSON.parse(JSON.stringify(newState)),
  //       ...tableState.value
  //     ]
  //   } else {
  //     const rowId = row.original.new.id

  //     const index = row.index

  //     tableState.value = [
  //       ...tableState.value.slice(0, index),
  //       JSON.parse(JSON.stringify(newState)),
  //       ...tableState.value.slice(index + 1)
  //     ]
  //   }
  // }

  // function addNewShareClass(shareClass: ActiveShareClassSchema) {
  //   if (!shareClass) {
  //     return
  //   }

  //   const newState: TableBusinessState<ShareClassSchema> = {
  //     new: {
  //       ...shareClass,
  //       actions: [ActionType.ADDED]
  //     },
  //     old: undefined
  //   }
  //   updateTable(newState)
  // }

  // function removeShareClass(row: TableBusinessRow<PartySchema>): void {
  //   const oldPartyState = row.original.old
  //   const newPartyState = row.original.new

  //   if (oldPartyState === undefined) {
  //     tableState.value = [
  //       ...tableState.value.slice(0, row.index),
  //       ...tableState.value.slice(row.index + 1)
  //     ]
  //   } else {
  //     const newState: TableBusinessState<PartySchema> = {
  //       new: { ...newPartyState, actions: [ActionType.REMOVED] },
  //       old: oldPartyState
  //     }

  //     updateTable(newState, row)
  //   }
  // }

  // function undoParty(row: TableBusinessRow<PartySchema>): void {
  //   const oldReceiver = row.original.old

  //   if (oldReceiver) {
  //     const newState: TableBusinessState<PartySchema> = {
  //       new: oldReceiver,
  //       old: oldReceiver
  //     }

  //     updateTable(newState, row)
  //   }
  // }

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
    tableState
    // updateTable
    // addNewParty,
    // removeParty,
    // undoParty,
    // applyTableEdits
  }
}
