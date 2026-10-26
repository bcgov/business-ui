// @vitest-environment node
import { describe, it, expect } from 'vitest'

describe('getYourCompanyFieldOverrides', () => {
  const defaults = {
    nameNewJurisdiction: 'hide',
    namePreviousJurisdiction: 'hide',
    numberExpro: 'hide',
    numberPreviousJurisdiction: 'hide',
    outDate: 'hide',
    jurisdiction: 'readonly',
    previousJurisdiction: 'hide',
    newJurisdiction: 'hide',
    nameRequest: 'readonly',
    legalType: 'readonly',
    nameTranslations: 'hide',
    foundingDate: 'readonly',
    contactInfo: 'readonly'
  } as const

  const filingTypeCases: Array<[FilingType, Record<string, string>]> = [
    [
      FilingType.INCORPORATION_APPLICATION,
      {
        ...defaults,
        nameRequest: 'default',
        nameTranslations: 'default'
      }
    ],
    [
      FilingType.CONTINUATION_IN,
      {
        ...defaults,
        nameTranslations: 'default',
        numberExpro: 'default',
        numberPreviousJurisdiction: 'default',
        namePreviousJurisdiction: 'default',
        previousJurisdiction: 'default'
      }
    ],
    [
      FilingType.CONTINUATION_OUT,
      {
        ...defaults,
        outDate: 'default',
        nameNewJurisdiction: 'default',
        newJurisdiction: 'default'
      }
    ],
    [
      FilingType.AMALGAMATION_OUT,
      {
        ...defaults,
        outDate: 'default',
        nameNewJurisdiction: 'default',
        newJurisdiction: 'default'
      }
    ]
  ]

  it.each(filingTypeCases)(
    'returns correct overrides for %s',
    (filingType, expected) => {
      expect(getYourCompanyFieldOverrides(filingType)).toEqual(expected)
    }
  )

  const subTypeCases: Array<[FilingType, FilingSubType, Record<string, string>]> = [
    [
      FilingType.AMALGAMATION_APPLICATION,
      FilingSubType.AMALGAMATION_REGULAR,
      {
        ...defaults,
        nameRequest: 'default'
      }
    ]
  ]

  it.each(subTypeCases)(
    'returns correct overrides for %s: %s',
    (filingType, filingSubType, expected) => {
      expect(getYourCompanyFieldOverrides(filingType, filingSubType)).toEqual(expected)
    }
  )

  const handledFilingTypes = [
    ...filingTypeCases.map(([type]) => type),
    FilingType.AMALGAMATION_APPLICATION
  ]
  const unhandledFilingTypes = Object.values(FilingType).filter(
    type => !handledFilingTypes.includes(type)
  )

  it.each(unhandledFilingTypes)(
    'returns defaults for %s',
    (filingType) => {
      expect(getYourCompanyFieldOverrides(filingType)).toEqual(defaults)
    }
  )

  // Filing types with mixed configured and unconfigured sub types
  const unconfiguredSubTypeCases: Array<[FilingType, FilingSubType]> = [
    [
      FilingType.AMALGAMATION_APPLICATION,
      FilingSubType.AMALGAMATION_HORIZONTAL
    ],
    [
      FilingType.AMALGAMATION_APPLICATION,
      FilingSubType.AMALGAMATION_VERTICAL
    ]
  ]

  it.each(unconfiguredSubTypeCases)(
    'returns defaults for %s: %s',
    (filingType, filingSubType) => {
      expect(getYourCompanyFieldOverrides(filingType, filingSubType)).toEqual(defaults)
    }
  )

  it('returns defaults when filingType is invalid', () => {
    expect(getYourCompanyFieldOverrides('INVALID_TYPE' as FilingType)).toEqual(defaults)
  })

  it('returns defaults when filingSubType is invalid', () => {
    expect(
      getYourCompanyFieldOverrides(
        FilingType.AMALGAMATION_APPLICATION,
        'INVALID_TYPE' as FilingSubType
      )
    ).toEqual(defaults)
  })

  it('returns defaults when nested filingType has no filingSubType', () => {
    expect(getYourCompanyFieldOverrides(FilingType.AMALGAMATION_APPLICATION)).toEqual(defaults)
  })

  it('ignores filingSubType if not configured for filingType', () => {
    expect(
      getYourCompanyFieldOverrides(
        FilingType.INCORPORATION_APPLICATION,
        FilingSubType.AMALGAMATION_REGULAR
      )
    ).toEqual({
      ...defaults,
      nameRequest: 'default',
      nameTranslations: 'default'
    })
  })

  it('returns a new object reference via toMerged', () => {
    const configA = getYourCompanyFieldOverrides(FilingType.INCORPORATION_APPLICATION)
    const configB = getYourCompanyFieldOverrides(FilingType.INCORPORATION_APPLICATION)

    expect(configA).toEqual(configB)
    expect(configA).not.toBe(configB)
  })

  it('returns defaults when args are undefined', () => {
    expect(
      getYourCompanyFieldOverrides(undefined as unknown as FilingType, undefined)
    ).toEqual(defaults)

    expect(
      getYourCompanyFieldOverrides(undefined as unknown as FilingType)
    ).toEqual(defaults)

    expect(
      getYourCompanyFieldOverrides(FilingType.AMALGAMATION_APPLICATION, undefined)
    ).toEqual(defaults)
  })
})
