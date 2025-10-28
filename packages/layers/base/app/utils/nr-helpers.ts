/** Returns the Name Request's approved name (or undefined or null if not found). */
export const getNrApprovedName = (nameRequest: NameRequest): string | undefined => {
  if (nameRequest?.names?.length > 0) {
    return nameRequest.names
      .find(name => [NameRequestState.APPROVED, NameRequestState.CONDITION].includes(name.state))?.name
  }
  // should never get here
}

/** Returns error message if the Name Request data is invalid. */
export const isNrInvalid = (nameRequest: NameRequest): string | undefined => {
  if (!nameRequest) {
    return 'Invalid NR object'
  }
  if (!nameRequest.applicants) {
    return 'Invalid NR applicants'
  }
  if (!nameRequest.expirationDate) {
    return 'Invalid NR expiration date'
  }
  if (!nameRequest.legalType) {
    return 'Invalid NR legal type'
  }
  if (!getNrApprovedName(nameRequest)) {
    return 'Invalid NR approved name'
  }
  if (!nameRequest.nrNum) {
    return 'Invalid NR number'
  }
  if (![
    NrRequestActionCode.NEW_BUSINESS,
    NrRequestActionCode.AMALGAMATE,
    NrRequestActionCode.MOVE].includes(nameRequest.request_action_cd)
  ) {
    return 'Invalid NR action code'
  }
  if (!nameRequest.state) {
    return 'Invalid NR state'
  }
}

/** Returns the Name Request's state */
export const getNrState = (nameRequest: NameRequest): NameRequestState => {
  // If the NR is awaiting consent, it is not consumable.
  // null = consent not required
  // R = consent received
  // N = consent waived
  // Y = consent required
  if (
    nameRequest.state === NameRequestState.CONDITIONAL
    && nameRequest.consentFlag !== null
    && nameRequest.consentFlag !== 'R'
    && nameRequest.consentFlag !== 'N'
  ) {
    return NameRequestState.NEED_CONSENT
  }

  // If the NR's root state is not APPROVED / CONDITIONAL / EXPIRED / CONSUMED, it is not consumable.
  if (![
    NameRequestState.APPROVED,
    NameRequestState.CONDITIONAL,
    NameRequestState.EXPIRED,
    NameRequestState.CONSUMED].includes(nameRequest.state)
  ) {
    return NameRequestState.NOT_APPROVED
  }

  // Otherwise, the NR is consumable.
  return nameRequest.state // APPROVED or CONDITIONAL or CONSUMED or EXPIRED
}
