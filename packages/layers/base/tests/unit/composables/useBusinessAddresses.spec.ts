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

  describe('getAddresses', () => {
    test('should format the response to the expected UiEntityOfficeAddress format', async () => {
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
})
