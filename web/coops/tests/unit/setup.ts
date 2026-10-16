/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { config } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { loadNuxt, getLayerDirectories } from '@nuxt/kit'
import { merge } from 'es-toolkit'
import fs from 'node:fs'
import { createResolver } from 'nuxt/kit'
import { vMaska } from 'maska/vue'

// Apply vMaska directive
config.global.directives = {
  ...config.global.directives,
  maska: vMaska
}

// Manually merge all i18n files for mock
const nuxt = await loadNuxt({ cwd: process.cwd() })
const layerDirs = getLayerDirectories(nuxt)
const reversed = [...layerDirs].reverse()
async function loadMergedLayerMessages() {
  let mergedMessages: Record<string, any> = {}

  for (const layer of reversed) {
    const { resolve } = createResolver(layer.root)
    const localePath = resolve('i18n/locales/en-CA.ts')

    if (fs.existsSync(localePath)) {
      const module = await import(/* @vite-ignore */ localePath)
      mergedMessages = merge(mergedMessages, module.default)
    }
  }

  return mergedMessages
}

const enCaMessages = await loadMergedLayerMessages()
await nuxt.close()

// Create i18n mock - All translations will return the translation key
const i18n = createI18n({
  legacy: false,
  locale: 'en-CA',
  messages: {
    'en-CA': enCaMessages,
    'fr-CA': {}
  },
  missing: (_, key) => key
})

// Add to plugins for component tests ($t usage)
config.global.plugins = [i18n]

export const mockTokenParsed: object = {
  firstname: 'John',
  lastname: 'Doe',
  name: 'John Doe',
  username: 'jdoe',
  email: 'john.doe@example.com',
  sub: 'mock-guid',
  loginSource: 'bcsc',
  realm_access: {
    roles: ['user', 'admin']
  }
}

export const mockConnectAuth = {
  login: vi.fn(),
  logout: vi.fn(),
  updateToken: vi.fn(),
  authenticated: true,
  token: 'mock-token',
  tokenParsed: mockTokenParsed
}

export const mockAuthApi = vi.fn() as any
mockAuthApi.raw = vi.fn()

export const mockBusinessApi = vi.fn() as any

// Default useNuxtApp mock - may still need to overwrite in test file if extra mocks are needed (eg: $authApi)
mockNuxtImport('useNuxtApp', original => () => {
  const orig = typeof original === 'function' ? original() : {}

  return {
    ...orig,
    $i18n: i18n.global, // add $i18n mock - will return keys instead of translated strings - required when using useNuxtApp().$i18n.t etc
    $connectAuth: mockConnectAuth, // mock keycloak instance
    $businessApi: mockBusinessApi, // mock $businessApi plugin
    $authApi: mockAuthApi // mock $authApi plugin
  }
})

// Provide common useRuntimeConfig mock and export to use in tests
// Reactive allows updating the values in test and will be re-evaluated when called
export const mockRtc = reactive<Record<string, any>>({
  appName: 'test-app',
  authWebUrl: 'https://auth.example.com/',
  baseUrl: 'https://app.example.com/',
  businessDashboardUrl: 'http://dashboard/',
  businessEditUrl: 'http://edit/',
  brdUrl: 'http://brd/',
  ldClientId: 'test-client-id',
  siteminderLogoutUrl: 'https://siteminder.example.com/logout',
  playwright: false,
  registryHomeUrl: 'http://registry-home/',
  xApiKey: 'test-key',
  businessApiUrl: 'https://test-api.gov.bc.ca',
  businessApiVersion: '/v1'
})
mockNuxtImport('useRuntimeConfig', original => () => {
  const orig = typeof original === 'function' ? original() : {}
  return {
    ...orig,
    public: mockRtc
  }
})

mockNuxtImport('useRouter', original => () => {
  const orig = typeof original === 'function' ? original() : {}
  return {
    push: vi.fn().mockResolvedValue(true),
    replace: vi.fn().mockResolvedValue(true),
    back: vi.fn(),
    forward: vi.fn(),
    go: vi.fn(),
    afterEach: vi.fn(),
    beforeEach: vi.fn(),
    beforeResolve: vi.fn(),
    currentRoute: {
      value: { path: '/', fullPath: '/', query: {}, params: {}, meta: {} }
    },
    ...orig
  }
})
