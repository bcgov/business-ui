import { describe, it, expect } from 'vitest'

const missingInfoWarning = (code: string, data: Record<string, unknown>) => ({
  code,
  message: code,
  warningType: ApiWarningType.MISSING_REQUIRED_BUSINESS_INFO,
  data
})

function officeRow(type: OfficeType, overrides: Partial<OfficesSchema> = {}): TableBusinessState<OfficesSchema> {
  const office = createDefaultOffice({ type, ...overrides })
  return { old: createDefaultOffice({ type }), new: office }
}

describe('parseMissingInfoCode', () => {
  it('names the address and field a code points at', () => {
    expect(parseMissingInfoCode('NO_REGISTERED_OFFICE_DELIVERY_ADDRESS_POSTAL_CODE'))
      .toEqual({ addressType: 'deliveryAddress', field: 'postalCode' })
    expect(parseMissingInfoCode('NO_DIRECTOR_MAILING_ADDRESS_STREET'))
      .toEqual({ addressType: 'mailingAddress', field: 'street' })
    expect(parseMissingInfoCode('NO_RECORDS_OFFICE_MAILING_ADDRESS_REGION'))
      .toEqual({ addressType: 'mailingAddress', field: 'region' })
  })

  it('returns only the address when the whole address is missing', () => {
    expect(parseMissingInfoCode('NO_DIRECTOR_DELIVERY_ADDRESS')).toEqual({ addressType: 'deliveryAddress' })
  })

  it('returns nothing when the office itself is missing or the code is unknown', () => {
    expect(parseMissingInfoCode('NO_RECORDS_OFFICE')).toEqual({})
    expect(parseMissingInfoCode('SOMETHING_ELSE')).toEqual({})
  })
})

describe('getMissingInfoSummary', () => {
  it('groups the warnings by office type and director party id', () => {
    const summary = getMissingInfoSummary([
      missingInfoWarning('NO_REGISTERED_OFFICE_DELIVERY_ADDRESS_POSTAL_CODE', { officeType: 'registeredOffice' }),
      missingInfoWarning('NO_RECORDS_OFFICE', { officeType: 'recordsOffice' }),
      missingInfoWarning('NO_DIRECTOR_MAILING_ADDRESS_STREET', { partyId: 123 }),
      missingInfoWarning('NO_DIRECTOR_MAILING_ADDRESS_CITY', { partyId: 123 }),
      missingInfoWarning('NO_DIRECTOR_DELIVERY_ADDRESS', { partyId: 456 }),
      { code: 'TRANSITION_NOT_FILED', message: '', warningType: ApiWarningType.NOT_IN_GOOD_STANDING }
    ] as BusinessWarning[])

    expect(summary.offices).toEqual({
      registeredOffice: [{ addressType: 'deliveryAddress', field: 'postalCode' }],
      recordsOffice: [{}]
    })
    expect(summary.directors).toEqual({
      123: [
        { addressType: 'mailingAddress', field: 'street' },
        { addressType: 'mailingAddress', field: 'city' }
      ],
      456: [{ addressType: 'deliveryAddress' }]
    })
  })

  it('is empty without missing info warnings', () => {
    const summary = getMissingInfoSummary(undefined)
    expect(summary).toEqual({ offices: {}, directors: {} })
  })
})

describe('seedMissingOffices', () => {
  it('adds an unsaved empty row for each office type the business has no record of', () => {
    const seeded = seedMissingOffices([officeRow(OfficeType.REGISTERED)], [OfficeType.REGISTERED, OfficeType.RECORDS])

    expect(seeded).toHaveLength(2)
    expect(seeded[0]!.old).toBeDefined()
    expect(seeded[1]!.old).toBeUndefined()
    expect(seeded[1]!.new.type).toBe(OfficeType.RECORDS)
    expect(seeded[1]!.new.actions).toEqual([])
    expect(seeded[1]!.new.address.deliveryAddress.street).toBe('')
  })

  it('leaves a complete office set alone', () => {
    const rows = [officeRow(OfficeType.REGISTERED), officeRow(OfficeType.RECORDS)]
    expect(seedMissingOffices(rows, [OfficeType.REGISTERED, OfficeType.RECORDS])).toEqual(rows)
  })
})

describe('getLockedAddressFields', () => {
  const allFields = ['country', 'street', 'streetAdditional', 'city', 'region', 'postalCode', 'locationDescription']

  it('locks every input except the flagged field, per address', () => {
    const locked = getLockedAddressFields([
      { addressType: 'deliveryAddress', field: 'postalCode' },
      { addressType: 'mailingAddress', field: 'street' },
      { addressType: 'mailingAddress', field: 'city' }
    ])
    expect(locked).toEqual({
      mailingAddress: allFields.filter(f => f !== 'street' && f !== 'city'),
      deliveryAddress: allFields.filter(f => f !== 'postalCode')
    })
  })

  it('locks an address with no flags entirely', () => {
    const locked = getLockedAddressFields([{ addressType: 'deliveryAddress', field: 'region' }])
    expect(locked?.mailingAddress).toEqual(allFields)
    expect(locked?.deliveryAddress).toEqual(allFields.filter(f => f !== 'region'))
  })

  it('leaves an address flagged as a whole fully editable', () => {
    const locked = getLockedAddressFields([
      { addressType: 'deliveryAddress' },
      { addressType: 'mailingAddress', field: 'postalCode' }
    ])
    expect(locked).toEqual({ mailingAddress: allFields.filter(f => f !== 'postalCode') })
  })

  it('leaves a record with no flags, or a missing office, fully editable', () => {
    expect(getLockedAddressFields(undefined)).toBeUndefined()
    expect(getLockedAddressFields([])).toBeUndefined()
    expect(getLockedAddressFields([{}])).toBeUndefined()
  })
})
