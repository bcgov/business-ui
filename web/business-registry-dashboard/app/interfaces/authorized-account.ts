/** An account that has access to view and manage a business, as shown on the View Access screen. */
export interface AuthorizedAccount {
  name: string
  uuid: string
  dateAdded: string
  /** Present on premium accounts that are set up as a branch. */
  branchName?: string
  /** True when the account belongs to an organization rather than an individual. */
  isBusinessAccount?: boolean
}

export interface AuthorizedAccountsResponse {
  authorizedAccounts: AuthorizedAccount[]
}
