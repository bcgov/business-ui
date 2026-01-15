/* eslint-disable @typescript-eslint/no-explicit-any */
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
  const mockEntry = { key: ['test'], status: 'pending', meta: {} }

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

  it('should handle request that returns undefined', async () => {
    mocks.refresh.mockResolvedValue({ data: undefined, status: 'success' })
    const result = await getCachedOrFetch(mockOptions)
    expect(result).toBeUndefined()
  })

  it('should deduplicate concurrent requests and only call refresh once', async () => {
    let promiseResolve: any
    const promise = new Promise((resolve) => {
      promiseResolve = resolve
    })

    mocks.refresh.mockReturnValue(promise)

    const promises = [
      getCachedOrFetch(mockOptions),
      getCachedOrFetch(mockOptions),
      getCachedOrFetch(mockOptions),
      getCachedOrFetch(mockOptions),
      getCachedOrFetch(mockOptions)
    ]

    expect((mockEntry.meta as any)._localPromise).toBeDefined()
    expect((mockEntry.meta as any)._localPromise).toBe(promise)

    promiseResolve({ data: { id: 1 }, status: 'success' })

    const results = await Promise.all(promises)

    expect(mocks.refresh).toHaveBeenCalledTimes(1)
    results.forEach((res) => {
      expect(res).toEqual({ id: 1 })
    })
    expect((mockEntry.meta as any)._localPromise).toBeUndefined()
  })

  it('should allow force to overwrite an existing _localPromise', async () => {
    let resolved1: any
    const promise1 = new Promise((resolve) => {
      resolved1 = resolve
    })
    mocks.refresh.mockReturnValue(promise1)
    const notForcedCall = getCachedOrFetch(mockOptions, false)

    const localePromise1 = (mockEntry.meta as any)._localPromise
    expect(localePromise1).toBeDefined()
    expect(localePromise1).toBe(promise1)

    let resolved2: any
    const promise2 = new Promise((resolve) => {
      resolved2 = resolve
    })
    mocks.fetch.mockReturnValue(promise2)

    const forcedCall = getCachedOrFetch(mockOptions, true)

    expect((mockEntry.meta as any)._localPromise).toBe(promise2)
    expect((mockEntry.meta as any)._localPromise).not.toBe(promise1)

    resolved2({ data: 'forced', status: 'success' })
    const forcedResult = await forcedCall
    expect(forcedResult).toBe('forced')

    resolved1({ data: 'not-forced', status: 'success' })
    await notForcedCall

    expect((mockEntry.meta as any)._localPromise).toBeUndefined()
  })

  it('should only cleanup the currently active _localPromise', async () => {
    let resolved1: any
    const promise1 = new Promise((resolve) => {
      resolved1 = resolve
    })
    mocks.refresh.mockReturnValueOnce(promise1)
    const request1 = getCachedOrFetch(mockOptions)

    let resolved2: any
    const promise2 = new Promise((resolve) => {
      resolved2 = resolve
    })
    mocks.fetch.mockReturnValueOnce(promise2)

    const request2 = getCachedOrFetch(mockOptions, true)

    const newLocalPromise = (mockEntry.meta as any)._localPromise
    expect(newLocalPromise).toBe(promise2)

    resolved1({ data: 'old', status: 'success' })
    const result1 = await request1
    expect(result1).toBe('old')

    expect((mockEntry.meta as any)._localPromise).toBeDefined()
    expect((mockEntry.meta as any)._localPromise).toBe(promise2)

    resolved2({ data: 'new', status: 'success' })
    const result2 = await request2
    expect(result2).toBe('new')

    expect((mockEntry.meta as any)._localPromise).toBeUndefined()
  })

  it('should delete the _localPromise if the refresh fails', async () => {
    mocks.refresh.mockRejectedValue(new Error('refresh-failed'))
    await expect(getCachedOrFetch(mockOptions)).rejects.toThrow()
    expect((mockEntry.meta as any)._localPromise).toBeUndefined()
  })

  it('should delete the _localPromise if the fetch fails', async () => {
    mocks.fetch.mockRejectedValue(new Error('refresh-failed'))
    await expect(getCachedOrFetch(mockOptions, true)).rejects.toThrow()
    expect((mockEntry.meta as any)._localPromise).toBeUndefined()
  })
})
