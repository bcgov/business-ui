import { z } from 'zod'

export function getManageOfficersSchema() {
  return z.object({
    parties: z.array(z.object({
      new: getPartySchema(),
      old: getPartySchema().optional()
    })),
    folio: getFolioSchema()
  })
}

export type ManageOfficersSchema = z.output<ReturnType<typeof getManageOfficersSchema>>

export function getOfficersSchema() {
  return z.object({
    activeParty: getActivePartySchema(),
    folio: getFolioSchema().default({ folioNumber: '' })
  })
}

export type OfficersFormSchema = z.output<ReturnType<typeof getOfficersSchema>>
