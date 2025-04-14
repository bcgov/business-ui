/** Interface for auth information object. */
export interface AuthInformation {
  affiliations: Array<{
    created: string // datetime
    id: number
  }>
  businessIdentifier: string
  contacts: ContactPoint[]
  corpType: {
    code: CorpTypeCd
    default: boolean
    desc: string
  }
  created: string // datetime
  modified: string // datetime
  name: string
  passCodeClaimed: boolean
  // folioNumber?: string // include?
}
