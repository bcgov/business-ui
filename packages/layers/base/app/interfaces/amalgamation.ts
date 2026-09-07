interface AmalBusinessBase {
  id: number
  identifier: string
  legalName: string
  role: string // amalgamating | primary | ???
}

interface AmalBusinessBC extends AmalBusinessBase {
  legalType: CorpTypeCd
  mailingAddress: ApiAddress
}

interface AmalBusinessExBC extends AmalBusinessBase {
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