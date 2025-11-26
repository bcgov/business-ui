import { config } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import en from '~~/i18n/locales/en-CA'
import fr from '~~/i18n/locales/fr-CA'

export const mockedI18n = createI18n({
  locale: 'en-CA',
  messages: {
    'en-CA': en,
    'fr-CA': fr
  }
})

config.global.plugins = [mockedI18n]
