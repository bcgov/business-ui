// These values will be omitted during the edit equality check
const NON_EDITABLE_FIELDS = [
  'isEditing', 
  'actions', 
  'id', 
  'filingId', 
  'filingType', 
  'orderDate'
] as const

export const useManageCourtOrders = (stateKey: string = 'manage-court-orders') => {
  const tableState = useState<TableBusinessState<CourtOrderPoaFullSchema>[]>(
    `${stateKey}-table-state`,
    () => []
  )

  function updateTable(subject: TableBusinessState<CourtOrderPoaFullSchema>): void {
    // Deep clones and removes Vue proxies to prevent accidental updates to source object
    const cloned = structuredClone(toRaw(subject))

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
  }

  function addSubject(subject: ActiveCourtOrderPoaFullSchema) {
    if (!subject) {
      return
    }

    updateTable({
      old: undefined,
      new: { ...subject, actions: [ActionType.ADDED] }
    })
  }

  function removeSubject(row: TableBusinessRow<CourtOrderPoaFullSchema>): void {
    const { old: oldSubjectState, new: newSubjectState } = row.original

    // If new subject, remove from state entirely
    if (oldSubjectState === undefined) {
      tableState.value = tableState.value.filter(
        item => item.new.id !== newSubjectState.id
      )
      return
    }

    // If existing subject, add REMOVED action
    updateTable({
      old: oldSubjectState,
      new: { ...newSubjectState, actions: [ActionType.REMOVED] }
    })
  }

  function undoSubject(row: TableBusinessRow<CourtOrderPoaFullSchema>): void {
    const { old: oldSubjectState } = row.original

    if (oldSubjectState === undefined) {
      return
    }

    updateTable({
      old: oldSubjectState,
      new: oldSubjectState
    })
  }

  function applyEdits(subject: ActiveCourtOrderPoaFullSchema, row: TableBusinessRow<CourtOrderPoaFullSchema>): void {
    if (!subject) {
      return
    }

    const { old: oldSubjectState, new: newSubjectState } = row.original
    let actions: ActionType[] = []

    // If new subject, only ever apply the ADDED badge
    if (oldSubjectState === undefined) {
      actions = [ActionType.ADDED]
    // else compare new and old state, omitting values the user can't edit
    } else if (!isEqualOmit(subject, newSubjectState, NON_EDITABLE_FIELDS)) {
      actions = [ActionType.CHANGED]
    }

    updateTable({
      old: oldSubjectState,
      new: { ...subject, actions }
    })
  }

  return {
    tableState,
    addSubject,
    removeSubject,
    updateTable,
    applyEdits,
    undoSubject,
  }
}
