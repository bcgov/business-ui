import { z } from 'zod'

function getAddressChangeBaseSchema() {
  return z.object({
    activeOffice: getActiveOfficesSchema(),
    authorization: getConfirmAuthorizationSchema().default(() => ({ isAuthorized: false as unknown as true }))
  })
}

/**
 * The address change full form state.
 */
export function getAddressChangeSchema(isStaff: boolean) {
  return withPaymentSection(getAddressChangeBaseSchema(), isStaff)
}

export type AddressChangeFormSchema = WithPaymentSections<ReturnType<typeof getAddressChangeBaseSchema>>
