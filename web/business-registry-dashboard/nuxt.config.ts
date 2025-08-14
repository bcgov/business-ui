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
    '/en-CA': { redirect: '/' },
    // Static assets: cache aggressively since they have content hashes
    '/**/*.js': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
    '/**/*.css': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
    '/**/*.@(png|jpg|jpeg|gif|svg|ico|webp|avif|woff|woff2|ttf|eot)': {
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }
    },
    // HTML pages: no cache to ensure fresh content
    '/**': {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0'
      }
    }
  },

  modules: [
    '@nuxtjs/eslint-module',
    '@nuxt/test-utils/module',
    '@nuxt/image',
    '@zadigetvoltaire/nuxt-gtm',
    'nuxt-gtag',
    'nuxt-lodash'
  ],

  extends: ['@daxiom/nuxt-core-layer-test'],

  imports: {
    dirs: ['stores', 'composables', 'enums', 'interfaces', 'types', 'utils', 'services']
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
        'mdi:phone',
        'mdi:email',
        'mdi:arrow-left',
        'heroicons:arrow-path-20-solid',
        'heroicons:circle-stack-20-solid',
        'heroicons:check-20-solid',
        'heroicons:chevron-down-20-solid',
        'heroicons:chevron-right-20-solid',
        'heroicons:chevron-left-20-solid'
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
    strategy: 'prefix_except_default',
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

  gtm: {
    enabled: !!process.env.NUXT_GTM_ID?.trim(),
    id: process.env.NUXT_GTM_ID?.trim() || 'GTM-DUMMY', // the dummy value allows app to run if GTM ID could not be loaded
    debug: true,
    defer: true
  },

  gtag: {
    enabled: !!process.env.NUXT_GTAG_ID?.trim(),
    id: process.env.NUXT_GTAG_ID?.trim()
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
      appName: 'Business Registry Dashboard',
      version: `Business Registry Dashboard v${process.env.npm_package_version}`,
      ldClientId: process.env.NUXT_LD_CLIENT_ID || '',
      nrURL: process.env.NUXT_NAME_REQUEST_URL || '',
      oneStopUrl: process.env.NUXT_ONE_STOP_URL,
      societiesUrl: process.env.NUXT_APP_SOCIETIES_URL,
      corpFormsUrl: process.env.NUXT_APP_CORP_FORMS_URL,
      llpFormsUrl: process.env.NUXT_APP_LLP_FORMS_URL,
      lpFormsUrl: process.env.NUXT_APP_LP_FORMS_URL,
      xlpFormUrl: process.env.NUXT_APP_XLP_FORMS_URL,
      businessDashUrl: process.env.NUXT_BUSINESS_DASH_URL,
      corpOLUrl: process.env.NUXT_CORPORATE_ONLINE_URL,
      authApiGwUrl: `${process.env.NUXT_AUTH_API_GW_URL}${process.env.NUXT_AUTH_API_VERSION}`,
      authApiKey: process.env.NUXT_AUTH_API_KEY,
      legalApiUrl: `${process.env.NUXT_LEGAL_API_URL}${process.env.NUXT_LEGAL_API_VERSION}`,
      businessApiGwUrl: `${process.env.NUXT_BUSINESS_API_GW_URL}${process.env.NUXT_BUSINESS_API_VERSION_2}`,
      businessApiKey: process.env.NUXT_BUSINESS_API_KEY,
      regSearchApiUrl: `${process.env.NUXT_REGISTRIES_SEARCH_API_URL}${process.env.NUXT_REGISTRIES_SEARCH_API_VERSION}`,
      xApiKey: process.env.NUXT_X_API_KEY,
      namexApiGwUrl: `${process.env.NUXT_NAMEX_API_GW_URL}${process.env.NUXT_NAMEX_API_VERSION}`,
      namexApiKey: process.env.NUXT_NAMEX_API_KEY,
      authWebUrl: process.env.NUXT_AUTH_WEB_URL,
      registriesSearchApiKey: process.env.NUXT_REGISTRIES_SEARCH_API_KEY,
      stepsToRestoreUrl: process.env.NUXT_STEPS_TO_RESTORE_URL
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

  // Ensure proper cache busting for assets
  experimental: {
    payloadExtraction: false
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
