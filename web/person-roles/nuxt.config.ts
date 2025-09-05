// https://nuxt.com/docs/api/configuration/nuxt-config

// import { createResolver } from 'nuxt/kit'

// const { resolve } = createResolver(import.meta.url)

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
    langDir: 'locales'
  },

  compatibilityDate: '2024-11-27',

  runtimeConfig: {
    public: {
      version: `Person Roles UI v${process.env.npm_package_version || ''}`,
      ci: process.env.CI === 'true'
    }
  }
})
