import type { FormAddress } from '#components'
import { z } from 'zod'

export function getAddressSchema() {
  const reqSchema = getRequiredAddressSchema()

  return z.object({
    deliveryAddress: reqSchema,
    mailingAddress: reqSchema,
    sameAs: z.boolean()
  })
}

export type AddressSchema = z.output<ReturnType<typeof getAddressSchema>>

export type AddressFormRef = InstanceType<typeof FormAddress>
