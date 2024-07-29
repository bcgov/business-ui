export interface SbcCountry {
  name: string
  alpha_2: string // The 2-letter country code (ISO 3166-1)
}

export interface SbcAddress {
  country: SbcCountry
  line1: string
  line2?: string
  city: string
  region: string
  postalCode: string
  locationDescription?: string
}

export interface SbcCountrySubdivision {
  name: string
  code: string
}
