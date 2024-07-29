import { vi, describe, expect, it } from 'vitest'
import { mountSuspended, renderSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { fireEvent, screen } from '@testing-library/vue'
import { LocaleSelect } from '#components'
import { enI18n } from '~/tests/mocks/i18n'
// import en from '~/locales/en-CA'

const setLocaleMock = vi.fn()

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
        },
        {
          name: 'French',
          code: 'fr-CA',
          iso: 'fr-CA',
          dir: 'ltr',
          file: 'fr-CA.ts'
        }
      ]),
      t: (key: string) => key,
      setLocale: setLocaleMock
    }
  )
})

describe('<LocaleSelect/>', () => {
  it('mounts', async () => {
    const component = await renderSuspended(LocaleSelect, {
      global: {
        plugins: [enI18n]
      }
    })

    expect(component).toBeTruthy()
  })

  it('can open the dropdown', async () => {
    const component = await renderSuspended(LocaleSelect, {
      global: {
        plugins: [enI18n]
      }
    })

    // menuitem hidden by default
    const menuitemStart = component.queryByRole('menuitem')
    expect(menuitemStart).toEqual(null)

    // click buttton to open menu
    const button = screen.getByLabelText('Select a Language, current language: English')
    await fireEvent.click(button)

    // menutiem should now be in the dom
    const menuitemEnd = screen.getAllByRole('menuitem')
    expect(menuitemEnd).toBeTruthy()
  })

  it('can change the locale value', async () => {
    await renderSuspended(LocaleSelect, {
      global: {
        plugins: [enI18n]
      }
    })

    // click buttton to open menu
    const button = screen.getByLabelText('Select a Language, current language: English')
    await fireEvent.click(button)

    // click 'french' in dropdown menu
    const button2 = screen.getByText('French')
    await fireEvent.click(button2)

    // locale should now be fr-CA
    expect(setLocaleMock).toHaveBeenCalledOnce()
    expect(setLocaleMock).toHaveBeenCalledWith('fr-CA')
  })

  it('computed returns correct items for dropdown', async () => {
    const component = await mountSuspended(LocaleSelect, {
      global: {
        plugins: [enI18n]
      }
    })

    // @ts-ignore // cant find items in component instance
    const computedItems = component.vm.items

    const expectedItems = [
      [
        { label: 'English', icon: '', click: expect.any(Function) },
        { label: 'French', icon: '', click: expect.any(Function) }
      ]
    ]

    expect(computedItems).toEqual(expectedItems)
  })
})
