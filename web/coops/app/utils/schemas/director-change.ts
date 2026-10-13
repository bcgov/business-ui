import { z } from 'zod'

/**
 * FUTURE: add the effective date, the directors table and the certify (base FormCertify) section.
 * NB: `activeParty` holds the director row currently open in the party sub form.
 */
function getBaseSchema() {
  return z.object({
    activeParty: getActivePartySchema(RoleTypeUi.DIRECTOR)
  })
}

/**
 * Coop change of directors form schema.
 */
export function getCoopDirectorChangeSchema(isStaff: boolean) {
  return withPaymentSection(getBaseSchema(), isStaff)
}

export type CoopDirectorChangeSchema = WithPaymentSections<ReturnType<typeof getBaseSchema>>
