import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { FormLiquidatorAppointment } from '#components'

const mountComponent = async (initial: LiquidatorRoleMeta = {}) => {
  const model = { value: initial }
  const wrapper = await mountSuspended(FormLiquidatorAppointment, {
    props: {
      'modelValue': model.value,
      'onUpdate:modelValue': (val: LiquidatorRoleMeta) => {
        model.value = val
      }
    }
  })
  return { wrapper, model }
}

const selectMethod = async (wrapper: Awaited<ReturnType<typeof mountComponent>>['wrapper'], label: string) => {
  const radio = wrapper.findAll('[role="radio"]').find(r => r.attributes('aria-label') === label
    || wrapper.find(`label[for="${r.attributes('id')}"]`).text() === label)
  await radio!.trigger('click')
  await flushPromises()
}

describe('FormLiquidatorAppointment', () => {
  it('renders both appointment methods with nothing selected and no court order number', async () => {
    const { wrapper } = await mountComponent()
    expect(wrapper.text()).toContain('Appointed by')
    expect(wrapper.text()).toContain('By the Company')
    expect(wrapper.text()).toContain('By the Court')
    expect(wrapper.find('[data-state="checked"]').exists()).toBe(false)
    expect(wrapper.find('#liquidator-court-order-number-input').exists()).toBe(false)
  })

  it('shows the court order number only when appointed by the court', async () => {
    const { wrapper, model } = await mountComponent()

    await selectMethod(wrapper, 'By the Court')
    expect(model.value.appointmentMethod).toBe(LiquidatorAppointmentMethod.COURT)
    expect(wrapper.find('#liquidator-court-order-number-input').exists()).toBe(true)

    await selectMethod(wrapper, 'By the Company')
    expect(model.value.appointmentMethod).toBe(LiquidatorAppointmentMethod.COMPANY)
    expect(wrapper.find('#liquidator-court-order-number-input').exists()).toBe(false)
  })

  it('writes the trimmed court order number and drops it when switching to the company', async () => {
    const { wrapper, model } = await mountComponent({ appointmentMethod: LiquidatorAppointmentMethod.COURT })

    await wrapper.find('#liquidator-court-order-number-input').setValue(' S-12345 ')
    await flushPromises()
    expect(model.value).toEqual({ appointmentMethod: LiquidatorAppointmentMethod.COURT, courtOrderNumber: 'S-12345' })

    await selectMethod(wrapper, 'By the Company')
    expect(model.value).toEqual({ appointmentMethod: LiquidatorAppointmentMethod.COMPANY, courtOrderNumber: undefined })
  })

  it('shows the required court order number error on validate', async () => {
    const { wrapper } = await mountComponent({ appointmentMethod: LiquidatorAppointmentMethod.COURT })

    const { formRef } = wrapper.vm as unknown as { formRef: { validate: () => Promise<unknown> } }
    await expect(formRef.validate()).rejects.toBeTruthy()
    await flushPromises()

    expect(wrapper.text()).toContain('Court order number is required.')
  })
})
