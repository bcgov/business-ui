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

  it('reads the invalid codes the same way as the missing ones', () => {
    expect(parseMissingInfoCode('INVALID_REGISTERED_OFFICE_DELIVERY_ADDRESS_REGION'))
      .toEqual({ addressType: 'deliveryAddress', field: 'region' })
    expect(parseMissingInfoCode('INVALID_RECORDS_OFFICE_MAILING_ADDRESS_POSTAL_CODE'))
      .toEqual({ addressType: 'mailingAddress', field: 'postalCode' })
    expect(parseMissingInfoCode('INVALID_DIRECTOR_DELIVERY_ADDRESS_COUNTRY'))
      .toEqual({ addressType: 'deliveryAddress', field: 'country' })
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

describe('getRowsToReview', () => {
  const byType = (office: OfficesSchema) => office.type

  it('keeps the flagged rows and drops the rows with nothing to fix', () => {
    const rows = [officeRow(OfficeType.REGISTERED), officeRow(OfficeType.RECORDS)]
    const flagged = { [OfficeType.RECORDS]: [{ addressType: 'mailingAddress' as const, field: 'city' as const }] }
    const kept = getRowsToReview(rows, flagged, byType)
    expect(kept.map(r => r.new.type)).toEqual([OfficeType.RECORDS])
  })

  it('keeps a seeded missing office and a row already changed, even without flags', () => {
    const changed = officeRow(OfficeType.REGISTERED, { actions: [ActionType.CHANGED] })
    const seeded = { old: undefined, new: createDefaultOffice({ type: OfficeType.RECORDS }) }
    expect(getRowsToReview([changed, seeded], {}, byType)).toEqual([changed, seeded])
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

  it('locks a record with no flags entirely', () => {
    const allLocked = { mailingAddress: allFields, deliveryAddress: allFields }
    expect(getLockedAddressFields(undefined)).toEqual(allLocked)
    expect(getLockedAddressFields([])).toEqual(allLocked)
  })

  it('leaves an office that is missing altogether fully editable', () => {
    expect(getLockedAddressFields([{}])).toBeUndefined()
  })

  it('unlocks the region and postal code along with a flagged country', () => {
    const locked = getLockedAddressFields([{ addressType: 'mailingAddress', field: 'country' }])
    expect(locked?.mailingAddress).toEqual(allFields.filter(f => !['country', 'region', 'postalCode'].includes(f)))
    expect(locked?.deliveryAddress).toEqual(allFields)
  })
})

describe('invalid codes end to end', () => {
  it('unlocks an invalid field like a missing one', () => {
    const summary = getMissingInfoSummary([
      missingInfoWarning('INVALID_REGISTERED_OFFICE_DELIVERY_ADDRESS_REGION', { officeType: OfficeType.REGISTERED }),
      missingInfoWarning('NO_DIRECTOR_MAILING_ADDRESS_POSTAL_CODE', { partyId: 7 }),
      missingInfoWarning('INVALID_DIRECTOR_DELIVERY_ADDRESS_COUNTRY', { partyId: 7 })
    ])
    const allFields = ['country', 'street', 'streetAdditional', 'city', 'region', 'postalCode', 'locationDescription']

    expect(getLockedAddressFields(summary.offices[OfficeType.REGISTERED])).toEqual({
      mailingAddress: allFields,
      deliveryAddress: allFields.filter(f => f !== 'region')
    })
    expect(getLockedAddressFields(summary.directors['7'])).toEqual({
      mailingAddress: allFields.filter(f => f !== 'postalCode'),
      deliveryAddress: allFields.filter(f => !['country', 'region', 'postalCode'].includes(f))
    })
  })
})

describe('withSeparateDeliveryAddress', () => {
  it('clears sameAs on both sides of every row without touching the addresses', () => {
    const existing = officeRow(OfficeType.REGISTERED)
    existing.old!.address.sameAs = true
    existing.new.address.sameAs = true
    const seeded = { old: undefined, new: createDefaultOffice({ type: OfficeType.RECORDS }) }

    const rows = withSeparateDeliveryAddress([existing, seeded])

    expect(rows[0]!.old!.address.sameAs).toBe(false)
    expect(rows[0]!.new.address.sameAs).toBe(false)
    expect(rows[0]!.new.address.deliveryAddress).toEqual(existing.new.address.deliveryAddress)
    expect(rows[1]!.old).toBeUndefined()
    expect(rows[1]!.new.address.sameAs).toBe(false)
    // the input rows are left alone
    expect(existing.new.address.sameAs).toBe(true)
  })
})
