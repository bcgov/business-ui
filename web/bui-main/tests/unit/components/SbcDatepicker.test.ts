import { vi, describe, expect, it } from 'vitest'
import { renderSuspended, mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import VueDatePicker from '@vuepic/vue-datepicker'
import { fireEvent, screen, waitFor } from '@testing-library/vue'
import { SbcDatePicker } from '#components'
import { enI18n } from '~/tests/mocks/i18n'

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

describe('<SbcDatePicker/>', () => {
  it('mounts', async () => {
    const component = await renderSuspended(SbcDatePicker, {
      global: {
        plugins: [enI18n]
      },
      props: {
        inputVariant: 'bcGov'
      }
    })

    expect(component).toBeTruthy()
  })

  it('renders the datepicker', async () => {
    const component = await mountSuspended(SbcDatePicker, {
      global: {
        plugins: [enI18n]
      },
      props: {
        inputVariant: 'bcGov'
      }
    })
    expect(component.findComponent(VueDatePicker).exists()).toBe(true)
  })

  it('selecting a datepicker value updates the dateModel', async () => {
    await renderSuspended(SbcDatePicker, {
      global: {
        plugins: [enI18n]
      },
      props: {
        inputVariant: 'bcGov',
        maxDate: new Date(),
        minDate: null,
        placeholder: 'Test Placeholder',
        arialabel: 'Test Arialabel'
      }
    })

    const today = new Date() // get todays date

    // datepicker should be hidden by default
    const popupBefore = screen.queryByRole('grid')
    expect(popupBefore).toBeNull()

    // select input to open datepicker
    const input = screen.getByLabelText('Test Arialabel')
    expect(input).toBeTruthy()
    await fireEvent.click(input)

    // datepicker should now be visible
    const popupAfter = screen.getByRole('grid')
    expect(popupAfter).toBeDefined()

    // select todays date in datepicker
    const gridcell = screen.getByText(today.getDate())
    await fireEvent.click(gridcell)

    // wait for and assert datepicker is now closed
    await waitFor(() => {
      expect(screen.queryByRole('grid')).toBeNull()
    })

    // assert input value is the same as the selected date on the datepicker
    expect((input as HTMLInputElement).value).toBe(dateToString(today, 'YYYY-MM-DD'))
  })
})
