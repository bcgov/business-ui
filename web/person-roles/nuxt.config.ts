// https://nuxt.com/docs/api/configuration/nuxt-config

import { createResolver } from 'nuxt/kit'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  ssr: false,

  devtools: { enabled: false },

  app: {
    head: {
      link: [
        { rel: 'stylesheet', href: '/css/addresscomplete-2.50.min.css' }
      ],
      script: [
        { src: '/js/addresscomplete-2.50.min.js', type: 'text/javascript', defer: true }
      ]
    }
  },

  css: [
    '~/assets/css/tw.css'
  ],

  modules: [
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
    'nuxt-lodash'
  ],

  extends: [
    '@bcreg/nuxt-base'
  ],

  router: {
    options: {
      scrollBehaviorType: 'smooth'
    }
  },

  routeRules: {
    '/': { redirect: '/en-CA' },
    '/en-CA': { redirect: '/en-CA/officer-change' },
    '/en-CA/officer-change': { redirect: '/en-CA/officer-change/undefined' }, // if no slug redirect to undefined, this will display error modal instead of 404 page
    '/fr-CA': { prerender: false, redirect: '/fr-CA/officer-change' },
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
    ],
    strategy: 'prefix',
    lazy: true,
    langDir: 'locales',
    defaultLocale: 'en-CA',
    detectBrowserLanguage: false,
    vueI18n: resolve('./i18n.config.ts'),
    bundle: {
      onlyLocales: ['en-CA'], // disable fr-CA
      optimizeTranslationDirective: false // we recommend disabling this feature as it causes issues and will be deprecated in v10.
    }
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

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2024-11-27',

  runtimeConfig: {
    public: {
      version: `Person Roles UI v${process.env.npm_package_version || ''}`,
      addressCompleteKey: process.env.NUXT_ADDRESS_COMPLETE_KEY,
      legalApiUrl: `${process.env.NUXT_LEGAL_API_URL}${process.env.NUXT_LEGAL_API_VERSION}`,
      businessDashboardUrl: process.env.NUXT_BUSINESS_DASHBOARD_URL,
      registryHomeUrl: process.env.NUXT_REGISTRY_HOME_URL,
      brdUrl: process.env.NUXT_BUSINESS_REGISTRY_DASHBOARD_URL,
      xApiKey: process.env.NUXT_X_APIKEY
    }
  }
})
