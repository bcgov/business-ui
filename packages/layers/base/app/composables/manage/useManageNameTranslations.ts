import { cloneDeep } from 'es-toolkit'

const NON_EDITABLE_FIELDS = [
  'id',
  'isEditing',
  'actions'
] as const

export const useManageNameTranslations = (
  stateKey: string = 'manage-name-translations',
  opts?: {
    cleanupFn?: () => void
  }
) => {
  const tableState = useState<TableBusinessState<NameTranslationSchema>[]>(`${stateKey}-table-state`, () => [])

  const hasChanges = computed(() => tableState.value.some(nt => nt.new.actions?.length > 0))

  function updateTable(subject: TableBusinessState<NameTranslationSchema>): void {
    const cloned = cloneDeep(subject)

    const index = tableState.value.findIndex(
      item => item.new.id === cloned.new.id
    )

    if (index === -1) {
      // ID not found, add new row
      tableState.value = [...tableState.value, cloned]
    } else {
      // ID exists, update row
      tableState.value = tableState.value.toSpliced(index, 1, cloned)
    }

    opts?.cleanupFn?.()
  }

  function addSubject(subject: ActiveNameTranslationSchema): void {
    if (!subject) {
      return
    }

    const newRow: TableBusinessState<NameTranslationSchema> = cloneDeep({
      old: undefined,
      new: {
        ...subject,
        actions: [ActionType.ADDED]
      }
    })

    // Keep existing rows in original order and keep newly added rows newest-first.
    const existingRows = tableState.value.filter(row => row.old !== undefined)
    const addedRows = tableState.value.filter(row => row.old === undefined)

    tableState.value = [newRow, ...addedRows, ...existingRows]

    opts?.cleanupFn?.()
  }

  function removeSubject(row: TableBusinessRow<NameTranslationSchema>): void {
    const { old: oldSubjectState, new: newSubjectState } = row.original

    // If new subject, remove from state entirely
    if (!getIsExistingRecord(row)) {
      tableState.value = tableState.value.filter(
        item => item.new.id !== newSubjectState.id
      )
      opts?.cleanupFn?.()
      return
    }

    // If existing subject, add REMOVED action
    updateTable({
      old: oldSubjectState,
      new: { ...newSubjectState, actions: [ActionType.REMOVED] }
    })
  }

  function undoSubject(row: TableBusinessRow<NameTranslationSchema>): void {
    if (!getIsExistingRecord(row)) {
      return
    }

    const oldSubjectState = row.original.old

    updateTable({
      old: oldSubjectState,
      new: oldSubjectState
    })
  }

  function editSubject(subject: ActiveNameTranslationSchema, row: TableBusinessRow<NameTranslationSchema>): void {
    if (!subject) {
      return
    }

    if (!getIsExistingRecord(row)) {
      updateTable({
        old: undefined,
        new: { ...subject, actions: [ActionType.ADDED] }
      })
      return
    }

    const oldSubjectState = row.original.old
    const isChanged = !isEqualOmit(subject, oldSubjectState, NON_EDITABLE_FIELDS)

    updateTable({
      old: oldSubjectState,
      new: {
        ...subject,
        actions: isChanged ? [ActionType.CORRECTED] : []
      }
    })
  }

  return {
    tableState,
    hasChanges,
    updateTable,
    addSubject,
    removeSubject,
    undoSubject,
    editSubject
  }
}
