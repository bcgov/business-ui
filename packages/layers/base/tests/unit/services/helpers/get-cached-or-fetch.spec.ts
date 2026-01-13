import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCachedOrFetch } from '../../../../app/services/helpers'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const { mockUseQueryCache, mocks } = vi.hoisted(() => {
  const ensure = vi.fn()
  const refresh = vi.fn()
  const fetch = vi.fn()

  return {
    mocks: { ensure, refresh, fetch },
    mockUseQueryCache: () => ({
      ensure,
      refresh,
      fetch
    })
  }
})

mockNuxtImport('useQueryCache', () => mockUseQueryCache)

describe('getCachedOrFetch', () => {
  const mockOptions = { key: ['test'], query: vi.fn() }
  const mockEntry = { key: ['test'], status: 'pending' }

  beforeEach(() => {
    vi.resetAllMocks()
    mocks.ensure.mockReturnValue(mockEntry)
  })

  it('should ensure the query exists in cache and call refresh when force is false', async () => {
    mocks.refresh.mockResolvedValue({ data: { id: 1 }, status: 'success' })

    const result = await getCachedOrFetch(mockOptions, false)

    expect(mocks.ensure).toHaveBeenCalledWith(mockOptions)
    expect(mocks.refresh).toHaveBeenCalledWith(mockEntry)
    expect(mocks.fetch).not.toHaveBeenCalled()
    expect(result).toEqual({ id: 1 })
  })

  it('should call fetch instead of refresh when force is true', async () => {
    mocks.fetch.mockResolvedValue({ data: { id: 1, forced: true }, status: 'success' })

    const result = await getCachedOrFetch(mockOptions, true)

    expect(mocks.ensure).toHaveBeenCalledWith(mockOptions)
    expect(mocks.fetch).toHaveBeenCalledWith(mockEntry)
    expect(mocks.refresh).not.toHaveBeenCalled()
    expect(result).toEqual({ id: 1, forced: true })
  })

  it('should propagate errors from the network call', async () => {
    const networkError = new Error('Network Failure')
    mocks.refresh.mockRejectedValue(networkError)
    await expect(getCachedOrFetch(mockOptions, false)).rejects.toThrow('Network Failure')
  })

  it('should default force to false', async () => {
    mocks.refresh.mockResolvedValue({ data: 'default', status: 'success' })
    await getCachedOrFetch(mockOptions)
    expect(mocks.refresh).toHaveBeenCalled()
  })
})
