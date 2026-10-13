import { z } from 'zod'

function getDirectorChangeBaseSchema() {
  return z.object({
    activeParty: getActivePartySchema(RoleTypeUi.DIRECTOR),
    authorization: getConfirmAuthorizationSchema().default(() => ({ isAuthorized: false as unknown as true }))
  })
}

/**
 * The director change full form state.
 */
export function getDirectorChangeSchema(isStaff: boolean) {
  return withPaymentSection(getDirectorChangeBaseSchema(), isStaff)
}

export type DirectorChangeFormSchema = WithPaymentSections<ReturnType<typeof getDirectorChangeBaseSchema>>
