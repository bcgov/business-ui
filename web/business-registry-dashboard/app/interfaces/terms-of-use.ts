export interface TOSPatchResponse {
  isTermsOfUseAccepted: boolean
  termsOfUseAcceptedVersion: string
}

export interface TOSGetResponse {
  isTermsOfUseAccepted: boolean
  termsOfUseAcceptedVersion: string | null
  termsOfUseCurrentVersion: string
  termsOfUse: string
}
