import { z } from 'zod'
import { merge } from 'es-toolkit'

export function getOfficeSchema() {
  return z.object({
    id: z.string(),
    isEditing: z.boolean(),
    actions: z.array(z.enum(ActionType)),
    type: z.enum(OfficeType),
    address: getAddressWithIdSchema()
  })
}

export type OfficeSchema = z.output<ReturnType<typeof getOfficeSchema>>

export function getActiveOfficeSchema() {
  return getOfficeSchema().nullable().optional()
}

export type ActiveOfficeSchema = z.output<ReturnType<typeof getActiveOfficeSchema>>

export function createDefaultOffice(
  overrides?: Partial<OfficeSchema>
): OfficeSchema {
  const defaults: OfficeSchema = {
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
