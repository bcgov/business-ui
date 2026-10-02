import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { FormEffectiveDate, FormEffectiveDateRange } from '#components'
import type { EffectiveDateSchema } from '#business/app/utils/schemas/effective-date'
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
})
