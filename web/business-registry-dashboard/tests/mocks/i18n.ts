import { createI18n } from 'vue-i18n'
import en from '~~/app/locales/en-CA'
import fr from '~~/app/locales/fr-CA'

export const enI18n = createI18n({
  legacy: false,
  locale: 'en-CA',
  messages: {
    'en-CA': en
  }
})

export const frI18n = createI18n({
  legacy: false,
  locale: 'fr-CA',
  messages: {
    'fr-CA': fr
  }
})

export const randomI18n = createI18n({
  legacy: false,
  locale: 'ja',
  messages: {
    ja: en
  }
})
