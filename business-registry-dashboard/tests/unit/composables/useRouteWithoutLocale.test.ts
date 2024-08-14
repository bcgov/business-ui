import { describe, expect, it } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

mockNuxtImport('useRoute', () => {
  return () => (
    {
      path: '/en-CA/route-without-locale'
    }
  )
})

describe('useRouteWithoutLocale', () => {
  it('removes locale prefix from route', () => {
    const routeWithoutLocale = useRouteWithoutLocale()
    expect(routeWithoutLocale.value).toEqual('/route-without-locale')
  })

  it('returns a ref', () => {
    const routeWithoutLocale = useRouteWithoutLocale()
    expect(isRef(routeWithoutLocale)).toBe(true)
  })
})
