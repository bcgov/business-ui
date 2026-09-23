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
  const service = useBusinessService()
  const { t } = useNuxtApp().$i18n

  const state = useState<ManageYourCompanyState>(`${stateKey}-state`, () => defaultState)
  const nrData = useState<NameRequest | undefined>(`${stateKey}-nrData`, () => undefined)

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
    const newSubject = state.value.new[key] as ManageYourCompanyFieldState<any> | undefined
    const oldSubject = state.value.old[key] as ManageYourCompanyFieldState<any> | undefined

    if (!newSubject) {
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

  // fetch the nr data to display in the UI when the nrNumber is populated
  watch(
    () => state.value.new.nrNumber?.value,
    async (v) => {
      const nrNum = v?.trim()
      if (!nrNum) {
        nrData.value = undefined
      } else {
        nrData.value = await service.getLinkedNameRequest(nrNum).catch(() => undefined)
      }
    }
  )

  const nrDetails = computed(() => {
    const data = nrData.value
    if (!data) {
      return undefined
    }
    return {
      meta: {
        legalName: state.value.new.nameRequest?.value!.legalName,
        nrNumber: state.value.new.nrNumber
      },
      info: [
        { label: 'Business Type', value: getCorpFullDescription(data.legalType) },
        { label: 'Request Type', value: t(`nameRequestAction.${data.request_action_cd}`) },
        { label: 'Expiry Date', value: toReadableDate(data.expirationDate) },
        { label: 'Status', value: t(`nameRequestState.${data.state}`) }
      ]
    }
  })

  return {
    state,
    nrData,
    nrDetails,
    hasChanges,
    // updateState,
    // undoState,
    editSubject,
    undoSubject
  }
}
