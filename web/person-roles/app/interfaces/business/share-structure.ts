/**
 * See:
 * https://github.com/bcgov/business-schemas/blob/master/src/registry_schemas/schemas/share_structure.json
 */
export interface ShareClass {
  id: string
  type?: string // Indicates whether class or series
  name: string
  priority: number
  hasMaximumShares?: boolean
  maxNumberOfShares: number
  hasParValue?: boolean
  parValue?: number
  currency?: string
  hasRightsOrRestrictions: boolean
  series?: ShareClass[]
  action?: ActionType // Local state indicates corrected/added/removed
}

export interface ShareStructure {
  resolutionDates?: string[]
  valid?: boolean
  changed?: boolean
  shareClasses: ShareClass[]
}
