import { z } from 'zod'
import { merge } from 'es-toolkit'

export function getOfficesSchema() {
  return z.object({
    id: z.string(),
    isEditing: z.boolean(),
    actions: z.array(z.enum(ActionType)),
    type: z.enum(OfficeType),
    address: getAddressWithIdSchema()
  })
}

export type OfficesSchema = z.output<ReturnType<typeof getOfficesSchema>>

export function getActiveOfficesSchema() {
  return getOfficesSchema().nullable().optional()
}

export type ActiveOfficesSchema = z.output<ReturnType<typeof getActiveOfficesSchema>>

export function createDefaultOffice(
  overrides?: Partial<OfficesSchema>
): OfficesSchema {
  const defaults: OfficesSchema = {
    id: crypto.randomUUID(),
    isEditing: false,
    actions: [],
    type: OfficeType.REGISTERED,
    address: createDefaultAddress()
  }

  if (!overrides) {
    return defaults
  }

  return merge(defaults, overrides)
}
