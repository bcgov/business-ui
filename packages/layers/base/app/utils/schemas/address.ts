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

/** The delivery / mailing address schemas when bcCanadaOnly is true (both addresses). */
function getAddressPairSchemas(options?: AddressSchemaOptions) {
  const base = getRequiredAddressSchema()
  const bcCanada = options?.bcCanadaOnly === true ? base.and(getBcCanadaRefinement()) : base
  return {
    deliveryAddress: bcCanada,
    mailingAddress: bcCanada
  }
}

interface AddressPairState {
  deliveryAddress: { country: string, region?: string }
  mailingAddress: { country: string, region?: string }
  sameAs: boolean
}

/**
 * Applies the bcCanadaOnly: 'delivery' rule. While 'same as' is checked the delivery inputs are hidden and mirror
 * the mailing address, so the errors are raised on the visible mailing inputs instead of the hidden delivery ones.
 */
function withDeliveryBcCanadaRule<T extends z.ZodType<AddressPairState>>(schema: T, options?: AddressSchemaOptions) {
  if (options?.bcCanadaOnly !== 'delivery') {
    return schema
  }
  const t = useNuxtApp().$i18n.t

  return schema.superRefine((data, ctx) => {
    const target = data.sameAs ? 'mailingAddress' : 'deliveryAddress'
    const prefix = data.sameAs ? 'validation.deliveryAddress' : 'validation.address'
    if (data[target].country !== 'CA') {
      ctx.addIssue({ code: 'custom', path: [target, 'country'], message: t(`${prefix}MustBeInCanada`) })
    }
    if (data[target].region !== 'BC') {
      ctx.addIssue({ code: 'custom', path: [target, 'region'], message: t(`${prefix}MustBeInBc`) })
    }
  })
}

export function getAddressSchema(options?: AddressSchemaOptions) {
  const { deliveryAddress, mailingAddress } = getAddressPairSchemas(options)

  return withDeliveryBcCanadaRule(z.object({
    deliveryAddress,
    mailingAddress,
    sameAs: z.boolean()
  }), options)
}

export type AddressSchema = z.output<ReturnType<typeof getAddressSchema>>

export type AddressFormRef = InstanceType<typeof FormAddress>

export function getAddressWithIdSchema(options?: AddressSchemaOptions) {
  const { deliveryAddress, mailingAddress } = getAddressPairSchemas(options)
  const idSchema = z.object({
    id: z.string().optional()
  })

  return withDeliveryBcCanadaRule(z.object({
    deliveryAddress: deliveryAddress.and(idSchema),
    mailingAddress: mailingAddress.and(idSchema),
    sameAs: z.boolean()
  }), options)
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
