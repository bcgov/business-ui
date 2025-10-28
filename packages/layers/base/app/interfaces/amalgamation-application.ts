export interface AmalgamationApplication extends IncorporationApplication {
  amalgamatingBusinesses: unknown[]
  courtApproval: boolean
  type: AmalgamationType
  // ULC only:
  courtOrder?: CourtOrder
}
