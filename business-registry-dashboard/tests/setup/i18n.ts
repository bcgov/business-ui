import { config } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import en from '~/app/locales/en-CA'

export const mockedI18n = createI18n({
  locale: 'en-CA',
  messages: {
    'en-CA': en
  }
})

config.global.plugins = [mockedI18n]
