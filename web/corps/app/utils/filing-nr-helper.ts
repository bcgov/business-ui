/* The allowed nr action codes by filing. */
export const FILING_NR_ALLOWED_ACTIONS = {
  // FUTURE: #32698 - use this in corrections filing and pass in to the NameRequestNumber component prop
  // FUTURE: add to this as needed
  [FilingType.ALTERATION]: [
    NrRequestActionCode.CHANGE_NAME,
    NrRequestActionCode.CONVERSION
  ],
  [FilingType.CORRECTION]: [
    NrRequestActionCode.CHANGE_NAME
  ],
  [FilingType.CONTINUATION_IN]: [
    NrRequestActionCode.MOVE
  ],
  [FilingType.RESTORATION]: {
    [FilingSubType.LIMITED_RESTORATION_TO_FULL]: [
      NrRequestActionCode.CHANGE_NAME,
      NrRequestActionCode.RESTORE
    ],
    [FilingSubType.LIMITED_RESTORATION_EXTENSION]: [],
    [FilingSubType.LIMITED_RESTORATION]: [
      NrRequestActionCode.NEW_BUSINESS,
      NrRequestActionCode.RESTORE
    ],
    [FilingSubType.FULL_RESTORATION]: [
      NrRequestActionCode.NEW_BUSINESS,
      NrRequestActionCode.RESTORE
    ]
  }
}
