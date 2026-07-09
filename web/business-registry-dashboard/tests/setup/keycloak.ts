import { vi } from 'vitest'
import { mockedKeycloak } from '~~/tests/mocks/mockedKeycloak'

// Prevent the layer's real Keycloak plugin (app/plugins/01.keycloak.client.ts)
// from making a real network call during component mounts in tests — its
// async init() waits on a same-origin iframe postMessage that never arrives
// in the test environment and can hang indefinitely.
vi.mock('keycloak-js', () => ({
  default: vi.fn(() => mockedKeycloak)
}))
