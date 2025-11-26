import { createI18n } from 'vue-i18n'
import en from '~~/i18n/locales/en-CA'

export const enI18n = createI18n({
  locale: 'en-CA',
  messages: {
    'en-CA': en
  }
})
