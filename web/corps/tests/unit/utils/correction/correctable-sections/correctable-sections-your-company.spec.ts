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

  const customSections: Array<[FilingType, Record<string, string>]> = [
    [
      FilingType.INCORPORATION_APPLICATION,
      {
        ...defaults,
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

  it.each(customSections)(
    'returns correct overrides for %s',
    (filingType, expected) => {
      expect(getYourCompanyFieldOverrides(filingType)).toEqual(expected)
    })

  const handledFilingTypes = customSections.map(([type]) => type)
  const unhandledFilingTypes = Object.values(FilingType).filter(
    type => !handledFilingTypes.includes(type)
  )

  it.each(unhandledFilingTypes)(
    'returns defaults for %s',
    (filingType) => {
      expect(getYourCompanyFieldOverrides(filingType)).toEqual(defaults)
    }
  )
})
