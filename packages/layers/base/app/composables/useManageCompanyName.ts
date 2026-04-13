type CompanyNameState = {
  new: {
    legalName: string,
    actions: ActionType[]
  },
  old: {
    legalName: string,
    actions: ActionType[]
  }
}

const defaultState: CompanyNameState = {
  new: {
    legalName: '',
    actions: []
  },
  old: {
    legalName: '',
    actions: []
  }
}

// interface NameRequestIF {
//   applicants: NrApplicantIF // object not array
//   consentFlag: string // R, N, Y or null
//   corpNum?: string // eg, "BC1234567"
//   expirationDate: ApiDateTimeUtc
//   furnished: string // eg, "Y"
//   legalType: CorpTypeCd
//   names: Array<NrNameIF>
//   nrNum: string // eg, "NR 1234567"
//   priorityCd: string // eg, "N"
//   requestTypeCd: NrRequestTypeCodes
//   request_action_cd: NrRequestActionCodes // eslint-disable-line camelcase
//   state: NameRequestStates
// }

// nameRequest?: NameRequestIF & { legalName: string, nrNumber?: string }

// QUESTION: do i need to include legal type in the name request correction????
// only include if theres a nrNumber submitted as well?

// 'nameRequest': {
//     'legalType': 'BC',
//     'legalName': 'legal name change - BC1234567'
// },

// 'nameRequest': {
//     'nrNumber': 'NR 8798956',
//     'legalName': 'HAULER MEDIA INC.',
//     'legalType': 'GP'
// },

// 'nameRequest': {
//     'nrNumber': 'NR 8798956',
//     'legalName': 'HAULER MEDIA INC.',
//     'legalType': 'GP'
// },

export const useManageCompanyName = (stateKey: string = 'manage-company-name') => {
  const state = useState<CompanyNameState>(`${stateKey}-state`, () => defaultState)

  function updateState(newName: string): void {
    if (state.value.new.legalName !== newName.trim()) {
      state.value.new.legalName = newName
      state.value.new.actions = [ActionType.CORRECTED]
    }
  }

  function undoState(): void {
    state.value.new.legalName = state.value.old.legalName
    state.value.new.actions = []
  }

  return {
    state,
    updateState,
    undoState
  }
}
