import { cloneDeep } from 'es-toolkit'

const emptyState = createDefaultYourCompany()
const defaultState: ManageYourCompanyState = {
  old: emptyState,
  new: cloneDeep(emptyState)
}

export const useManageYourCompany = (
  stateKey: string = 'manage-your-company',
  opts?: {
    cleanupFn?: () => void
  }
) => {
  const state = useState<ManageYourCompanyState>(`${stateKey}-state`, () => defaultState)

  const hasChanges = computed(() => {
    return Object.keys(state.value.new).some((k) => {
      const field = state.value.new[k as keyof ManageYourCompanyFields]
      return typeof field === 'object' && field?.actions?.length > 0
    })
  })

  function editSubject<K extends keyof ManageYourCompanyFields>(
    subject?: {
      key: K
      value: Required<ManageYourCompanyFields>[K]['value']
    }
  ): void {
    if (!subject) {
      return
    }

    const { key, value } = subject
    const newSubject = state.value.new[key] as ManageYourCompanyFields[K]
    const oldSubject = state.value.old[key] as ManageYourCompanyFields[K]

    if (!newSubject || !value) {
      return
    }

    newSubject.value = value

    if (!isEqualOmit(value, oldSubject?.value, ['changeOption'])) {
      newSubject.actions = [ActionType.CHANGED]
    } else {
      newSubject.actions = []
    }

    opts?.cleanupFn?.()
  }

  function undoSubject<K extends keyof ManageYourCompanyFields>(key: K) {
    if (state.value.old[key]) {
      state.value.new[key] = cloneDeep(state.value.old[key])
    }
    opts?.cleanupFn?.()
  }

  return {
    state,
    hasChanges,
    editSubject,
    undoSubject
  }
}
