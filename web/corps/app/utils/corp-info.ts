export function getLegalTypeDescription(legalType?: string | null): string {
  if (!legalType) {
    return ''
  }

  const fullDescription = getCorpFullDescription(legalType as CorpTypeCd)
  if (fullDescription) return fullDescription
  return legalType
}