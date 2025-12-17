/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import businessApiPlugin from '../../../app/plugins/business-api'

mockNuxtImport('useConnectAuth', () => {
  return () => ({
    getToken: vi.fn().mockResolvedValue('mock-jwt-token')
  })
})

mockNuxtImport('useConnectAccountStore', () => {
  return () => ({
    currentAccount: { id: 'test-account-123' }
  })
})

const mockFetchCreate = vi.fn(() => ({}))

global.$fetch = {
  create: mockFetchCreate
} as any

describe('businessApi Nuxt Plugin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a $fetch instance with the correct baseURL', () => {
    const mockNuxtApp = {
      $config: {
        public: {
          businessApiUrl: 'http://api.local',
          businessApiVersion: '/v1',
          appName: 'TestApp',
          xApiKey: 'test-api-key'
        }
      },
      provide: vi.fn()
    }

    businessApiPlugin(mockNuxtApp as any)

    expect(mockFetchCreate).toHaveBeenCalledOnce()
    // @ts-expect-error - complex type not resolved
    const createOptions = mockFetchCreate.mock.calls[0][0]
    // @ts-expect-error - complex type not resolved
    expect(createOptions.baseURL).toBe('http://api.local/v1')
  })

  it('should set all required headers in the onRequest hook', async () => {
    const mockNuxtApp = {
      $config: {
        public: {
          businessApiUrl: 'http://api.local',
          businessApiVersion: '/v1',
          appName: 'TestApp',
          xApiKey: 'test-api-key'
        }
      },
      provide: vi.fn()
    }

    businessApiPlugin(mockNuxtApp as any)

    // @ts-expect-error - complex type not resolved
    const onRequestHook = mockFetchCreate.mock.calls[0][0].onRequest

    const mockRequestContext = {
      options: {
        headers: new Map()
      }
    }
    await onRequestHook(mockRequestContext as any)

    const headers = mockRequestContext.options.headers
    expect(headers.get('Authorization')).toBe('Bearer mock-jwt-token')
    expect(headers.get('App-Name')).toBe('TestApp')
    expect(headers.get('X-Apikey')).toBe('test-api-key')
    expect(headers.get('Account-Id')).toBe('test-account-123')
  })

  it('should provide the created api instance as $businessApi', () => {
    const mockNuxtApp = {
      $config: {
        public: {
          businessApiUrl: 'http://api.local',
          businessApiVersion: '/v1',
          appName: 'TestApp',
          xApiKey: 'test-api-key'
        }
      }
    }

    const pluginResult = businessApiPlugin(mockNuxtApp as any)

    expect(pluginResult).toBeDefined()
    expect(pluginResult).toHaveProperty('provide')

    if (pluginResult && 'provide' in pluginResult) {
      expect(pluginResult.provide).toHaveProperty('businessApi')
      expect(pluginResult.provide!.businessApi).toEqual(mockFetchCreate())
    } else {
      expect.fail('Plugin didnt return "Provide"')
    }
  })
})
