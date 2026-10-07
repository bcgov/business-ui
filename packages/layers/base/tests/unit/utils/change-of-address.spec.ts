import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { getBusinessAddressesMock } from '#test-mocks'

describe('buildChangeOfAddressOffices', () => {
  const addressesMock = getBusinessAddressesMock()

  beforeEach(() => {
    // useBusinessAddresses -> useBusinessService -> useConnectAccountStore needs an active pinia
    setActivePinia(createPinia())
  })

  // useBusinessAddresses needs the nuxt context - call it inside the test, never at describe level
  function makeTableState(officeTypes: OfficeType[]) {
    return useBusinessAddresses().formatAddressTableState(addressesMock, officeTypes)
  }

  it('should key each office by its type with api-formatted addresses', () => {
    const tableState = makeTableState([OfficeType.REGISTERED, OfficeType.RECORDS])

    const offices = buildChangeOfAddressOffices(tableState)

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

    const offices = buildChangeOfAddressOffices(tableState)

    expect(offices[OfficeType.REGISTERED]!.deliveryAddress.streetAddress).toBe('456 New St')
    expect(offices[OfficeType.RECORDS]).toBeDefined()
  })

  it('should only include the fetched office types', () => {
    const tableState = makeTableState([OfficeType.REGISTERED])

    const offices = buildChangeOfAddressOffices(tableState)

    expect(Object.keys(offices)).toEqual([OfficeType.REGISTERED])
  })
})
