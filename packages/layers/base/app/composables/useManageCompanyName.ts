import { cloneDeep } from 'es-toolkit'

const defaultState: ManageCompanyNameState = {
  new: {
    legalName: '',
    actions: []
  },
  old: {
    legalName: '',
    actions: []
  }
}

// nameRequest?: NameRequestIF & { legalName: string, nrNumber?: string }

// QUESTION: do i need to include legal type in the name request correction????
// only include if theres a nrNumber submitted as well?

// 'nameRequest': {
//     'legalType': 'BC',
//     'legalName': 'legal name change - BC1234567'
// }

export const useManageCompanyName = (stateKey: string = 'manage-company-name') => {
  const service = useBusinessService()
  const { t } = useNuxtApp().$i18n

  const state = useState<ManageCompanyNameState>(`${stateKey}-state`, () => defaultState)
  const nrData = useState<NameRequest | undefined>(`${stateKey}-nrData`, () => undefined)

  const hasNameChange = computed(() => {
    return state.value.old.legalName !== state.value.new.legalName
      && !!state.value.new.legalName.trim()
  })

  function updateState(data: ActiveNameRequestSchema) {
    const name = data?.legalName.trim()

    if (!name) {
      return
    }

    state.value.new.legalName = name
    state.value.new.nrNumber = data?.nrNumber

    state.value.new.actions = name !== state.value.old.legalName
      ? [ActionType.CORRECTED]
      : []
  }

  function undoState() {
    state.value.new = cloneDeep(state.value.old)
  }

  // fetch the nr data to display in the UI when the nrNumber is populated
  watch(
    () => state.value.new.nrNumber,
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
        legalName: state.value.new.legalName,
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
    hasNameChange,
    updateState,
    undoState
  }
}
