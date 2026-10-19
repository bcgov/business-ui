import { z } from 'zod'

/** NB: `activeParty` holds the director row currently open in the party sub form. */
function getAuthorizationBaseSchema() {
  return z.object({
    activeParty: getActivePartySchema(RoleTypeUi.DIRECTOR),
    authorization: getConfirmAuthorizationSchema().default(() => ({ isAuthorized: false as unknown as true }))
  })
}

/** Director change full form state - shaped by the staff flag and the legal type's certify convention. */
export function getDirectorsSchema(isStaff: boolean, certify: DirectorsConfig['certify']) {
  if (certify === 'authorization') {
    return withPaymentSection(getAuthorizationBaseSchema(), isStaff)
  }
  return withPaymentSection(
    getAuthorizationBaseSchema().omit({ authorization: true }).extend({
      certify: getCertifySchema().default(() => ({ isCertified: false }))
    }),
    isStaff
  )
}

/** The full superset — `authorization` is corps-only; `certify` is coops-only. */
export type DirectorsFormSchema
  = WithPaymentSections<ReturnType<typeof getAuthorizationBaseSchema>>
    & Partial<{ certify: CertifySchema }>
