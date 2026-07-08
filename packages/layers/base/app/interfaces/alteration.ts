/**
 * A filing's alteration object from the API. See:
 * https://github.com/bcgov/business-schemas/blob/master/src/registry_schemas/schemas/alteration.json
 */

export interface Alteration {
  provisionsRemoved: boolean
  business: BusinessData
  nameRequest?: NameRequest
  nameTranslations: NameTranslation[]
  shareStructure: {
    shareClasses: ShareClass
    resolutionDates: string[]
  }
  contactPoint: ContactPoint
  courtOrder: CourtOrder
  cooperativeAssociationType?: AssociationType
  rulesFileKey?: string
  rulesFileName?: string
  memorandumFileKey?: string
  memorandumFileName?: string
}
