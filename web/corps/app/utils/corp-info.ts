// Authorization is only required for Corporations
export const CORPS: CorpTypeCd[] = [
  CorpTypeCd.BENEFIT_COMPANY,
  CorpTypeCd.BC_COMPANY,
  CorpTypeCd.BC_CCC,
  CorpTypeCd.BC_ULC_COMPANY,
  CorpTypeCd.BEN_CONTINUE_IN,
  CorpTypeCd.CONTINUE_IN,
  CorpTypeCd.CCC_CONTINUE_IN,
  CorpTypeCd.ULC_CONTINUE_IN
]

export function getLegalTypeDescription(legalType?: string | null): string {
  if (!legalType) {
    return ''
  }

  const fullDescription = getCorpFullDescription(legalType as CorpTypeCd)
  return fullDescription ? fullDescription : legalType
}
