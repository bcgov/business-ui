import { describe, expect, it } from 'vitest'
// import Keycloak from 'keycloak-js'

describe('keycloak plugin', () => {
  it('keycloak instance is provided globally', () => {
    const app = useNuxtApp()
    expect(app.$keycloak).toBeDefined()
    // expect(app.$keycloak instanceof Keycloak).toBe(true)
  })
})
