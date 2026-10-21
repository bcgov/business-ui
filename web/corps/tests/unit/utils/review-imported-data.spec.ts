import { describe, it, expect } from 'vitest'

/** A translate stub that echoes the key and any params so the composed lines can be asserted. */
const t = (key: string, params?: Record<string, unknown>) =>
  params ? `${key}(${Object.values(params).join(',')})` : key

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
    expect(hasMissingInfo(summary)).toBe(true)
  })

  it('is empty without missing info warnings', () => {
    const summary = getMissingInfoSummary(undefined)
    expect(summary).toEqual({ offices: {}, directors: {} })
    expect(hasMissingInfo(summary)).toBe(false)
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

describe('getOfficesDeliveryOutsideBc', () => {
  it('flags only the changed offices whose delivery address is outside BC, Canada', () => {
    const inBc = officeRow(OfficeType.REGISTERED, { actions: [ActionType.CHANGED] })
    inBc.new.address.deliveryAddress.region = 'BC'
    inBc.new.address.deliveryAddress.country = 'CA'
    const inAb = officeRow(OfficeType.RECORDS, { actions: [ActionType.ADDED] })
    inAb.new.address.deliveryAddress.region = 'AB'
    inAb.new.address.deliveryAddress.country = 'CA'
    const untouchedUs = officeRow(OfficeType.RECORDS)
    untouchedUs.new.address.deliveryAddress.region = 'WA'
    untouchedUs.new.address.deliveryAddress.country = 'US'

    expect(getOfficesDeliveryOutsideBc([inBc, inAb, untouchedUs])).toEqual([OfficeType.RECORDS])
  })
})

describe('describe missing info', () => {
  const summary: MissingInfoSummary = {
    offices: {
      registeredOffice: [{ addressType: 'deliveryAddress', field: 'postalCode' }],
      recordsOffice: [{}]
    },
    directors: {
      123: [{ addressType: 'mailingAddress' }],
      999: [{ addressType: 'deliveryAddress', field: 'city' }]
    }
  }

  it('writes one office line per missing field', () => {
    expect(describeMissingOffices(summary, t)).toEqual([
      'officeType.registeredOffice: '
      + 'text.missingInfo.fieldMissing(label.deliveryAddress,text.missingInfo.field.postalCode)',
      'officeType.recordsOffice: text.missingInfo.officeMissing'
    ])
  })

  it('names the director from the table and falls back to the role label', () => {
    const director = getPartySchema(RoleTypeUi.DIRECTOR).parse({ id: '123' })
    director.name.firstName = 'Jane'
    director.name.lastName = 'Doe'
    const directors: TableBusinessState<PartySchema>[] = [{ old: director, new: director }]

    expect(describeMissingDirectors(summary, directors, t)).toEqual([
      'Jane Doe: text.missingInfo.addressMissing(label.mailingAddress)',
      'label.director: text.missingInfo.fieldMissing(label.deliveryAddress,text.missingInfo.field.city)'
    ])
  })
})
