import type { ExpandedState } from '@tanstack/vue-table'
import { isEqual } from 'es-toolkit'

type EditedSection = 'name'
const actionsMap: Record<EditedSection, ActionType> = {
  name: ActionType.CORRECTED
}

export const useManageNameTranslations = (stateKey: string = 'manage-name-translations') => {
  const addingNameTranslation = useState<boolean>(`${stateKey}-adding-state`, () => false)
  const expandedState = useState<ExpandedState | undefined>(`${stateKey}-expanded-state`, () => undefined)
  const tableState = useState<TableBusinessState<NameTranslationSchema>[]>(`${stateKey}-table-state`, () => [])

  function updateTable(
    newState: TableBusinessState<NameTranslationSchema>,
    row?: TableBusinessRow<NameTranslationSchema>
  ): void {
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

  function addNewNameTranslation(nameTranslation: ActiveNameTranslationSchema) {
    if (!nameTranslation) {
      return
    }

    const newState: TableBusinessState<NameTranslationSchema> = {
      new: {
        ...nameTranslation,
        actions: [ActionType.ADDED]
      },
      old: undefined
    }

    // Keep existing rows in original order and keep newly added rows newest-first.
    const existingRows = tableState.value.filter(row => row.old !== undefined)
    const addedRows = tableState.value.filter(row => row.old === undefined)

    tableState.value = [
      JSON.parse(JSON.stringify(newState)),
      ...addedRows,
      ...existingRows
    ]
  }

  function removeNameTranslation(row: TableBusinessRow<NameTranslationSchema>): void {
    const oldState = row.original.old
    const newState = row.original.new

    if (oldState === undefined) {
      tableState.value = [
        ...tableState.value.slice(0, row.index),
        ...tableState.value.slice(row.index + 1)
      ]
    } else {
      const updated: TableBusinessState<NameTranslationSchema> = {
        new: { ...newState, actions: [ActionType.REMOVED] },
        old: oldState
      }

      updateTable(updated, row)
    }
  }

  function undoNameTranslation(row: TableBusinessRow<NameTranslationSchema>): void {
    const oldState = row.original.old

    if (oldState) {
      const updated: TableBusinessState<NameTranslationSchema> = {
        new: oldState,
        old: oldState
      }

      updateTable(updated, row)
    }
  }

  function applyTableEdits(
    nameTranslation: ActiveNameTranslationSchema,
    row: TableBusinessRow<NameTranslationSchema>
  ): void {
    if (!nameTranslation) {
      return
    }

    const originalState = row.original.old
    let newActions: ActionType[] = []

    if (originalState === undefined) {
      newActions = [ActionType.ADDED]
    } else {
      const sectionsToCompare: EditedSection[] = ['name']
      const editedSections: EditedSection[] = []

      for (const section of sectionsToCompare) {
        const originalSection = originalState[section]
        const newSection = nameTranslation[section]

        if (!isEqual(originalSection, newSection)) {
          editedSections.push(section)
        }
      }

      newActions = editedSections.map(section => actionsMap[section])
    }

    const newState: TableBusinessState<NameTranslationSchema> = {
      old: originalState,
      new: {
        ...nameTranslation,
        actions: newActions
      }
    }

    updateTable(newState, row)
  }

  return {
    addingNameTranslation,
    expandedState,
    tableState,
    updateTable,
    addNewNameTranslation,
    removeNameTranslation,
    undoNameTranslation,
    applyTableEdits
  }
}
