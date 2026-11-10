import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { getBusinessAddressesMock } from '#test-mocks'

describe('formatChangeOfAddressOfficesApi', () => {
  const addressesMock = getBusinessAddressesMock()

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // rows in the requested order (the formatter follows the api response's key order)
  function makeTableState(officeTypes: OfficeType[]) {
    const rows = formatOfficesSection(addressesMock, undefined, officeTypes)
    return officeTypes.map(type => rows.find(row => row.new.type === type)!)
  }

  it('should key each office by its type with api-formatted addresses', () => {
    const tableState = makeTableState([OfficeType.REGISTERED, OfficeType.RECORDS])

    const offices = formatChangeOfAddressOfficesApi(tableState)

    expect(Object.keys(offices)).toEqual([OfficeType.REGISTERED, OfficeType.RECORDS])
    expect(offices[OfficeType.REGISTERED]!.deliveryAddress.streetAddress)
      .toBe(addressesMock.registeredOffice!.deliveryAddress!.streetAddress)
    expect(offices[OfficeType.REGISTERED]!.mailingAddress.streetAddress)
      .toBe(addressesMock.registeredOffice!.mailingAddress!.streetAddress)
  })

  it('should include unchanged and changed offices alike', () => {
    const tableState = makeTableState([OfficeType.REGISTERED, OfficeType.RECORDS])
    tableState[0]!.new.actions = [ActionType.ADDRESS_CHANGED]
    tableState[0]!.new.address.deliveryAddress.street = '456 New St'

    const offices = formatChangeOfAddressOfficesApi(tableState)

    expect(offices[OfficeType.REGISTERED]!.deliveryAddress.streetAddress).toBe('456 New St')
    expect(offices[OfficeType.RECORDS]).toBeDefined()
  })

  it('should only include the fetched office types', () => {
    const tableState = makeTableState([OfficeType.REGISTERED])

    const offices = formatChangeOfAddressOfficesApi(tableState)

    expect(Object.keys(offices)).toEqual([OfficeType.REGISTERED])
  })
})
