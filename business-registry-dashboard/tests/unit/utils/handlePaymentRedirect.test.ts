import { vi, describe, expect, it } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { handlePaymentRedirect } from '~/utils/handlePaymentRedirect'

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

mockNuxtImport('useRuntimeConfig', () => {
  return () => (
    {
      public: {
        paymentPortalUrl: 'https://paymentportal.com/',
        baseUrl: 'https://baseurl.com/'
      }
    }
  )
})

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }))
mockNuxtImport('navigateTo', () => navigateToMock)

describe('handlePaymentRedirect', () => {
  it('should call navigateTo with the correct url', async () => {
    await handlePaymentRedirect(123, 456)
    const returnUrl = encodeURIComponent('https://baseurl.com/en-CA/submitted?filing_id=456')
    const payUrl = 'https://paymentportal.com/' + '123' + '/' + returnUrl
    expect(vi.mocked(navigateTo)).toBeCalledWith(payUrl, {
      external: true
    })
  })
})
