import { z } from 'zod'

export const optionalOrEmptyString = z.string().optional()

export const getRequiredNonEmptyString = (message: string) => z.string().refine(e => e.trim() !== '', message)

export const getRequiredAddress = (
  streetMessage: string,
  cityMessage: string,
  regionMessage: string,
  postalCodeMessage: string,
  countryMessage: string
) => z.object({
  street: getRequiredNonEmptyString(streetMessage),
  streetAdditional: optionalOrEmptyString,
  city: getRequiredNonEmptyString(cityMessage),
  region: getRequiredNonEmptyString(regionMessage),
  postalCode: getRequiredNonEmptyString(postalCodeMessage),
  country: getRequiredNonEmptyString(countryMessage),
  locationDescription: optionalOrEmptyString
})
