import { describe, expect, it, vi, afterEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { useKeycloak } from '~/composables/useKeycloak'

vi.mock('#app', () => ({
  useNuxtApp: () => ({
    $i18n: {
      locale: ref('en-CA')
    }
  })
}))

describe('useKeycloak', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })
  it('handles login', () => {
    // get imports
    const { $keycloak } = useNuxtApp()

    // call function
    const keycloak = useKeycloak()
    keycloak.login()

    // assert
    expect($keycloak.login).toHaveBeenCalledOnce()
    expect($keycloak.login).toHaveBeenCalledWith({
      idpHint: 'bcsc',
      redirectUri: `${location.origin}/en-CA`
    })
  })

  it('handles logout', () => {
    const { resetPiniaStoresMock } = vi.hoisted(() => ({ resetPiniaStoresMock: vi.fn() }))
    mockNuxtImport('resetPiniaStores', () => resetPiniaStoresMock)

    // get imports
    const { $keycloak } = useNuxtApp()

    // call function
    const keycloak = useKeycloak()
    keycloak.logout()

    // assert
    expect($keycloak.logout).toHaveBeenCalledOnce()
    expect($keycloak.logout).toHaveBeenCalledWith({
      redirectUri: `${location.origin}/en-CA`
    })
    // logout should also clear pinia stores
    expect(resetPiniaStoresMock).toHaveBeenCalledOnce()
  })

  it('returns the authenticated value', () => {
    // get imports
    const keycloak = useKeycloak()

    // assert
    expect(keycloak.isAuthenticated()).toEqual(true)
  })

  it('returns a kcUser object', () => {
    // get imports
    const keycloak = useKeycloak()

    // assert
    expect(keycloak.kcUser).toBeDefined()
    expect(keycloak.kcUser.value).toEqual({
      firstName: 'First',
      lastName: 'Last',
      fullName: 'First Last',
      keycloakGuid: '123456',
      userName: 'Username',
      email: 'test@email.com',
      loginSource: 'BCSC',
      roles: ['role1', 'role2']
    })
  })

  describe('getToken', () => {
    it('getToken returns token when updateToken is successful', async () => {
      const { $keycloak } = useNuxtApp()

      const keycloak = useKeycloak()

      const token = await keycloak.getToken()
      expect($keycloak.updateToken).toHaveBeenCalledOnce()
      expect($keycloak.updateToken).toHaveBeenCalledWith(30)
      expect(token).toBe('123')
    })

    it('getToken returns token with forceRefresh', async () => {
      const { $keycloak } = useNuxtApp()

      const keycloak = useKeycloak()

      const token = await keycloak.getToken(true)
      expect($keycloak.updateToken).toHaveBeenCalledOnce()
      expect($keycloak.updateToken).toHaveBeenCalledWith(-1)
      expect(token).toBe('123')
    })
  })
})
