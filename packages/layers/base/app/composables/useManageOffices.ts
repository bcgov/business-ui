import type { ExpandedState } from '@tanstack/vue-table'
import { isEqual } from 'es-toolkit'

type EditedSection = 'address'
const actionsMap: Record<EditedSection, ActionType> = {
  address: ActionType.ADDRESS_CHANGED
}

export const useManageOffices = (stateKey: string = 'manage-offices') => {
  const addingOffice = useState<boolean>(`${stateKey}-adding-state`, () => false)
  const expandedState = useState<ExpandedState | undefined>(`${stateKey}-expanded-state`, () => undefined)
  const tableState = useState<TableBusinessState<OfficesSchema>[]>(`${stateKey}-table-state`, () => [])

  function updateTable(newState: TableBusinessState<OfficesSchema>, row?: TableBusinessRow<OfficesSchema>): void {
    if (!row) {
      tableState.value = [
        ...tableState.value,
        JSON.parse(JSON.stringify(newState))
      ]
    } else {
      const index = row.index

      tableState.value = [
        ...tableState.value.slice(0, index),
        JSON.parse(JSON.stringify(newState)),
        ...tableState.value.slice(index + 1)
      ]
    }
  }

  function addNewOffice(office: ActiveOfficesSchema) {
    if (!office) {
      return
    }

    const newState: TableBusinessState<OfficesSchema> = {
      new: {
        ...office,
        actions: [ActionType.ADDED]
      },
      old: undefined
    }
    updateTable(newState)
  }

  function removeOffice(row: TableBusinessRow<OfficesSchema>): void {
    const oldOfficesState = row.original.old
    const newOfficesState = row.original.new

    if (oldOfficesState === undefined) {
      tableState.value = [
        ...tableState.value.slice(0, row.index),
        ...tableState.value.slice(row.index + 1)
      ]
    } else {
      const newState: TableBusinessState<OfficesSchema> = {
        new: { ...newOfficesState, actions: [ActionType.REMOVED] },
        old: oldOfficesState
      }

      updateTable(newState, row)
    }
  }

  function undoOffice(row: TableBusinessRow<OfficesSchema>): void {
    const oldOffice = row.original.old

    if (oldOffice) {
      const newState: TableBusinessState<OfficesSchema> = {
        new: oldOffice,
        old: oldOffice
      }

      updateTable(newState, row)
    }
  }

  function applyTableEdits(office: ActiveOfficesSchema, row: TableBusinessRow<OfficesSchema>): void {
    if (!office) {
      return
    }

    const originalOfficeState = row.original.old
    let newActions: ActionType[] = []

    if (originalOfficeState === undefined) {
      newActions = [ActionType.ADDED]
    } else {
      const sectionsToCompare: EditedSection[] = ['address']
      const editedSections: EditedSection[] = []

      for (const section of sectionsToCompare) {
        const originalSection = originalOfficeState[section]
        const newSection = office[section]

        if (!isEqual(originalSection, newSection)) {
          editedSections.push(section)
        }
      }

      newActions = editedSections.map(section => actionsMap[section])
    }

    const newState: TableBusinessState<OfficesSchema> = {
      old: originalOfficeState,
      new: {
        ...office,
        actions: newActions
      }
    }

    updateTable(newState, row)
  }

  return {
    addingOffice,
    expandedState,
    tableState,
    updateTable,
    addNewOffice,
    removeOffice,
    undoOffice,
    applyTableEdits
  }
}
