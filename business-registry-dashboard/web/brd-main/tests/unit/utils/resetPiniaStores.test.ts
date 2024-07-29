import { describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { resetPiniaStores } from '~/utils/resetPiniaStores'

describe('resetPiniaStores', () => {
  it('should reset all stores', () => {
    const pinia = setActivePinia(createPinia())

    const mockStore1 = { $reset: vi.fn() }
    const mockStore2 = { $reset: vi.fn() }
    const mockStore3 = { $reset: vi.fn() };

    (pinia as any)._s = new Map([['mockStore1', mockStore1], ['mockStore2', mockStore2], ['mockStore3', mockStore3]])

    setActivePinia(pinia)

    resetPiniaStores()

    expect(mockStore1.$reset).toHaveBeenCalledOnce()
    expect(mockStore2.$reset).toHaveBeenCalledOnce()
    expect(mockStore3.$reset).toHaveBeenCalledOnce()
  })
})
