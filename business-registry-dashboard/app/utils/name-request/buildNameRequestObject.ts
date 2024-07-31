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
