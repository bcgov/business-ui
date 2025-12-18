import { describe, test, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { getPartiesMock } from '#test-mocks/parties'

const identifier = 'BC1234567'

const mockLegalApi = {
  getParties: vi.fn()
}
mockNuxtImport('useBusinessApi', () => () => mockLegalApi)

mockNuxtImport('useConnectAccountStore', () => () => ({ currentAccount: { id: 123 } }))

describe('useBusinessParty', () => {
  beforeEach(async () => {
    vi.resetAllMocks()
  })

  describe('initFiling', () => {
    let store: ReturnType<typeof useBusinessStore>
    const partiesMock = getPartiesMock()

    beforeEach(async () => {
      vi.resetAllMocks()
      const pinia = createPinia()
      setActivePinia(pinia)
      store = useBusinessStore()
      store.$reset()
      mockLegalApi.getParties.mockResolvedValue(
        {
          data: { value: partiesMock },
          error: { value: undefined },
          status: { value: 'success' },
          refresh: async () => ({ data: partiesMock })
        }
      )
    })

    describe('getBusinessParties', () => {
      test('should map the response to the expected table state array', async () => {
        // init
        const resp = await useBusinessParty()
          .getBusinessParties(identifier, RoleClass.OFFICER)

        // assert
        expect(mockLegalApi.getParties).toHaveBeenCalled()
        expect(resp.data).toBeDefined()
        expect(resp.data!.length).toBe(partiesMock.parties.length)
        expect(resp.data![0]!.new.actions).toEqual([])
        expect(resp.data![0]!.old!.actions).toEqual([])
        expect(resp.data![0]!.new.name.firstName).toBe(partiesMock.parties[0]!.officer.firstName)
        expect(resp.data![0]!.old!.name.firstName).toBe(partiesMock.parties[0]!.officer.firstName)
        expect(resp.data![0]!.new.address.deliveryAddress.street)
          .toBe(partiesMock.parties[0]!.deliveryAddress?.streetAddress)
        expect(resp.data![0]!.old!.address.deliveryAddress.street)
          .toBe(partiesMock.parties[0]!.deliveryAddress?.streetAddress)
        expect(resp.data![0]!.new.address.mailingAddress.street)
          .toBe(partiesMock.parties[0]!.mailingAddress?.streetAddress)
        expect(resp.data![0]!.old!.address.mailingAddress.street)
          .toBe(partiesMock.parties[0]!.mailingAddress?.streetAddress)
      })
    })
  })
})
