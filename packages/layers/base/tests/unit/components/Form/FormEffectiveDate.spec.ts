import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { FormEffectiveDate } from '#components'
import { DATE_API_INPUT_FORMAT, DATE_DISPLAY_FORMAT } from '#business/app/utils/schemas/effective-date'
import { DateTime } from 'luxon'

const VALID_API_DATE = '2024-03-15'
const VALID_DISPLAY_DATE = DateTime.fromFormat(VALID_API_DATE, DATE_API_INPUT_FORMAT).toFormat(DATE_DISPLAY_FORMAT) // 'March 15, 2024'

const mountComponent = (modelValue: EffectiveDateSchema = { effectiveDate: '' }) => {
  return mountSuspended(FormEffectiveDate, {
    props: {
      modelValue,
      'onUpdate:modelValue': (val: EffectiveDateSchema) => {
        modelValue.effectiveDate = val.effectiveDate
      }
    }
  })
}

describe('FormEffectiveDate', () => {
  it('should render the effective date input', async () => {
    const wrapper = await mountComponent()
    expect(wrapper.find('#effective-date-input').exists()).toBe(true)
  })

  it('should display an existing date value in display format', async () => {
    const wrapper = await mountComponent({ effectiveDate: VALID_API_DATE })
    const input = wrapper.find<HTMLInputElement>('#effective-date-input')
    expect(input.element.value).toBe(VALID_DISPLAY_DATE)
  })

  it('should update the model in API format after valid input on blur', async () => {
    const model: EffectiveDateSchema = { effectiveDate: '' }
    const wrapper = await mountComponent(model)

    const input = wrapper.find<HTMLInputElement>('#effective-date-input')
    await input.setValue(VALID_DISPLAY_DATE)
    await input.trigger('blur')
    await flushPromises()

    expect(model.effectiveDate).toBe(VALID_API_DATE)
  })

  it('should normalize alternate date formats to display format on blur', async () => {
    const model: EffectiveDateSchema = { effectiveDate: '' }
    const wrapper = await mountComponent(model)

    const input = wrapper.find<HTMLInputElement>('#effective-date-input')
    // ISO format input — should be normalized to display format
    await input.setValue('March 15, 2024')
    await input.trigger('blur')
    await flushPromises()

    expect(model.effectiveDate).toBe(VALID_API_DATE)
  })

  it('should not update the model when an invalid date is entered', async () => {
    const model: EffectiveDateSchema = { effectiveDate: '' }
    const wrapper = await mountComponent(model)

    const input = wrapper.find<HTMLInputElement>('#effective-date-input')
    await input.setValue('not a date')
    await input.trigger('blur')
    await flushPromises()

    expect(model.effectiveDate).toBe('')
  })

  it('should resolve validation when a valid date is set', async () => {
    const wrapper = await mountComponent({ effectiveDate: VALID_API_DATE })
    await expect(wrapper.vm.validateNormalizedDate()).resolves.toBeUndefined()
  })

  it('should reject validation when date is empty', async () => {
    const wrapper = await mountComponent({ effectiveDate: '' })
    await expect(wrapper.vm.validateNormalizedDate()).rejects.toMatchObject({
      errors: expect.arrayContaining([
        expect.objectContaining({ message: expect.any(String) })
      ])
    })
  })
})
