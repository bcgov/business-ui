import { vi, describe, expect, it } from 'vitest'
import { renderSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { fireEvent, screen } from '@testing-library/vue'
import { SbcFeeWidget } from '#components'
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

// array of PayFeesWidgetItem fees
const payFeesWidgetItems = [
  {
    uiUuid: '1',
    filingFees: 100,
    filingType: 'Type 1',
    filingTypeCode: 'BCANN',
    futureEffectiveFees: 50,
    priorityFees: 75,
    processingFees: 25,
    serviceFees: 30,
    tax: {
      gst: 5,
      pst: 7
    },
    total: 280
  },
  {
    uiUuid: '2',
    filingFees: 150,
    filingType: 'Type 2',
    filingTypeCode: 'REGSIGIN',
    futureEffectiveFees: 60,
    priorityFees: 80,
    processingFees: 35,
    serviceFees: 40,
    tax: {
      gst: 5,
      pst: 7
    },
    total: 415
  }
]

describe('<SbcFeeWidget />', () => {
  it('mounts', async () => {
    const component = await renderSuspended(SbcFeeWidget, {
      global: {
        plugins: [enI18n]
      },
      props: {
        fees: payFeesWidgetItems
      }
    })

    expect(component).toBeTruthy()
  })

  it('displays fee data', async () => {
    await renderSuspended(SbcFeeWidget, {
      global: {
        plugins: [enI18n]
      },
      props: {
        fees: payFeesWidgetItems
      }
    })

    expect(screen.getByText('CAD')).toBeDefined()
    expect(screen.getByText(/\$695/)).toBeDefined()
  })

  // submit not being emitted in test, but works in prod
  it('emits submit event when clicking submit button', async () => {
    const component = await renderSuspended(SbcFeeWidget, {
      global: {
        plugins: [enI18n]
      },
      props: {
        fees: payFeesWidgetItems
      }
    })

    const button = screen.getByText('Submit & Pay')
    await fireEvent.click(button)

    expect(component.emitted('submit')).toBeTruthy()
  })
})
