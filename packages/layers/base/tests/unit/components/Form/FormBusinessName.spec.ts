import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { FormBusinessName, ConnectI18nHelper } from '#components'

const mountComponent = (props = {}) => {
  return mountSuspended(FormBusinessName, {
    props: {
      businessIdentifier: 'BC1234567',
      businessType: CorpTypeCd.BC_COMPANY,
      initialCompanyName: 'Old Name Ltd.',
      correctNameOptions: [
        CorrectNameOption.CORRECT_NAME,
        CorrectNameOption.CORRECT_NAME_TO_NUMBER,
        CorrectNameOption.CORRECT_NEW_NR
      ],
      filingName: 'Correction',
      nrAllowedActionTypes: [],
      modelValue: { legalName: '', nrNumber: '', changeToNumbered: false },
      ...props
    }
  })
}

describe('FormBusinessName', () => {
  it('should render the correct radio group items based on the correctNameOptions prop', async () => {
    let wrapper = await mountComponent({
      correctNameOptions: [
        CorrectNameOption.CORRECT_NAME,
        CorrectNameOption.CORRECT_NEW_NR
      ]
    })

    let radioGroup = wrapper.findComponent({ name: 'URadioGroup' })
    let items = radioGroup.props('items')

    expect(items).toHaveLength(2)
    expect(items[0].value).toBe(CorrectNameOption.CORRECT_NAME)
    expect(items[1].value).toBe(CorrectNameOption.CORRECT_NEW_NR)

    wrapper.unmount()

    wrapper = await mountComponent({
      correctNameOptions: [
        CorrectNameOption.CORRECT_NAME,
        CorrectNameOption.CORRECT_NAME_TO_NUMBER
      ]
    })

    radioGroup = wrapper.findComponent({ name: 'URadioGroup' })
    items = radioGroup.props('items')

    expect(items).toHaveLength(2)
    expect(items[0].value).toBe(CorrectNameOption.CORRECT_NAME)
    expect(items[1].value).toBe(CorrectNameOption.CORRECT_NAME_TO_NUMBER)
  })

  it('should not render radio group when only one name change option given', async () => {
    const wrapper = await mountComponent({
      correctNameOptions: [CorrectNameOption.CORRECT_NAME],
      initialCompanyName: 'Company Name Ltd.'
    })

    const radioGroup = wrapper.findComponent({ name: 'URadioGroup' })

    expect(radioGroup.exists()).toBeFalsy()

    expect(wrapper.findComponent({ name: 'FormBusinessNameEdit' }).exists()).toBeTruthy()
  })

  it('should init legalName when only CORRECT_NAME option exists', async () => {
    const wrapper = await mountComponent({
      correctNameOptions: [CorrectNameOption.CORRECT_NAME],
      initialCompanyName: 'Company Name Ltd.'
    })

    expect(wrapper.vm.modelValue.legalName).toBe('Company Name Ltd.')
  })

  it('should update legalName when changeToNumbered is selected', async () => {
    const wrapper = await mountComponent({
      correctNameOptions: [
        CorrectNameOption.CORRECT_NAME,
        CorrectNameOption.CORRECT_NAME_TO_NUMBER
      ],
      businessIdentifier: 'BC1234567',
      businessType: CorpTypeCd.BC_COMPANY
    })

    const radioBtn = wrapper.find('button[value="correct-name-to-number"]')
    await radioBtn.trigger('click')

    await nextTick()
    await flushPromises()

    expect(wrapper.vm.modelValue.legalName).toContain('BC1234567 B.C.')
    expect(wrapper.findComponent(ConnectI18nHelper).exists()).toBeTruthy()
  })

  it('emits cancel when the cancel button is clicked', async () => {
    const wrapper = await mountComponent()
    const cancelBtn = wrapper.findAllComponents({ name: 'UButton' })
      .find(b => b.text().includes('Cancel'))?.find('button')

    await cancelBtn?.trigger('click')
    await flushPromises()

    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('should emit done if option is active and form is valid', async () => {
    const wrapper = await mountComponent({
      correctNameOptions: [
        CorrectNameOption.CORRECT_NAME
      ]
    })

    // form will be valid on mount since the name option will be populated
    const doneBtn = wrapper.findAllComponents({ name: 'UButton' })
      .find(b => b.text().includes('Done'))?.find('button')

    await doneBtn?.trigger('click')
    await flushPromises()

    expect(wrapper.emitted('done')).toBeDefined()
  })

  it('should not emit done if form validation fails', async () => {
    const wrapper = await mountComponent({
      correctNameOptions: [CorrectNameOption.CORRECT_NEW_NR],
      modelValue: { legalName: '', nrNumber: '', changeToNumbered: false } // empty nr is invalid
    })

    const doneBtn = wrapper.findAllComponents({ name: 'UButton' })
      .find(b => b.text().includes('Done'))?.find('button')

    await doneBtn?.trigger('click')
    await flushPromises()

    expect(wrapper.emitted('done')).toBeUndefined()
  })

  it('should reset modelValue when switching between radio group items', async () => {
    const wrapper = await mountComponent({
      correctNameOptions: [
        CorrectNameOption.CORRECT_NAME,
        CorrectNameOption.CORRECT_NEW_NR
      ]
    })

    wrapper.vm.modelValue.nrNumber = 'NR 1234567'
    expect(wrapper.vm.modelValue.nrNumber).toBe('NR 1234567')

    const accordion = wrapper.findComponent({ name: 'URadioGroup' })
    await accordion.vm.$emit('update:modelValue', CorrectNameOption.CORRECT_NEW_NR)

    await flushPromises()

    expect(wrapper.vm.modelValue.nrNumber).toBe('')
  })

  it('should trigger onDone when Enter key is pressed', async () => {
    const wrapper = await mountComponent({
      correctNameOptions: [CorrectNameOption.CORRECT_NAME]
    })

    const form = wrapper.findComponent({ name: 'UForm' })
    await form.trigger('keydown.enter')
    await flushPromises()

    expect(wrapper.emitted('done')).toBeDefined()
  })
})
