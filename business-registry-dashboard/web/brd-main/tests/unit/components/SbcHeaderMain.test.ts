import { describe, expect, it } from 'vitest'
import { renderSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { screen } from '@testing-library/vue'
import { SbcHeaderMain } from '#components'
import { enI18n } from '~/tests/mocks/i18n'
import en from '~/locales/en-CA'

// Function to access nested properties by dot-separated key
const getTranslationByKey = (key: string): any => {
  const keys = key.split('.')
  let value = en as Record<string, any>

  // join nested string dot notations by square brackets to index en object
  for (const key of keys) {
    if (!value || typeof value !== 'object') {
      return undefined
    }
    value = value[key]
  }

  // return value
  return value.body.static
}

// fails without custom query by t function
mockNuxtImport('useI18n', () => {
  return () => (
    {
      locale: 'en-CA',
      locales: ref([
        {
          name: 'English',
          code: 'en-CA',
          iso: 'en-CA',
          dir: 'ltr',
          file: 'en-CA.ts'
        }
      ]),
      t: (key: string) => getTranslationByKey(key)
    }
  )
})

describe('<SbcHeaderMain/>', () => {
  it('mounts', async () => {
    const component = await renderSuspended(SbcHeaderMain, {
      global: {
        mocks: {
          $colorMode: { preference: 'light' }
        },
        plugins: [enI18n]
      }
    })

    expect(component).toBeTruthy()
  })

  it('renders header links', async () => {
    await renderSuspended(SbcHeaderMain, {
      global: {
        mocks: {
          $colorMode: { preference: 'light' }
        },
        plugins: [enI18n]
      }
    })

    const linkTexts = ['Service BC Connect']

    linkTexts.forEach((link: string) => {
      expect(screen.getByText(link)).toBeTruthy()
    })
  })

  it('renders logo locale select menu', async () => {
    await renderSuspended(SbcHeaderMain, {
      global: {
        mocks: {
          $colorMode: { preference: 'light' }
        },
        plugins: [enI18n]
      }
    })

    const logo = screen.getAllByAltText('Government of British Columbia Logo')
    expect(logo).toBeTruthy()

    const localeSelectMenu = screen.getByLabelText('Select a Language, current language: English')
    expect(localeSelectMenu).toBeTruthy()
  })
})
