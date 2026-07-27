export interface Resolution {
  date: string
  id?: number // may be undefined when loading a draft
  type?: string // may be undefined when loading a draft
  signatory?: Person
  signingDate?: string
}
