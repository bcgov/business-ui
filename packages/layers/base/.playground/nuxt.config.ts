export default defineNuxtConfig({
  extends: ['..'],
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
  }
})
