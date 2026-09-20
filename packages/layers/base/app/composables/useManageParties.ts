import type { ExpandedState } from '@tanstack/vue-table'
import { isEqual, cloneDeep } from 'es-toolkit'

type EditedSection = 'address' | 'name' | 'roles' | 'email'
const actionsMap: Record<EditedSection, ActionType> = {
  name: ActionType.NAME_CHANGED,
  address: ActionType.ADDRESS_CHANGED,
  roles: ActionType.ROLES_CHANGED,
  email: ActionType.EMAIL_CHANGED
}

// normalize party address sameAs
function normalizeParty<T extends ActivePartySchema>(party: T): T {
  if (!party?.address) {
    return party
  }

  const normalized = cloneDeep(party)
  const { mailingAddress, deliveryAddress } = normalized.address

  if (mailingAddress && deliveryAddress) {
    // @ts-expect-error - id not in party schema currently, needs greater refactor
    normalized.address.sameAs = isEqualOmit(mailingAddress, deliveryAddress, ['id'])
  }

  return normalized
}

export const useManageParties = (stateKey: string = 'manage-parties') => {
  const addingParty = useState<boolean>(`${stateKey}-adding-state`, () => false)
  const expandedState = useState<ExpandedState | undefined>(`${stateKey}-expanded-state`, () => undefined)
  const tableState = useState<TableBusinessState<PartySchema>[]>(`${stateKey}-table-state`, () => [])

  const hasChanges = computed(() => tableState.value.some(p => p.new.actions.length > 0))

  function updateTable(newState: TableBusinessState<PartySchema>, row?: TableBusinessRow<PartySchema>): void {
    const newItem = cloneDeep(newState)

    if (!row) {
      tableState.value = [...tableState.value, newItem]
    } else {
      const index = row.index

      tableState.value = [
        ...tableState.value.slice(0, index),
        newItem,
        ...tableState.value.slice(index + 1)
      ]
    }
  }

  function addNewParty(party: ActivePartySchema) {
    if (!party) {
      return
    }

    const normalizedParty = normalizeParty(party)

    const newState: TableBusinessState<PartySchema> = {
      new: {
        ...normalizedParty,
        actions: [ActionType.ADDED]
      },
      old: undefined
    }
    updateTable(newState)
  }

  function removeParty(row: TableBusinessRow<PartySchema>): void {
    const oldPartyState = row.original.old
    const newPartyState = row.original.new

    if (oldPartyState === undefined) {
      tableState.value = [
        ...tableState.value.slice(0, row.index),
        ...tableState.value.slice(row.index + 1)
      ]
    } else {
      const newState: TableBusinessState<PartySchema> = {
        new: { ...newPartyState, actions: [ActionType.REMOVED] },
        old: oldPartyState
      }

      updateTable(newState, row)
    }
  }

  function undoParty(row: TableBusinessRow<PartySchema>): void {
    const oldState = row.original.old

    if (oldState) {
      const newState: TableBusinessState<PartySchema> = {
        new: oldState,
        old: oldState
      }

      updateTable(newState, row)
    }
  }

  function applyTableEdits(party: ActivePartySchema, row: TableBusinessRow<PartySchema>): void {
    if (!party) {
      return
    }

    const normalizedParty = normalizeParty(party)
    const originalPartyState = row.original.old
    let newActions: ActionType[] = []

    if (originalPartyState === undefined) {
      newActions = [ActionType.ADDED]
    } else {
      const sectionsToCompare: EditedSection[] = ['address', 'name', 'roles', 'email']
      const editedSections: EditedSection[] = []

      for (const section of sectionsToCompare) {
        const originalSection = originalPartyState[section]
        const newSection = normalizedParty[section]

        if (section === 'address') {
          // @ts-expect-error - loses type inference here
          const deliveryEqual = isEqualOmit(originalSection.deliveryAddress, newSection.deliveryAddress, ['id'])
          // @ts-expect-error - loses type inference here
          const mailingEqual = isEqualOmit(originalSection.mailingAddress, newSection.mailingAddress, ['id'])
          if (!deliveryEqual || !mailingEqual) {
            editedSections.push('address')
          }
        } else if (!isEqual(originalSection, newSection)) {
          editedSections.push(section)
        }
      }

      newActions = editedSections.map(section => actionsMap[section])
    }

    const newState: TableBusinessState<PartySchema> = {
      old: originalPartyState,
      new: {
        ...party,
        actions: newActions
      }
    }

    updateTable(newState, row)
  }

  return {
    addingParty,
    expandedState,
    tableState,
    hasChanges,
    updateTable,
    addNewParty,
    removeParty,
    undoParty,
    applyTableEdits
  }
}
