/**
 * See:
 * https://github.com/bcgov/business-schemas/blob/master/src/registry_schemas/schemas/share_structure.json
*/
export interface ShareSeries {
  id: number
  name: string
  priority: number
  hasMaximumShares: boolean
  maxNumberOfShares: number | null
  hasRightsOrRestrictions: boolean
}

export interface ShareClass extends ShareSeries {
  hasParValue: boolean
  parValue: number | null
  currency: string | null | undefined
  series: ShareSeries[]
}

export type ShareClassesResponse = { shareClasses: ShareClass[] } | { shareClass: ShareClass }

// Still needed?
// export interface ShareStructure {
//   resolutionDates?: string[]
//   valid?: boolean
//   changed?: boolean
//   shareClasses: ShareClass[]
// }
