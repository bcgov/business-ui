export interface Series {
    currency: string | null
    hasMaximumShares: boolean
    hasParValue: boolean
    hasRightsOrRestrictions: boolean
    id: number
    maxNumberOfShares: number | null
    name: string
    parValue: number | null
    priority: number,
}

export interface Share extends Series {
    series: Series[]
}