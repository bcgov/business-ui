import { describe, expect, it } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { useSbcNav } from '#imports'

mockNuxtImport('useI18n', () => {
  return () => (
    {
      locale: 'en-CA',
      locales: ref([
        {
          name: 'English',
          code: 'en-CA',
          iso: 'en-CA',
          dir: 'ltr',
          file: 'en-CA.ts'
        }
      ]),
      t: (key: string) => key
    }
  )
})

describe('useSbcNav', () => {
  it('should return an object with mainLinks and loggedInUserOptions properties', () => {
    const result = useSbcNav()

    expect(result).toHaveProperty('mainLinks')
    expect(result).toHaveProperty('loggedInUserOptions')
  })
})
