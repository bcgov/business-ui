import { describe, test, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { getBusinessAddressesMock } from '#test-mocks'

const identifier = 'BC1234567'

const mockGetAddresses = vi.fn()
mockNuxtImport('useBusinessService', () => () => ({
  getAddresses: mockGetAddresses
}))

describe('useBusinessAddresses', () => {
  const addressesMock = getBusinessAddressesMock()

  beforeEach(async () => {
    vi.resetAllMocks()
    mockGetAddresses.mockResolvedValue(addressesMock)
  })

  describe('getBusinessAddresses', () => {
    describe('config param === "default"', () => {
      test('should format the response to the expected UiEntityOfficeAddress type', async () => {
        const resp = await useBusinessAddresses().getBusinessAddresses(identifier)

        expect(mockGetAddresses).toHaveBeenCalled()
        // mock does not include businessOffice
        expect(resp?.businessOffice).toBeUndefined()

        // should format liquidationRecordsOffice
        expect(resp?.liquidationRecordsOffice).toBeDefined()
        expect(resp?.liquidationRecordsOffice?.deliveryAddress.street)
          .toEqual(addressesMock.liquidationRecordsOffice?.deliveryAddress?.streetAddress)
        expect(resp?.liquidationRecordsOffice?.sameAs).toBe(false)

        // should format recordsOffice
        expect(resp?.recordsOffice).toBeDefined()
        expect(resp?.recordsOffice?.deliveryAddress.street)
          .toEqual(addressesMock.recordsOffice?.deliveryAddress?.streetAddress)
        expect(resp?.recordsOffice?.sameAs).toBe(true)

        // should format registeredOffice
        expect(resp?.registeredOffice).toBeDefined()
        expect(resp?.registeredOffice?.deliveryAddress.street)
          .toEqual(addressesMock.registeredOffice?.deliveryAddress?.streetAddress)
        expect(resp?.registeredOffice?.sameAs).toBe(true)
      })
    })

    describe('config param === "table"', () => {
      test('should format the reponse to match TableBusinessState<OfficesSchema>[] state', async () => {
        const resp = await useBusinessAddresses().getBusinessAddresses(identifier, 'table')

        expect(mockGetAddresses).toHaveBeenCalledWith(identifier)

        expect(Array.isArray(resp)).toBe(true)

        const mockKeys = Object.keys(addressesMock)
        expect(resp).toHaveLength(mockKeys.length)

        const firstOffice = resp[0]
        expect(firstOffice).toHaveProperty('new')
        expect(firstOffice).toHaveProperty('old')

        expect(firstOffice!.new.type).toBe(mockKeys[0])
        expect(firstOffice!.new.address.deliveryAddress.street).toBeDefined()
        expect(firstOffice!.new.actions).toEqual([])
        expect(firstOffice!.new).toEqual(firstOffice!.old)

        const registeredEntry = resp.find(item => item.new.type === 'registeredOffice')
        expect(registeredEntry).toBeDefined()
        expect(registeredEntry!.new.address.deliveryAddress.street)
          .toEqual(addressesMock.registeredOffice!.deliveryAddress!.streetAddress)
      })
    })
  })
})
