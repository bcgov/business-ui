interface AmalBusinessBase {
  id?: number // may be undefined when loading a draft
  identifier: string
  legalName: string
  role: string // amalgamating | primary | ???
}

export interface AmalBusinessBC extends AmalBusinessBase {
  legalType: CorpTypeCd
  mailingAddress: ApiAddress
}

export interface AmalBusinessExBC extends AmalBusinessBase {
  foreignJurisdiction: {
    country: string
    region: string | null
  }
}

// TODO/FUTURE - Update as required
export interface Amalgamation {
  amalgamatingBusinesses: Array<AmalBusinessBC | AmalBusinessExBC>
  courtApproval: boolean
}
