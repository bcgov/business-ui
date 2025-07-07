import { describe, test, expect, vi, afterEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const mockAuthApi = vi.fn()
mockNuxtImport('useNuxtApp', () => {
  return () => ({
    $authApi: mockAuthApi
  })
})

describe('useAuthApi', () => {
  const authApi = useAuthApi()

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getAuthInfo', () => {
    test('should call the $authApi with the correct URL', async () => {
      const businessId = 'BC1234567'

      mockAuthApi.mockResolvedValue({ name: 'Test Business' })

      await authApi.getAuthInfo(businessId)

      expect(mockAuthApi).toHaveBeenCalledOnce()
      expect(mockAuthApi).toHaveBeenCalledWith(`/entities/${businessId}`)
    })

    test('should return the data from the API call', async () => {
      const businessId = 'BC7654321'

      const mockResponse = {
        contacts: [{ email: 'test@example.com' }],
        corpType: { desc: 'BC Company' }
      }
      mockAuthApi.mockResolvedValue(mockResponse)

      const result = await authApi.getAuthInfo(businessId)

      expect(result).toEqual(mockResponse)
      expect(result.corpType.desc).toBe('BC Company')
    })
  })
})
