// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  ssr: true,

  future: {
    compatibilityVersion: 4
  },

  nitro: {
    prerender: {
      routes: []
    }
  },

  routeRules: {
    '/': { redirect: '/en-CA' }
  },

  modules: [
    '@nuxtjs/eslint-module',
    '@nuxt/test-utils/module',
    '@nuxt/image'
  ],

  extends: ['@daxiom/nuxt-core-layer-test'],

  imports: {
    dirs: ['stores', 'composables', 'enums', 'interfaces', 'types', 'utils']
  },

  icon: {
    clientBundle: {
      icons: [
        'mdi:bell-outline',
        'mdi:help-circle-outline',
        'mdi:alert',
        'mdi:domain',
        'mdi:web',
        'mdi:check',
        'mdi:magnify',
        'mdi:open-in-new',
        'mdi:calendar',
        'mdi:close',
        'mdi:info-outline',
        'mdi:delete',
        'mdi:format-list-bulleted-square',
        'mdi:delete-forever',
        'mdi:window-close',
        'mdi:checkbox-multiple-blank-outline',
        'mdi:caret-down',
        'mdi:account-cog',
        'mdi:information-outline',
        'mdi:account-group-outline',
        'mdi:account-outline',
        'mdi:logout-variant',
        'mdi:plus',
        'mdi:menu',
        'mdi:two-factor-authentication',
        'mdi:account-card-details-outline',
        'mdi:new-box',
        'mdi:file-document-outline',
        'mdi:alert-circle-outline',
        'mdi:refresh',
        'heroicons:arrow-path-20-solid',
        'heroicons:circle-stack-20-solid',
        'heroicons:check-20-solid',
        'heroicons:chevron-down-20-solid'
      ]
    }
  },

  i18n: {
    locales: [
      {
        name: 'English',
        code: 'en-CA',
        iso: 'en-CA',
        dir: 'ltr',
        file: 'en-CA.ts'
      },
      {
        name: 'Français',
        code: 'fr-CA',
        iso: 'fr-CA',
        dir: 'ltr',
        file: 'fr-CA.ts'
      }
    ],
    strategy: 'prefix',
    lazy: true,
    langDir: 'locales',
    defaultLocale: 'en-CA',
    detectBrowserLanguage: false,
    vueI18n: './i18n.config.ts'
  },

  colorMode: {
    preference: 'light',
    fallback: 'light'
  },

  runtimeConfig: {
    public: {
      // Keys within public, will be also exposed to the client-side
      payApiURL: `${process.env.NUXT_PAY_API_URL || ''}${process.env.NUXT_PAY_API_VERSION || ''}`,
      registryHomeURL: process.env.NUXT_REGISTRY_HOME_URL,
      appURL: process.env.NUXT_APP_URL,
      paymentPortalUrl: process.env.NUXT_PAYMENT_PORTAL_URL,
      baseUrl: process.env.NUXT_BASE_URL,
      environment: process.env.NUXT_ENVIRONMENT_HEADER || '',
      version: `BRD UI v${process.env.npm_package_version}`,
      ldClientId: process.env.NUXT_LD_CLIENT_ID || '',
      nrURL: process.env.NUXT_NAME_REQUEST_URL || '',
      oneStopUrl: process.env.NUXT_ONE_STOP_URL,
      societiesUrl: process.env.NUXT_APP_SOCIETIES_URL,
      corpFormsUrl: process.env.NUXT_APP_CORP_FORMS_URL,
      llpFormsUrl: process.env.NUXT_APP_LLP_FORMS_URL,
      lpFormsUrl: process.env.NUXT_APP_LP_FORMS_URL,
      xlpFormUrl: process.env.NUXT_APP_XLP_FORMS_URL,
      businessUrl: process.env.NUXT_DASHBOARD_URL,
      corpOLUrl: process.env.NUXT_CORPORATE_ONLINE_URL,
      legalApiUrl: `${process.env.NUXT_LEGAL_API_URL}${process.env.NUXT_LEGAL_API_VERSION}`,
      regSearchApiUrl: `${process.env.NUXT_REGISTRIES_SEARCH_API_URL}${process.env.NUXT_REGISTRIES_SEARCH_API_VERSION}`,
      xApiKey: process.env.NUXT_X_API_KEY,
      namexApiUrl: `${process.env.NUXT_NAMEX_API_URL}${process.env.NUXT_NAMEX_API_VERSION}`
    }
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "../assets/styles/theme.scss" as *;'
        }
      }
    },
    optimizeDeps: { // optimize immediately instead of after visiting page, prevents page reload in dev when initially visiting a page with these deps
      include: ['zod', 'uuid', 'vitest']
    }
  },

  build: {
    transpile: ['@vuepic/vue-datepicker']
  },

  piniaPersistedstate: {
    storage: 'sessionStorage'
  },

  content: {
    locales: [
      'en-CA',
      'fr-CA'
    ],
    contentHead: false,
    markdown: {
      anchorLinks: false
    }
  }
  // compatibilityDate: '2024-07-03' add compatibility date?
})
