import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { useTosStore } from '#imports'

const mockTos = {
  isTermsOfUseAccepted: false,
  termsOfUseAcceptedVersion: null,
  termsOfUseCurrentVersion: '5',
  termsOfUse: 'tos here'
}

const mockTosPatch = {
  isTermsOfUseAccepted: true,
  termsOfUseAcceptedVersion: '5'
}

// registerEndpoint('/users/tos', {
//   method: 'GET',
//   handler: () => (mockTos)
// })

const fakeApiCall = vi.fn()
registerEndpoint('/users/tos', fakeApiCall)

describe('TOS Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initially has correct state', () => {
    const tosStore = useTosStore()
    expect(tosStore.loading).toBe(false)
    expect(tosStore.tos).toEqual({})
  })

  it('can get and assign terms of use', async () => {
    fakeApiCall.mockImplementation(() => (mockTos))
    const tosStore = useTosStore()
    const response = await tosStore.getTermsOfUse()

    expect(response).toEqual(mockTos)
    expect(tosStore.tos).toEqual(mockTos)
  })

  it('can submit terms of use successfully', async () => {
    fakeApiCall.mockImplementation(() => (mockTosPatch))
    const tosStore = useTosStore()
    tosStore.tos = mockTos
    const successCallback = vi.fn()

    await tosStore.submitTermsOfUse({ data: { agreeToTerms: true } } as any, successCallback)

    expect(tosStore.loading).toBe(false)
    expect(successCallback).toBeCalled()
  })

  it('handles submit terms of use error', async () => { // passes when using .only
    fakeApiCall.mockImplementation(() => { throw new Error('some error') })
    const tosStore = useTosStore()
    await tosStore.submitTermsOfUse({ data: { agreeToTerms: true } } as any, vi.fn())
    const hasAlert = useAlertStore().alerts.some(alert => alert.category === 'tos-patch-error')
    expect(hasAlert).toBeTruthy()
  })

  it('resets the state correctly', () => {
    const tosStore = useTosStore()
    tosStore.loading = true
    tosStore.tos = mockTos

    tosStore.$reset()

    expect(tosStore.loading).toBe(false)
    expect(tosStore.tos).toEqual({})
  })
})
