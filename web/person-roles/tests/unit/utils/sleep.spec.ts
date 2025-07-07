import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { sleep } from '~/utils/sleep'

describe('sleep util', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('resolves after the default of 3000ms', async () => {
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout')

    const sleepPromise = sleep()

    expect(setTimeoutSpy).toHaveBeenCalledOnce()
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 3000)

    vi.advanceTimersByTime(3000)

    await sleepPromise
  })

  test('resolves after a specified duration', async () => {
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout')
    const customDelay = 500

    const sleepPromise = sleep(customDelay)

    expect(setTimeoutSpy).toHaveBeenCalledOnce()
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), customDelay)

    vi.advanceTimersByTime(customDelay)

    await sleepPromise
  })
})
