import { createI18n } from 'vue-i18n'
import { merge } from 'lodash'
import en from '~~/i18n/locales/en-CA'
import coreEn from '#core/i18n/locales/en-CA'

export const enI18n = createI18n({
  legacy: false,
  locale: 'en-CA',
  messages: {
    'en-CA': merge(coreEn, en)
  }
})
