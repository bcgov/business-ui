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
    normalized.address.sameAs = isEqualOmit(mailingAddress, deliveryAddress, ['id'])
  }

  return normalized
}

// returns the sections of the party that have been edited compared to the original party
function getEditedSections(subject: PartySchema, oldSubject: PartySchema): EditedSection[] {
  const editedSections: EditedSection[] = []

  // address ids are not editable so they're excluded from the comparison
  const isAddressEqual = isEqualOmit(subject.address.deliveryAddress, oldSubject.address.deliveryAddress, ['id'])
    && isEqualOmit(subject.address.mailingAddress, oldSubject.address.mailingAddress, ['id'])

  if (!isAddressEqual) {
    editedSections.push('address')
  }

  for (const section of ['name', 'roles', 'email'] as const) {
    if (!isEqual(subject[section], oldSubject[section])) {
      editedSections.push(section)
    }
  }

  return editedSections
}

export const useManageParties = (
  stateKey: string = 'manage-parties',
  opts?: {
    cleanupFn?: () => void
  }
) => {
  const tableState = useState<TableBusinessState<PartySchema>[]>(`${stateKey}-table-state`, () => [])

  const hasChanges = computed(() => tableState.value.some(p => p.new.actions?.length > 0))

  function updateTable(subject: TableBusinessState<PartySchema>): void {
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

  function addSubject(subject: ActivePartySchema): void {
    if (!subject) {
      return
    }

    updateTable({
      old: undefined,
      new: {
        ...normalizeParty(subject),
        actions: [ActionType.ADDED]
      }
    })
  }

  function removeSubject(row: TableBusinessRow<PartySchema>): void {
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

  function undoSubject(row: TableBusinessRow<PartySchema>): void {
    if (!getIsExistingRecord(row)) {
      return
    }

    const oldSubjectState = row.original.old

    // clone so `new`/`old` aren't the same reference - cloneDeep dedupes shared references,
    // so mutating one later (e.g. isEditing when re-entering edit) would corrupt the other
    updateTable({
      old: oldSubjectState,
      new: cloneDeep(oldSubjectState)
    })
  }

  function editSubject(subject: ActivePartySchema, row: TableBusinessRow<PartySchema>): void {
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
    const editedSections = getEditedSections(normalizeParty(subject), oldSubjectState)

    updateTable({
      old: oldSubjectState,
      new: {
        ...subject,
        actions: editedSections.map(section => actionsMap[section])
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
