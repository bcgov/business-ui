import { cloneDeep } from 'es-toolkit'

const NON_EDITABLE_FIELDS = [
  'id',
  'isEditing',
  'actions',
  'type'
] as const

export const useManageOffices = (
  stateKey: string = 'manage-offices',
  opts?: {
    cleanupFn?: () => void
  }
) => {
  const tableState = useState<TableBusinessState<OfficeSchema>[]>(`${stateKey}-table-state`, () => [])

  const hasChanges = computed(() => tableState.value.some(o => o.new.actions?.length > 0))

  function updateTable(subject: TableBusinessState<OfficeSchema>): void {
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

  function addSubject(subject: ActiveOfficeSchema): void {
    if (!subject) {
      return
    }

    updateTable({
      old: undefined,
      new: {
        ...subject,
        actions: [ActionType.ADDED]
      }
    })
  }

  function removeSubject(row: TableBusinessRow<OfficeSchema>): void {
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

  function undoSubject(row: TableBusinessRow<OfficeSchema>): void {
    if (!getIsExistingRecord(row)) {
      return
    }

    const oldSubjectState = row.original.old

    updateTable({
      old: oldSubjectState,
      new: oldSubjectState
    })
  }

  function editSubject(subject: ActiveOfficeSchema, row: TableBusinessRow<OfficeSchema>): void {
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
        actions: isChanged ? [ActionType.CHANGED] : []
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
