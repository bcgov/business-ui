export interface NamexResult {
  names: string[]
  nrNum: string
  disabled?: boolean
}

export interface ManageNameRequestEvent {
  names: string[]
  nrNum: string
}
