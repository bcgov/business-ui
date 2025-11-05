import { z } from 'zod'

export function getAddressSchema() {
  const reqSchema = getRequiredAddressSchema()
  const nonReqSchema = getNonRequiredAddressSchema()

  return z.object({
    deliveryAddress: reqSchema,
    mailingAddress: nonReqSchema,
    sameAs: z.boolean()
  })
}

export type AddressSchema = z.output<ReturnType<typeof getAddressSchema>>
