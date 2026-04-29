export interface ManageCompanyNameState {
  new: {
    legalName: string
    nrNumber?: string
    actions: ActionType[]
  }
  old: {
    legalName: string
    nrNumber?: string
    actions: ActionType[]
  }
}
