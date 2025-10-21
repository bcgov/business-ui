/** Incorporation Application filing loaded from / saved to the Legal API. */
export interface IncorporationApplication {
  nameRequest: NameRequestFilingData
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
