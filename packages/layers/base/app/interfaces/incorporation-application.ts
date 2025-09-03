/** Incorporation Application filing loaded from / saved to the Legal API. */
export interface IncorporationApplication {
  nameRequest: {
    legalType: string
    nrNumber?: string // only set when there is an NR
    legalName?: string // only set when there is an NR
  }
  nameTranslations: NameTranslation[]
  offices: IncorporationAddress | object
  contactPoint: {
    email: string
    phone: string
    extension: string
  }
  parties: unknown[]
  shareStructure: {
    shareClasses: ShareClass[]
  }
  incorporationAgreement: {
    agreementType: string
  }
}
