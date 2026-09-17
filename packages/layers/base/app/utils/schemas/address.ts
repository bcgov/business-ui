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

export function getAddressWithIdSchema() {
  const reqSchema = getRequiredAddressSchema()
  const reqWithIdSchema = reqSchema.and(
    z.object({
      id: z.string().optional()
    })
  )

  return z.object({
    deliveryAddress: reqWithIdSchema,
    mailingAddress: reqWithIdSchema,
    sameAs: z.boolean()
  })
}

export type AddressWithIdSchema = z.output<ReturnType<typeof getAddressWithIdSchema>>

export function createDefaultAddress(): AddressWithIdSchema {
  return {
    deliveryAddress: {
      id: crypto.randomUUID(),
      street: '',
      streetAdditional: '',
      city: '',
      region: '',
      postalCode: '',
      country: '',
      locationDescription: ''
    },
    mailingAddress: {
      id: crypto.randomUUID(),
      street: '',
      streetAdditional: '',
      city: '',
      region: '',
      postalCode: '',
      country: '',
      locationDescription: ''
    },
    sameAs: false
  }
}
