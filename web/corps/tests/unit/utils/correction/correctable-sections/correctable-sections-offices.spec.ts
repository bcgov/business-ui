// @vitest-environment node
import { describe, it, expect } from 'vitest'

describe('getOfficesConfig', () => {
  const defaults = {
    registeredOffice: false,
    recordsOffice: false,
    liquidationRecordsOffice: false
  } as const

  const filingTypeCases: Array<[FilingType, Record<string, boolean>]> = [
    [
      FilingType.INCORPORATION_APPLICATION,
      {
        ...defaults,
        registeredOffice: true,
        recordsOffice: true
      }
    ],
    [
      FilingType.CHANGE_OF_ADDRESS,
      {
        ...defaults,
        registeredOffice: true,
        recordsOffice: true
      }
    ],
    [
      FilingType.AMALGAMATION_APPLICATION,
      {
        ...defaults,
        registeredOffice: true,
        recordsOffice: true
      }
    ],
    [
      FilingType.CONTINUATION_IN,
      {
        ...defaults,
        registeredOffice: true,
        recordsOffice: true
      }
    ]
  ]

  it.each(filingTypeCases)(
    'returns correct config for %s',
    (filingType, expected) => {
      expect(getOfficesConfig(filingType)).toEqual(expected)
    }
  )

  const subTypeCases: Array<[FilingType, FilingSubType, Record<string, boolean>]> = [
    [
      FilingType.CHANGE_OF_LIQUIDATORS,
      FilingSubType.APPOINT_LIQUIDATOR,
      {
        ...defaults,
        liquidationRecordsOffice: true
      }
    ],
    [
      FilingType.CHANGE_OF_LIQUIDATORS,
      FilingSubType.INTENT_TO_LIQUIDATE,
      {
        ...defaults,
        liquidationRecordsOffice: true
      }
    ],
    [
      FilingType.CHANGE_OF_LIQUIDATORS,
      FilingSubType.CHANGE_ADDRESS_LIQUIDATOR,
      {
        ...defaults,
        liquidationRecordsOffice: true
      }
    ]
  ]

  it.each(subTypeCases)(
    'returns correct config for %s: %s',
    (filingType, filingSubType, expected) => {
      expect(getOfficesConfig(filingType, filingSubType)).toEqual(expected)
    }
  )

  const handledFilingTypes = [
    ...filingTypeCases.map(([type]) => type),
    FilingType.CHANGE_OF_LIQUIDATORS
  ]
  const unhandledFilingTypes = Object.values(FilingType).filter(
    type => !handledFilingTypes.includes(type)
  )

  it.each(unhandledFilingTypes)(
    'returns defaults for %s',
    (filingType) => {
      expect(getOfficesConfig(filingType)).toEqual(defaults)
    }
  )

  // Filing types with mixed configured and unconfigured sub types
  const unconfiguredSubTypeCases: Array<[FilingType, FilingSubType]> = [
    [
      FilingType.CHANGE_OF_LIQUIDATORS,
      FilingSubType.CEASE_LIQUIDATOR
    ],
    [
      FilingType.CHANGE_OF_LIQUIDATORS,
      FilingSubType.LIQUIDATION_REPORT
    ]
  ]

  it.each(unconfiguredSubTypeCases)(
    'returns defaults for %s: %s',
    (filingType, filingSubType) => {
      expect(getOfficesConfig(filingType, filingSubType)).toEqual(defaults)
    }
  )

  it('returns defaults when filingType is invalid', () => {
    expect(getOfficesConfig('INVALID_TYPE' as FilingType)).toEqual(defaults)
  })

  it('returns defaults when filingSubType is invalid', () => {
    expect(
      getOfficesConfig(
        FilingType.CHANGE_OF_LIQUIDATORS,
        'INVALID_TYPE' as FilingSubType
      )
    ).toEqual(defaults)
  })

  it('returns defaults when nested filingType has no filingSubType', () => {
    expect(getOfficesConfig(FilingType.CHANGE_OF_LIQUIDATORS)).toEqual(defaults)
  })

  it('ignores filingSubType if not configured for filingType', () => {
    expect(
      getOfficesConfig(
        FilingType.INCORPORATION_APPLICATION,
        FilingSubType.APPOINT_LIQUIDATOR
      )
    ).toEqual({
      ...defaults,
      registeredOffice: true,
      recordsOffice: true
    })
  })

  it('returns a new object reference via toMerged', () => {
    const configA = getOfficesConfig(FilingType.INCORPORATION_APPLICATION)
    const configB = getOfficesConfig(FilingType.INCORPORATION_APPLICATION)

    expect(configA).toEqual(configB)
    expect(configA).not.toBe(configB)
  })

  it('returns defaults when args are undefined', () => {
    expect(
      getOfficesConfig(undefined as unknown as FilingType, undefined)
    ).toEqual(defaults)

    expect(
      getOfficesConfig(undefined as unknown as FilingType)
    ).toEqual(defaults)

    expect(
      getOfficesConfig(FilingType.CHANGE_OF_LIQUIDATORS, undefined)
    ).toEqual(defaults)
  })
})

describe('getCorrectableOfficeTypes', () => {
  it('returns office types for filingTypes', () => {
    expect(
      getCorrectableOfficeTypes(FilingType.INCORPORATION_APPLICATION)
    ).toEqual([OfficeType.REGISTERED, OfficeType.RECORDS])
  })

  it('returns office types for filingSubTypes', () => {
    expect(
      getCorrectableOfficeTypes(
        FilingType.CHANGE_OF_LIQUIDATORS,
        FilingSubType.APPOINT_LIQUIDATOR
      )
    ).toEqual([OfficeType.LIQUIDATION])
  })

  it('returns empty array when sub-type has no active offices or is unconfigured', () => {
    expect(
      getCorrectableOfficeTypes(
        FilingType.CHANGE_OF_LIQUIDATORS,
        FilingSubType.CEASE_LIQUIDATOR
      )
    ).toEqual([])
  })
})
