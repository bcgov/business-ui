// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  ssr: false,

  devtools: { enabled: false },

  modules: [
    '@nuxt/test-utils/module'
  ],

  extends: [
    '@sbc-connect/nuxt-business-base'
  ],

  router: {
    options: {
      scrollBehaviorType: 'smooth'
    }
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
    langDir: 'locales'
  },

  compatibilityDate: '2025-12-11',

  runtimeConfig: {
    public: {
      version: `Business Dashboard UI v${process.env.npm_package_version || ''}`,
      playwright: process.env.playwright === 'true',
      // urls the layers do not declare
      businessCorpsUrl: '',
      businessCreateUrl: '',
      businessFilingsUrl: '',
      personRolesUrl: ''
    }
  },

  typescript: {
    tsConfig: {
      exclude: [
        '../../business-registry-dashboard/**',
        '../../coops/**',
        '../../corps/**',
        '../../person-roles/**',
        '../../registry-home/**',
        '../../../packages/layers/base/tests/**'
      ]
    }
  }
})
