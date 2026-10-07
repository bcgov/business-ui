import type { FormAddress } from '#components'
import { z } from 'zod'

export interface AddressSchemaOptions {
  bcCanadaOnly?: boolean
}

// intersected onto the base address schema when bcCanadaOnly is set
function getBcCanadaRefinement() {
  const t = useNuxtApp().$i18n.t

  return z.object({
    country: z.string().refine(v => v === 'CA', t('validation.addressMustBeInCanada')),
    region: z.string().optional().refine(v => v === 'BC', t('validation.addressMustBeInBc'))
  })
}

export function getAddressSchema(options?: AddressSchemaOptions) {
  const reqSchema = options?.bcCanadaOnly
    ? getRequiredAddressSchema().and(getBcCanadaRefinement())
    : getRequiredAddressSchema()

  return z.object({
    deliveryAddress: reqSchema,
    mailingAddress: reqSchema,
    sameAs: z.boolean()
  })
}

export type AddressSchema = z.output<ReturnType<typeof getAddressSchema>>

export type AddressFormRef = InstanceType<typeof FormAddress>

export function getAddressWithIdSchema(options?: AddressSchemaOptions) {
  const reqSchema = options?.bcCanadaOnly
    ? getRequiredAddressSchema().and(getBcCanadaRefinement())
    : getRequiredAddressSchema()
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
      country: 'CA',
      locationDescription: ''
    },
    mailingAddress: {
      id: crypto.randomUUID(),
      street: '',
      streetAdditional: '',
      city: '',
      region: '',
      postalCode: '',
      country: 'CA',
      locationDescription: ''
    },
    sameAs: false
  }
}
