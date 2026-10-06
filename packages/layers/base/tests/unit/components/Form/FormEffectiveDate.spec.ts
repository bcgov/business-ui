import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { FormEffectiveDate, FormEffectiveDateRange } from '#components'
import type { DateBounds, EffectiveDateSchema } from '#business/app/utils/schemas/effective-date'
import { DATE_API_INPUT_FORMAT, DATE_DISPLAY_FORMAT } from '#base/app/utils/schemas/date'
import { DateTime } from 'luxon'

const VALID_API_DATE = '2024-03-15'
const VALID_DISPLAY_DATE = DateTime.fromFormat(VALID_API_DATE, DATE_API_INPUT_FORMAT).toFormat(DATE_DISPLAY_FORMAT) // 'March 15, 2024'

const mountComponent = (modelValue: EffectiveDateSchema = { dateInput: '' }) => {
  return mountSuspended(FormEffectiveDate, {
    props: {
      modelValue,
      'onUpdate:modelValue': (val: EffectiveDateSchema) => {
        modelValue.dateInput = val.dateInput
      }
    }
  })
}

describe('FormEffectiveDate', () => {
  it('should render the effective date input', async () => {
    const wrapper = await mountComponent()
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('should display an existing date value in display format', async () => {
    const wrapper = await mountComponent({ dateInput: VALID_API_DATE })
    const input = wrapper.find<HTMLInputElement>('input')
    expect(input.element.value).toBe(VALID_DISPLAY_DATE)
  })

  it('should update the model in API format after valid input', async () => {
    const model: EffectiveDateSchema = { dateInput: '' }
    const wrapper = await mountComponent(model)

    const input = wrapper.find<HTMLInputElement>('input')
    vi.useFakeTimers()
    await input.setValue(VALID_DISPLAY_DATE)
    await vi.runAllTimersAsync()
    await flushPromises()
    vi.useRealTimers()

    expect(model.dateInput).toBe(VALID_API_DATE)
  })

  it('should normalize alternate date formats to display format on input', async () => {
    const model: EffectiveDateSchema = { dateInput: '' }
    const wrapper = await mountComponent(model)

    const input = wrapper.find<HTMLInputElement>('input')
    vi.useFakeTimers()
    // Abbreviated month format — should be normalized to full display format
    await input.setValue('Mar 15, 2024')
    await vi.runAllTimersAsync()
    await flushPromises()
    vi.useRealTimers()

    expect(model.dateInput).toBe(VALID_API_DATE)
  })

  it('should pass an invalid date through to the model as-is for schema validation to catch', async () => {
    const model: EffectiveDateSchema = { dateInput: '' }
    const wrapper = await mountComponent(model)

    const input = wrapper.find<HTMLInputElement>('input')
    await input.setValue('not a date')
    await input.trigger('blur')
    await flushPromises()

    expect(model.dateInput).toBe('not a date')
  })

  const setDate = async (wrapper: Awaited<ReturnType<typeof mountComponent>>, value: string) => {
    vi.useFakeTimers()
    await wrapper.find<HTMLInputElement>('input').setValue(value)
    await vi.runAllTimersAsync()
    await flushPromises()
    vi.useRealTimers()
  }

  const mountWithBounds = (bounds: DateBounds) => {
    const model: EffectiveDateSchema = { dateInput: '' }
    return mountSuspended(FormEffectiveDate, {
      props: {
        'modelValue': model,
        'onUpdate:modelValue': (val: EffectiveDateSchema) => {
          model.dateInput = val.dateInput
        },
        bounds
      }
    })
  }

  it('should show the default message when the date is outside a bound without a message', async () => {
    const wrapper = await mountWithBounds({ min: { date: VALID_API_DATE } })
    await setDate(wrapper, 'Mar 1, 2024')
    expect(wrapper.text()).toContain(`Date must be on or after ${VALID_DISPLAY_DATE}`)
  })

  it.each([
    ['before the min bound', 'Mar 1, 2024', 'Before founding.'],
    ['after the max bound', 'Mar 30, 2024', 'Too late.']
  ])('should show the bound\'s custom message when the date is %s', async (_, input, expected) => {
    const wrapper = await mountWithBounds({
      min: { date: VALID_API_DATE, message: 'Before founding.' },
      max: { date: '2024-03-20', message: 'Too late.' }
    })
    await setDate(wrapper, input)
    expect(wrapper.text()).toContain(expected)
  })

  it('should not show a bound error when the date is within the bounds', async () => {
    const wrapper = await mountWithBounds({
      min: { date: VALID_API_DATE, message: 'Before founding.' },
      max: { date: '2024-03-20', message: 'Too late.' }
    })
    await setDate(wrapper, 'Mar 19, 2024')
    expect(wrapper.text()).not.toContain('Before founding.')
    expect(wrapper.text()).not.toContain('Too late.')
  })

  it('should ignore a bound without a date', async () => {
    const wrapper = await mountWithBounds({ min: { date: undefined, message: 'Before founding.' } })
    await setDate(wrapper, 'Mar 1, 2024')
    expect(wrapper.text()).not.toContain('Before founding.')
  })
})

describe('FormEffectiveDateRange', () => {
  // hint text that is shown on screen (each input also has a screen-reader-only copy)
  const visibleHintCount = (wrapper: { findAll: (selector: string) => { text: () => string }[] }, text: string) =>
    wrapper.findAll('p:not(.sr-only)').filter(p => p.text() === text).length

  const mountRange = (start: EffectiveDateSchema = { dateInput: '' }, end: EffectiveDateSchema = { dateInput: '' }) => {
    return mountSuspended(FormEffectiveDateRange, {
      props: {
        start,
        end,
        description: 'Range description',
        startRequired: true
      }
    })
  }

  it('should show the format hint once for both date fields', async () => {
    const wrapper = await mountRange()
    const formatHint = useNuxtApp().$i18n.t('text.effectiveDateFormat')
    expect(visibleHintCount(wrapper, formatHint)).toBe(1)
  })

  it('should link the format hint to each date input via aria-describedby', async () => {
    const wrapper = await mountRange()
    const formatHint = useNuxtApp().$i18n.t('text.effectiveDateFormat')

    const inputs = wrapper.findAll('input')
    expect(inputs).toHaveLength(2)
    for (const input of inputs) {
      const describedByIds = input.attributes('aria-describedby')?.split(' ') ?? []
      const descriptions = describedByIds.map(id => wrapper.find(`[id="${id}"]`).text())
      expect(descriptions).toContain(formatHint)
    }
  })

  it('should show a field\'s error without the format hint', async () => {
    const wrapper = await mountRange()
    const { t } = useNuxtApp().$i18n

    await wrapper.vm.startFormRef?.validate().catch(() => {})
    await flushPromises()

    const startHint = wrapper.find('[id^="effective-date-hint-"]')
    expect(startHint.exists()).toBe(true)
    expect(startHint.text()).toBe(t('validation.dateRequired'))
    // the shared format hint is still shown once below the fields
    expect(visibleHintCount(wrapper, t('text.effectiveDateFormat'))).toBe(1)
  })

  describe('start/end order', () => {
    // keeps the v-models in sync like a parent would, so each field sees the other's new value
    const mountSyncedRange = async (start: string, end: string) => {
      const wrapper = await mountSuspended(FormEffectiveDateRange, {
        props: {
          'start': { dateInput: start },
          'end': { dateInput: end },
          'description': 'Range description',
          'onUpdate:start': (val: EffectiveDateSchema) => wrapper.setProps({ start: val }),
          'onUpdate:end': (val: EffectiveDateSchema) => wrapper.setProps({ end: val })
        }
      })
      return wrapper
    }

    const setInput = async (wrapper: Awaited<ReturnType<typeof mountSyncedRange>>, index: number, value: string) => {
      vi.useFakeTimers()
      await wrapper.findAll<HTMLInputElement>('input')[index]!.setValue(value)
      await vi.runAllTimersAsync()
      await flushPromises()
      vi.useRealTimers()
    }

    // only fields with an error render a hint (the format hint is shown once by the range)
    const fieldErrors = (wrapper: Awaited<ReturnType<typeof mountSyncedRange>>) =>
      wrapper.findAll('[id^="effective-date-hint-"]').map(hint => hint.text())
    const rangeError = (wrapper: Awaited<ReturnType<typeof mountSyncedRange>>) =>
      wrapper.find('[data-testid="effective-date-range-error"]')
    const ORDER_ERROR = 'The start date must be on or before the end date'

    it.each([
      ['start date is moved after the end date', 0, 'Mar 20, 2024'],
      ['end date is moved before the start date', 1, 'Mar 5, 2024']
    ])('should show the order error once below both fields when the %s', async (_, index, value) => {
      const wrapper = await mountSyncedRange('2024-03-10', '2024-03-15')
      await setInput(wrapper, index, value)

      expect(rangeError(wrapper).text()).toBe(ORDER_ERROR)
      expect(fieldErrors(wrapper)).toEqual([])
      // replaces the shared format hint
      expect(wrapper.text()).not.toContain(useNuxtApp().$i18n.t('text.effectiveDateFormat'))
    })

    it('should clear the order error and show the format hint once the dates are back in order', async () => {
      const wrapper = await mountSyncedRange('2024-03-10', '2024-03-15')
      await setInput(wrapper, 0, 'Mar 20, 2024')
      await setInput(wrapper, 1, 'Mar 25, 2024')

      expect(rangeError(wrapper).exists()).toBe(false)
      expect(wrapper.text()).toContain(useNuxtApp().$i18n.t('text.effectiveDateFormat'))
    })

    it('should keep a single-date error under its field', async () => {
      const wrapper = await mountSuspended(FormEffectiveDateRange, {
        props: {
          start: { dateInput: '2024-03-10' },
          end: { dateInput: '' },
          description: 'Range description',
          endBounds: { max: { date: '2024-03-31', message: 'Too late.' } }
        }
      })
      await setInput(wrapper, 1, 'Apr 5, 2024')

      expect(fieldErrors(wrapper)).toEqual(['Too late.'])
      expect(rangeError(wrapper).exists()).toBe(false)
    })

    it('should reject validate() while the dates are out of order', async () => {
      const wrapper = await mountSyncedRange('2024-03-15', '2024-03-10')
      await expect(wrapper.vm.validate()).rejects.toMatchObject({ errors: [{ message: ORDER_ERROR }] })
    })

    it.each([
      ['start', { start: '', end: '2024-03-10', startRequired: false, endRequired: true }],
      ['end', { start: '2024-03-10', end: '', startRequired: true, endRequired: false }]
    ])('should not show an order error or reject validate() when the optional %s date is empty', async (_, opts) => {
      const wrapper = await mountSuspended(FormEffectiveDateRange, {
        props: {
          start: { dateInput: opts.start },
          end: { dateInput: opts.end },
          description: 'Range description',
          startRequired: opts.startRequired,
          endRequired: opts.endRequired
        }
      })

      await expect(wrapper.vm.validate()).resolves.toBeUndefined()
      expect(rangeError(wrapper).exists()).toBe(false)
    })

    it('should resolve validate() when the dates are in order', async () => {
      const wrapper = await mountSyncedRange('2024-03-10', '2024-03-15')
      await expect(wrapper.vm.validate()).resolves.toBeUndefined()
    })
  })
})
