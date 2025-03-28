import { config } from '@vue/test-utils'
import { enI18n as i18nMock } from '~~/tests/mocks/i18n'

config.global.plugins.push(i18nMock)
