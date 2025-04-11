export interface Naics {
  naicsCode: string
  naicsDescription: string
}

export interface NaicsElement {
  classTitle: string
  code: string
  elementDescription: string
  elementType: string // "ALL_EXAMPLES" or "ILLUSTRATIVE_EXAMPLES"
  version: number
  year: number
}

export interface NaicsResult {
  classDefinition: string
  classTitle: string
  code: string
  naicsElements: Array<NaicsElement>
  naicsKey: string
  version: number
  year: number
}
