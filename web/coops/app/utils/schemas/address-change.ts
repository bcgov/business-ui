import { z } from 'zod'

/**
 * FUTURE: add registered office ManageOffices section (bcCanadaOnly addresses) and the
 * certify (base FormCertify) section.
 * NB: `activeOffice` holds the office currently open in the office address sub form.
 */
function getBaseSchema() {
  return z.object({
    activeOffice: getActiveOfficesSchema()
  })
}

/**
 * Coop change of address full form schema.
 */
export function getCoopAddressChangeSchema(isStaff: boolean) {
  return withPaymentSection(getBaseSchema(), isStaff)
}

export type CoopAddressChangeSchema = WithPaymentSections<ReturnType<typeof getBaseSchema>>
