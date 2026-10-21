import type { FormAddress } from '#components'
import { z } from 'zod'

export interface AddressSchemaOptions {
  /** true = both addresses must be in BC, Canada; 'delivery' = the delivery address only (mailing may be anywhere) */
  bcCanadaOnly?: boolean | 'delivery'
}

// intersected onto the base address schema when bcCanadaOnly is set
function getBcCanadaRefinement() {
  const t = useNuxtApp().$i18n.t

  return z.object({
    country: z.string().refine(v => v === 'CA', t('validation.addressMustBeInCanada')),
    region: z.string().optional().refine(v => v === 'BC', t('validation.addressMustBeInBc'))
  })
}

/** The delivery / mailing address schemas for the bcCanadaOnly option. */
function getAddressPairSchemas(options?: AddressSchemaOptions) {
  const base = getRequiredAddressSchema()
  const bcCanada = options?.bcCanadaOnly ? base.and(getBcCanadaRefinement()) : base
  return {
    deliveryAddress: bcCanada,
    mailingAddress: options?.bcCanadaOnly === true ? bcCanada : base
  }
}

export function getAddressSchema(options?: AddressSchemaOptions) {
  const { deliveryAddress, mailingAddress } = getAddressPairSchemas(options)

  return z.object({
    deliveryAddress,
    mailingAddress,
    sameAs: z.boolean()
  })
}

export type AddressSchema = z.output<ReturnType<typeof getAddressSchema>>

export type AddressFormRef = InstanceType<typeof FormAddress>

export function getAddressWithIdSchema(options?: AddressSchemaOptions) {
  const { deliveryAddress, mailingAddress } = getAddressPairSchemas(options)
  const idSchema = z.object({
    id: z.string().optional()
  })

  return z.object({
    deliveryAddress: deliveryAddress.and(idSchema),
    mailingAddress: mailingAddress.and(idSchema),
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
