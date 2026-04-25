// definitions pulled from https://github.com/bcgov/business-edit-ui/tree/main/src/resources/Correction
// add/update and move to base layer as necessary

// NB: Only CORRECT_NEW_NR can ever be the single option available
// if this changes the component will need to be updated
const correctNameOptions: Partial<Record<CorpTypeCd, Array<CorrectNameOption>>> = {
  [CorpTypeCd.BC_COMPANY]: [
    CorrectNameOption.CORRECT_NEW_NR,
    CorrectNameOption.CORRECT_NAME_TO_NUMBER,
    CorrectNameOption.CORRECT_NAME
  ],
  [CorpTypeCd.BENEFIT_COMPANY]: [
    CorrectNameOption.CORRECT_NEW_NR,
    CorrectNameOption.CORRECT_NAME_TO_NUMBER,
    CorrectNameOption.CORRECT_NAME
  ],
  [CorpTypeCd.CONTINUE_IN]: [
    CorrectNameOption.CORRECT_NEW_NR,
    CorrectNameOption.CORRECT_NAME_TO_NUMBER,
    CorrectNameOption.CORRECT_NAME
  ],
  [CorpTypeCd.BEN_CONTINUE_IN]: [
    CorrectNameOption.CORRECT_NEW_NR,
    CorrectNameOption.CORRECT_NAME_TO_NUMBER,
    CorrectNameOption.CORRECT_NAME
  ],
  [CorpTypeCd.BC_CCC]: [
    CorrectNameOption.CORRECT_NEW_NR,
    CorrectNameOption.CORRECT_NAME_TO_NUMBER,
    CorrectNameOption.CORRECT_NAME
  ],
  [CorpTypeCd.CCC_CONTINUE_IN]: [
    CorrectNameOption.CORRECT_NEW_NR,
    CorrectNameOption.CORRECT_NAME_TO_NUMBER,
    CorrectNameOption.CORRECT_NAME
  ],
  [CorpTypeCd.COOP]: [
    CorrectNameOption.CORRECT_NEW_NR
  ],
  [CorpTypeCd.ULC_CONTINUE_IN]: [
    CorrectNameOption.CORRECT_NEW_NR,
    CorrectNameOption.CORRECT_NAME_TO_NUMBER,
    CorrectNameOption.CORRECT_NAME
  ],
  [CorpTypeCd.PARTNERSHIP]: [
    CorrectNameOption.CORRECT_NEW_NR
  ],
  [CorpTypeCd.SOLE_PROP]: [
    CorrectNameOption.CORRECT_NEW_NR
  ],
  [CorpTypeCd.BC_ULC_COMPANY]: [
    CorrectNameOption.CORRECT_NEW_NR,
    CorrectNameOption.CORRECT_NAME_TO_NUMBER,
    CorrectNameOption.CORRECT_NAME
  ]
}

/**
 * Returns the available name correction options for a specific corporation type.
 * * @note This collection only includes options for specific corporation types 
 * (e.g., BC Companies and Benefit Companies). Not all types of {@link CorpTypeCd}.
 * * @param corpType - The corporation type code to look up.
 * @returns An array of {@link CorrectNameOption} if found, otherwise an empty array.
*/
export function getCorrectNameOptionsForCorpType(corpType: CorpTypeCd | undefined): CorrectNameOption[] {
  if (!corpType) {
    return []
  }
  return correctNameOptions[corpType] || []
}