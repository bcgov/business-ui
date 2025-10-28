// https://nuxt.com/docs/api/configuration/nuxt-config
// import { createResolver } from 'nuxt/kit'

// const { resolve } = createResolver(import.meta.url)
export default defineNuxtConfig({
  ssr: false,

  devtools: { enabled: false },

  compatibilityDate: '2025-08-25',

  imports: {
    dirs: ['interfaces', 'types', 'enums', 'stores']
  },

  typescript: {
    includeWorkspace: true // required for ts to recognize autoimports in test files
  },

  extends: [
    // "@sbc-connect/nuxt-core-layer-beta": "^0.0.13",
    // '@sbc-connect/nuxt-core-layer-beta',
    '@sbc-connect/nuxt-pay',
    '@sbc-connect/nuxt-forms'
  ],

  modules: [],

  // For more details on i18n in layers: https://i18n.nuxtjs.org/docs/guide/layers
  // For more details on config: https://i18n.nuxtjs.org/docs/api/options
  i18n: {
    langDir: 'locales',
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

  icon: {
    clientBundle: {
      icons: []
    }
  },

  runtimeConfig: {
    public: {
      businessApiUrl: '',
      businessApiVersion: '',
      businessDashboardUrl: '',
      brdUrl: '',
      businessEditUrl: '',
      docApiUrl: '',
      docApiVersion: '',
      docApiKey: '',
      documentsUiUrl: '',
      noticeOfWithdrawalFormUrl: ''
    }
  }
})
