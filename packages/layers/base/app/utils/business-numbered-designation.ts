/** Get the numbered name designation */
export const getNumberedDesignation = (corpType: CorpTypeCd): string => {
  // DISUSS in PR: could put this in lang file, but these shouldn't get translated (would be a bug if they did)
  if (
    corpType === CorpTypeCd.BC_ULC_COMPANY
    || corpType === CorpTypeCd.ULC_CONTINUE_IN
  ) {
    return 'UNLIMITED LIABILITY COMPANY'
  }
  if (
    corpType === CorpTypeCd.BC_CCC
    || corpType === CorpTypeCd.CCC_CONTINUE_IN
  ) {
    return 'COMMUNITY CONTRIBUTION COMPANY LTD.'
  }
  if (
    corpType === CorpTypeCd.BC_COMPANY
    || corpType === CorpTypeCd.CONTINUE_IN
    || corpType === CorpTypeCd.BENEFIT_COMPANY
    || corpType === CorpTypeCd.BEN_CONTINUE_IN) {
    return 'LTD.'
  }
  // should never happen
  return 'LTD.'
}
