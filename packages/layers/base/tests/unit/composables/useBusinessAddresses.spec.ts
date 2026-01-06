import { describe, test, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { getBusinessAddressesMock } from '#test-mocks'

const identifier = 'BC1234567'

const mockBusinessApi = {
  getBusinessAddresses: vi.fn()
}
mockNuxtImport('useBusinessApi', () => () => mockBusinessApi)

describe('useBusinessAddresses', () => {
  beforeEach(async () => {
    vi.resetAllMocks()
  })

  describe('initFiling', () => {
    const addressesMock = getBusinessAddressesMock()

    beforeEach(async () => {
      vi.resetAllMocks()
      mockBusinessApi.getBusinessAddresses.mockResolvedValue(
        {
          data: { value: addressesMock },
          error: { value: undefined },
          status: { value: 'success' },
          refresh: async () => ({ data: addressesMock })
        }
      )
    })

    describe('getBusinessAddresses', () => {
      test('should format the response to the expected UiEntityOfficeAddress format', async () => {
        const resp = await useBusinessAddresses().getBusinessAddresses(identifier)

        expect(mockBusinessApi.getBusinessAddresses).toHaveBeenCalled()
        // mock does not include businessOffice
        expect(resp.data?.businessOffice).toBeUndefined()

        // should format liquidationRecordsOffice
        expect(resp.data?.liquidationRecordsOffice).toBeDefined()
        expect(resp.data?.liquidationRecordsOffice?.deliveryAddress.street)
          .toEqual(addressesMock.liquidationRecordsOffice?.deliveryAddress?.streetAddress)
        expect(resp.data?.liquidationRecordsOffice?.sameAs).toBe(false)

        // should format recordsOffice
        expect(resp.data?.recordsOffice).toBeDefined()
        expect(resp.data?.recordsOffice?.deliveryAddress.street)
          .toEqual(addressesMock.recordsOffice?.deliveryAddress?.streetAddress)
        expect(resp.data?.recordsOffice?.sameAs).toBe(true)

        // should format registeredOffice
        expect(resp.data?.registeredOffice).toBeDefined()
        expect(resp.data?.registeredOffice?.deliveryAddress.street)
          .toEqual(addressesMock.registeredOffice?.deliveryAddress?.streetAddress)
        expect(resp.data?.registeredOffice?.sameAs).toBe(true)
      })
    })
  })
})
