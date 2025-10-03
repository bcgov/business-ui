// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: '2025-08-25',

  ssr: false,

  devtools: { enabled: false },

  css: [
    '~/assets/css/tw.css',
    '~/assets/css/default.css'
  ],

  modules: [
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
    'nuxt-anchorscroll'
  ],

  extends: [
    '@sbc-connect/nuxt-business-base'
  ],

  router: {
    options: {
      scrollBehaviorType: 'smooth'
    }
  },

  routeRules: {
    '/': { redirect: '/en-CA' },
    '/en-CA': { redirect: '/en-CA/undefined' },
    '/fr-CA': { prerender: false, redirect: '/fr-CA/undefined' },
    '/fr-CA/**': { prerender: false }
  },

  imports: {
    dirs: [
      'stores',
      'composables',
      'enums',
      'interfaces',
      'types',
      'utils'
    ]
  },

  i18n: {
    locales: [
      {
        name: 'English',
        code: 'en-CA',
        language: 'en-CA',
        dir: 'ltr',
        file: 'en-CA.ts'
      },
      {
        name: 'Français',
        code: 'fr-CA',
        language: 'fr-CA',
        dir: 'ltr',
        file: 'fr-CA.ts'
      }
    ]
  },

  // full options
  // https://github.com/eslint-stylistic/eslint-stylistic/blob/main/packages/eslint-plugin/configs/customize.ts#L16
  eslint: {
    config: {
      stylistic: {
        indent: 2,
        semi: false,
        commaDangle: 'never',
        jsx: false,
        quotes: 'single'
      }
    }
  },

  runtimeConfig: {
    public: {
      preexistingCompanyProvisions: '',
      playwright: process.env.playwright === 'true'
    }
  }
})
