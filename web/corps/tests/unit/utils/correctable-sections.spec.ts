import { describe, it, expect } from 'vitest'

describe('getCorrectableSections', () => {
  const defaultSections = getCorrectableSections(FilingType.ALTERATION)

  it('returns the configured sections for a filing type', () => {
    expect(getCorrectableSections(FilingType.CHANGE_OF_ADDRESS)).toEqual([CorrectionSection.OFFICES])
  })

  it('returns the configured sections for a filing subtype', () => {
    expect(getCorrectableSections(FilingType.DISSOLUTION, DissolutionType.VOLUNTARY)).toEqual([
      CorrectionSection.CUSTODIANS,
      CorrectionSection.COURT_ORDERS
    ])
    expect(getCorrectableSections(FilingType.AMALGAMATION_APPLICATION, AmalgamationType.HORIZONTAL))
      .not.toContain(CorrectionSection.YOUR_COMPANY)
  })

  it('returns the regular amalgamation sections for an amalgamation with no subtype', () => {
    const regularSections = getCorrectableSections(FilingType.AMALGAMATION_APPLICATION, AmalgamationType.REGULAR)
    expect(getCorrectableSections(FilingType.AMALGAMATION_APPLICATION)).toEqual(regularSections)
    expect(getCorrectableSections(FilingType.AMALGAMATION_APPLICATION, '')).toEqual(regularSections)
    expect(regularSections).not.toContain(CorrectionSection.RECEIVERS)
    expect(regularSections).not.toContain(CorrectionSection.LIQUIDATORS)
  })

  it('returns no sections when there is nothing to correct', () => {
    expect(getCorrectableSections(FilingType.ANNUAL_REPORT)).toEqual([])
  })

  it('returns the default sections for a filing type that is not configured', () => {
    expect(defaultSections).toContain(CorrectionSection.DIRECTORS)
    expect(defaultSections).not.toContain(CorrectionSection.CUSTODIANS)
    expect(defaultSections).not.toContain(CorrectionSection.AMALGAMATION)
  })

  it('returns the filing type default sections for a filing subtype that is missing, empty or unknown', () => {
    expect(getCorrectableSections(FilingType.DISSOLUTION, DissolutionType.ADMINISTRATIVE)).toEqual(defaultSections)
    expect(getCorrectableSections(FilingType.DISSOLUTION)).toEqual(defaultSections)

    const receiverSections = getCorrectableSections(FilingType.CHANGE_OF_RECEIVERS, ReceiverType.APPOINT)
    expect(getCorrectableSections(FilingType.CHANGE_OF_RECEIVERS)).toEqual(receiverSections)
    expect(getCorrectableSections(FilingType.CHANGE_OF_RECEIVERS, 'unknown')).toEqual(receiverSections)

    const liquidatorSections = getCorrectableSections(FilingType.CHANGE_OF_LIQUIDATORS, LiquidateType.APPOINT)
    expect(getCorrectableSections(FilingType.CHANGE_OF_LIQUIDATORS, '')).toEqual(liquidatorSections)
  })
})
