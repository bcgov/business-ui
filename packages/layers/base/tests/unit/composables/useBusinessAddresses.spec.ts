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
    vi.clearAllMocks()
    mockGetAddresses.mockResolvedValue(addressesMock)
  })

  describe('getBusinessAddresses', () => {
    describe('formatting', () => {
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

    describe('filtering offices', () => {
      test('should return only the given office types', async () => {
        const types = [OfficeType.REGISTERED, OfficeType.RECORDS] // mock will also return liquidationRecordsOffice

        const res = await useBusinessAddresses().getBusinessAddresses(identifier, types)

        const keys = Object.keys(res)
        expect(keys).toHaveLength(2)
        expect(keys).toContain(OfficeType.REGISTERED)
        expect(keys).toContain(OfficeType.RECORDS)
        expect(keys).not.toContain(OfficeType.LIQUIDATION)
      })

      test('should pass the date through as an address query when provided', async () => {
        await useBusinessAddresses().getBusinessAddresses(identifier, undefined, '2026-01-01')

        expect(mockGetAddresses).toHaveBeenCalledWith(identifier, { date: '2026-01-01' }, false)
      })

      test('should return all addresses if no officeTypes param given', async () => {
        const res = await useBusinessAddresses().getBusinessAddresses(identifier)

        const keys = Object.keys(res)
        expect(keys).toHaveLength(3)
        expect(keys).toContain(OfficeType.REGISTERED)
        expect(keys).toContain(OfficeType.RECORDS)
        expect(keys).toContain(OfficeType.LIQUIDATION)
      })
    })
  })
})
