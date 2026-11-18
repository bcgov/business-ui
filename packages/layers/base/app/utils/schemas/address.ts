import type { FormAddress } from '#components'
import { z } from 'zod'

export interface AddressSchemaOptions {
  /** true = both addresses must be in BC, Canada; 'delivery' = the delivery address only (mailing may be anywhere) */
  bcCanadaOnly?: boolean | 'delivery'
  /** the delivery address street cannot be a PO Box (off by default, only review imported data asks for it) */
  noPoBox?: boolean
}

// matches 'PO Box', 'P.O. Box' and 'Post Office Box' anywhere in the street
const PO_BOX_REGEX = /\b(?:p\.?\s*o\.?|post\s+office)\s*box\b/i

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
  deliveryAddress: { street: string, country: string, region?: string }
  mailingAddress: { street: string, country: string, region?: string }
  sameAs: boolean
}

/**
 * Applies the delivery-only rules (bcCanadaOnly: 'delivery', noPoBox). While 'same as' is checked the delivery
 * address is the mailing address, so that is what gets checked - the errors still go on the delivery inputs,
 * and FormAddress unchecks 'same as' to show them.
 */
function withDeliveryRules<T extends z.ZodType<AddressPairState>>(schema: T, options?: AddressSchemaOptions) {
  const bcCanadaDelivery = options?.bcCanadaOnly === 'delivery'
  if (!bcCanadaDelivery && !options?.noPoBox) {
    return schema
  }
  const t = useNuxtApp().$i18n.t

  return schema.superRefine((data, ctx) => {
    const delivery = data.sameAs ? data.mailingAddress : data.deliveryAddress
    const addIssue = (field: string, message: string) =>
      ctx.addIssue({ code: 'custom', path: ['deliveryAddress', field], message: t(message) })
    if (bcCanadaDelivery) {
      if (delivery.country !== 'CA') {
        addIssue('country', 'validation.addressMustBeInCanada')
      }
      if (delivery.region !== 'BC') {
        addIssue('region', 'validation.addressMustBeInBc')
      }
    }
    if (options?.noPoBox && PO_BOX_REGEX.test(delivery.street)) {
      addIssue('street', 'validation.addressCannotBePoBox')
    }
  })
}

export function getAddressSchema(options?: AddressSchemaOptions) {
  const { deliveryAddress, mailingAddress } = getAddressPairSchemas(options)

  return withDeliveryRules(z.object({
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

  return withDeliveryRules(z.object({
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

/**
 * Validates the address pair and drops the errors on disabled inputs - the user cannot fix those,
 * so they must not block the form (e.g. review imported data only unlocks the fields flagged as missing).
 */
export function getEditableAddressErrors(
  schema: z.ZodType,
  state: unknown,
  disabledFields: AddressFormProps['disabledFields'] = {}
): { name: string, message: string }[] {
  const result = schema.safeParse(state)
  if (result.success) {
    return []
  }
  const disabled = new Set(
    (['mailingAddress', 'deliveryAddress'] as const)
      .flatMap(address => (disabledFields[address] ?? []).map(field => `${address}.${field}`))
  )
  return result.error.issues
    .map(issue => ({ name: issue.path.join('.'), message: issue.message }))
    .filter(error => !disabled.has(error.name))
}
