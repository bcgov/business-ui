// NB: Currently built to use corrections schema, will need update if using this in other filings
// These values will be omitted during the edit equality check
const NON_EDITABLE_FIELDS = [
  'isEditing',
  'actions',
  'id'
] as const

export const useManageAmalgamation = (
  stateKey: string = 'manage-amalgamation',
  opts?: {
    cleanupFn?: () => void
  }
) => {
  const tableState = useState<TableBusinessState<AmalgamationTableRow>[]>(
    `${stateKey}-table-state`,
    () => []
  )

  const stmtDefaults = getAmalgamationCorrectStatementSchema().parse({})
  const statementState = useState<TableBusinessState<AmalgamationCorrectStatementSchema>>(
    `${stateKey}-statement-state`,
    () => ({
      new: structuredClone(stmtDefaults),
      old: structuredClone(stmtDefaults)
    })
  )

  const hasChanges = computed(() => {
    const tableChanged = tableState.value.some(am => am.new.actions.length > 0)
    const statementChanged = statementState.value.new.actions.length > 0
    return tableChanged || statementChanged
  })

  function updateTable(subject: TableBusinessState<AmalgamationTableRow>): void {
    const cloned = JSON.parse(JSON.stringify(subject))

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

  function addSubject(subject: ActiveAmalgamationCorrectSchema) {
    if (!subject) {
      return
    }

    updateTable({
      old: undefined,
      new: { ...subject, actions: [ActionType.ADDED] }
    })
  }

  function removeSubject(row: TableBusinessRow<AmalgamationTableRow>): void {
    const { old: oldSubjectState, new: newSubjectState } = row.original

    // If new subject, remove from state entirely
    if (oldSubjectState === undefined) {
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

  function undoSubject(row: TableBusinessRow<AmalgamationTableRow>): void {
    const { old: oldSubjectState } = row.original

    if (oldSubjectState === undefined) {
      return
    }

    updateTable({
      old: oldSubjectState,
      new: oldSubjectState
    })
  }

  function editSubject(
    subject: AmalgamationTableRow | null | undefined,
    row: TableBusinessRow<AmalgamationTableRow>
  ): void {
    if (!subject) {
      return
    }

    const { old: oldSubjectState } = row.original
    let actions: ActionType[] = []

    // If new subject, only ever apply the ADDED badge
    if (oldSubjectState === undefined) {
      actions = [ActionType.ADDED]
    // else compare new and old state, omitting values the user can't edit
    } else if (!isEqualOmit(subject, oldSubjectState, NON_EDITABLE_FIELDS)) {
      actions = [ActionType.CHANGED]
    }

    updateTable({
      old: oldSubjectState,
      new: { ...subject, actions }
    })
  }

  function updateStatement(newStatement: ActiveAmalgamationCorrectStatementSchema) {
    if (newStatement) {
      const initialState = JSON.parse(JSON.stringify(statementState.value.old!)) // old is guaranteed here
      const isChanged = !isEqualOmit(newStatement, initialState, ['isEditing', 'actions'])

      statementState.value = {
        old: initialState,
        new: {
          courtApproval: newStatement.courtApproval,
          isEditing: false,
          actions: isChanged ? [ActionType.CHANGED] : []
        }
      }
    }

    opts?.cleanupFn?.()
  }

  function undoStatement() {
    const initialState = statementState.value.old!
    statementState.value = {
      old: JSON.parse(JSON.stringify(initialState)),
      new: JSON.parse(JSON.stringify(initialState))
    }
  }

  return {
    tableState,
    statementState,
    hasChanges,
    addSubject,
    removeSubject,
    updateTable,
    editSubject,
    undoSubject,
    updateStatement,
    undoStatement
  }
}
