import Keycloak from 'keycloak-js'
import { vi } from 'vitest'

const mockParsedToken = {
  firstname: 'First',
  lastname: 'Last',
  fullName: 'First Last',
  keycloakGuid: '123456',
  name: 'First Last',
  username: 'Username',
  email: 'test@email.com',
  sub: '123456',
  loginSource: 'BCSC',
  realm_access: { roles: ['role1', 'role2'] },
  roles: ['public_user']
}
// export const mockedLogin = vi.fn()
export const mockUpdateToken = vi.fn(() => Promise.resolve(true))

export const mockedKeycloak: Partial<Keycloak> = {
  init: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  updateToken: mockUpdateToken,
  authenticated: true,
  tokenParsed: mockParsedToken,
  token: '123'
}
