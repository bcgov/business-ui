import { NrRequestActionCodes, NrRequestTypeCodes } from '@bcrs-shared-components/enums'

/** use NR request action code to get NR type from enum */
export function mapRequestActionCdToNrType (requestActionCd: NrRequestActionCodes): string {
  // Can add other NrRequestActionCodes here to use the action code instead of the NrRequestTypeCd.
  // Must ensure that the action code does not have several potential types
  // Example: the NEW action code can be for Incorporation or Registration, so we cannot use it for the NR type
  if (requestActionCd === NrRequestActionCodes.AMALGAMATE) { return 'Amalgamation' }
  return ''
}

/** use NR request type code to get NR type from enum */
export function mapRequestTypeCdToNrType (requestTypeCd: NrRequestTypeCodes): string {
  return NrRequestTypeStrings[requestTypeCd] as string // TODO: fix ts error
}

// TODO: add launch darkly
/* Internal function to build the namerequest object. */
export function buildNameRequestObject (nr: NameRequestResponse) {
  // const enableBcCccUlc = LaunchDarklyService.getFlag(LDFlags.EnableBcCccUlc) || false
  const enableBcCccUlc = false

  /** Returns True if NR has applicants for registration. */
  const isApplicantsExist = (nr: NameRequestResponse): boolean => {
    if (nr.applicants) {
      return nr.applicants && nr.applicants.length > 0
    } else {
      return false
    }
  }

  // TODO: fix to not return undefined?
  /** Returns target conditionally. */
  const getTarget = (nr: NameRequestResponse): NrTargetTypes | undefined => {
    const bcCorpTypes = [CorpTypes.BC_CCC, CorpTypes.BC_COMPANY, CorpTypes.BC_ULC_COMPANY]
    if (bcCorpTypes.includes(nr.legalType)) {
      // if FF is enabled then route to LEAR, else route to COLIN
      return enableBcCccUlc ? NrTargetTypes.LEAR : NrTargetTypes.COLIN
    }
    return nr.target
  }

  /** Returns True if NR is conditionally approved. NB: consent flag=null means "not required". */
  const isConditionallyApproved = (nr: NameRequestResponse): boolean => (
    nr.stateCd === NrState.CONDITIONAL && (
      nr.consentFlag === null ||
      nr.consentFlag === NrConditionalStates.RECEIVED ||
      nr.consentFlag === NrConditionalStates.WAIVED
    )
  )

  /** Returns True if NR is approved. */
  const isApproved = (nr: NameRequestResponse): boolean => (nr.stateCd === NrState.APPROVED)

  /** Returns True if NR is approved for incorporation or registration. */
  const isApprovedForIaOrRegistration = (nr: NameRequestResponse): boolean => (
    (isApproved(nr) || isConditionallyApproved(nr)) &&
  ((nr.actions?.some(action => action.filingName === LearFilingTypes.INCORPORATION) ?? false) ||
   (nr.actions?.some(action => action.filingName === LearFilingTypes.REGISTRATION) ?? false))
  )

  return {
    actions: nr.actions,
    names: nr.names,
    id: nr.id,
    legalType: nr.legalType,
    nrNumber: nr.nrNum,
    state: nr.stateCd,
    applicantEmail: isApplicantsExist(nr) ? nr.applicants?.[0]?.emailAddress ?? null : null,
    applicantPhone: isApplicantsExist(nr) ? nr.applicants?.[0]?.phoneNumber ?? null : null,
    enableIncorporation: isApprovedForIaOrRegistration(nr),
    folioNumber: nr.folioNumber,
    target: getTarget(nr),
    entityTypeCd: nr.entityTypeCd,
    requestTypeCd: nr.requestTypeCd,
    requestActionCd: nr.requestActionCd,
    natureOfBusiness: nr.natureBusinessInfo,
    expirationDate: nr.expirationDate,
    applicants: nr.applicants,
    corpNum: nr.corpNum
  }
}

/* returns true if given name is approved */
export const isApprovedName = (name: Names): boolean => {
  return (name.state === NrState.APPROVED)
}

/* returns true if the given name request is rejected */
export const isRejectedName = (name: Names): boolean => {
  return (name.state === NrState.REJECTED)
}

/** Returns true if the affiliation is a Name Request. */
export const isNameRequest = (business: Business): boolean => {
  return (business.corpType?.code === CorpTypes.NAME_REQUEST && !!business.nameRequest)
}
