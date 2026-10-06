import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { FormPartyEmail } from '#components'

const mountComponent = (modelValue = '') => {
  return mountSuspended(FormPartyEmail, {
    props: {
      modelValue,
      'onUpdate:modelValue': (val: string) => {
        modelValue = val
      }
    }
  })
}

describe('FormPartyEmail', () => {
  it('should render the email input', async () => {
    const wrapper = await mountComponent()
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('should show the required label by default', async () => {
    const wrapper = await mountComponent()
    expect(wrapper.text()).toContain('Email Address')
    expect(wrapper.text()).not.toContain('Email Address (Optional)')
  })

  it('should display an existing email value', async () => {
    const wrapper = await mountComponent('name@gov.bc.ca')
    const input = wrapper.find<HTMLInputElement>('input')
    expect(input.element.value).toBe('name@gov.bc.ca')
  })

  it('should update the model when the input changes', async () => {
    const model = { value: '' }
    const wrapper = await mountSuspended(FormPartyEmail, {
      props: {
        'modelValue': model.value,
        'onUpdate:modelValue': (val: string) => {
          model.value = val
        }
      }
    })

    const input = wrapper.find<HTMLInputElement>('input')
    await input.setValue('name@gov.bc.ca')
    await flushPromises()

    expect(model.value).toBe('name@gov.bc.ca')
  })

  it('should surface the required error when validated with an empty value', async () => {
    const wrapper = await mountComponent('')

    await wrapper.vm.formRef?.validate().catch(() => {})
    await flushPromises()

    expect(wrapper.text()).toContain('This field is required')
  })

  it('should surface the invalid email error when validated with a badly formatted value', async () => {
    const wrapper = await mountComponent('name@gov')

    await wrapper.vm.formRef?.validate().catch(() => {})
    await flushPromises()

    expect(wrapper.text()).toContain('Valid email address is required')
  })

  it('should clear the error once a valid value is entered', async () => {
    const wrapper = await mountComponent('')

    await wrapper.vm.formRef?.validate().catch(() => {})
    await flushPromises()
    expect(wrapper.text()).toContain('This field is required')

    const input = wrapper.find<HTMLInputElement>('input')
    await input.setValue('name@gov.bc.ca')
    await flushPromises()

    expect(wrapper.text()).not.toContain('This field is required')
  })

  describe('when required is false', () => {
    const mountOptional = (modelValue = '') => {
      return mountSuspended(FormPartyEmail, {
        props: {
          'modelValue': modelValue,
          'onUpdate:modelValue': () => {},
          'required': false
        }
      })
    }

    it('should show the optional label', async () => {
      const wrapper = await mountOptional()
      expect(wrapper.text()).toContain('Email Address (Optional)')
    })

    it('should not surface a required error when validated with an empty value', async () => {
      const wrapper = await mountOptional('')

      await wrapper.vm.formRef?.validate().catch(() => {})
      await flushPromises()

      expect(wrapper.text()).not.toContain('This field is required')
    })

    it('should still surface the invalid email error when validated with a badly formatted value', async () => {
      const wrapper = await mountOptional('name@gov')

      await wrapper.vm.formRef?.validate().catch(() => {})
      await flushPromises()

      expect(wrapper.text()).toContain('Valid email address is required')
    })
  })
})
