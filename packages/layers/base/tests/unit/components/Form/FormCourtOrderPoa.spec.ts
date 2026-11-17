import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent, h, reactive } from 'vue'
import { FormCourtOrderPoa, UForm } from '#components'
import type { CourtOrderPoaSchema } from '#business/app/utils/schemas/court-order-poa'

const NUMBER_INPUT = '#court-order-number-input'
const POA_CHECKBOX = 'button[role="checkbox"]'
const HINT = '[data-slot="description"]'
const ERROR = '[data-testid="court-order-number-error"]'
const HINT_TEXT = 'Court Order Number is required if one exists or if this filing is pursuant to a Plan of Arrangement.'
const REQUIRED_TEXT = 'Court order number is required.'

// the component is a nested form, it reads its state from the parent form
const mountForm = (courtOrder: CourtOrderPoaSchema = { hasPoa: false, courtOrderNumber: '' }) => {
  const state = reactive({ courtOrder })
  const Host = defineComponent({
    setup: () => () => h(UForm, { state }, {
      default: () => h(FormCourtOrderPoa, { modelValue: state.courtOrder, name: 'courtOrder', order: 2 })
    })
  })
  return mountSuspended(Host)
}

describe('FormCourtOrderPoa', () => {
  it('should render the number then the plan of arrangement checkbox in a single Court Order row', async () => {
    const wrapper = await mountForm()

    expect(wrapper.find('legend').text()).toBe('2. Court Order and Plan of Arrangement')
    expect(wrapper.findAll('label').map(label => label.text())).toEqual([
      'Court Order Number (Required if one exists)',
      'This filing is pursuant to a Plan of Arrangement'
    ])

    const number = wrapper.find(NUMBER_INPUT).element
    const poa = wrapper.find(POA_CHECKBOX).element
    expect(number.compareDocumentPosition(poa) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('should show the hint above the input and describe the input with it', async () => {
    const wrapper = await mountForm()

    const hint = wrapper.find(HINT)
    expect(hint.text()).toBe(HINT_TEXT)
    expect(hint.classes()).toContain('text-default')
    expect(hint.classes()).not.toContain('text-muted')

    const input = wrapper.find(NUMBER_INPUT)
    expect(hint.element.compareDocumentPosition(input.element) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(input.attributes('aria-describedby')!.split(' ')).toContain(hint.element.id)
  })

  it('should not require the number or show an error by default', async () => {
    const wrapper = await mountForm()

    expect(wrapper.find(NUMBER_INPUT).attributes('aria-required')).toBeUndefined()
    expect(wrapper.find(NUMBER_INPUT).attributes('aria-invalid')).toBe('false')
    expect(wrapper.find(ERROR).text()).toBe('')
    expect(wrapper.find(ERROR).attributes('aria-live')).toBe('polite')
    expect(wrapper.find('.iconify').exists()).toBe(false)
  })

  it('should require the number and show the error right away when plan of arrangement is checked', async () => {
    const wrapper = await mountForm()

    await wrapper.find(POA_CHECKBOX).trigger('click')

    await vi.waitFor(() => expect(wrapper.find(ERROR).text()).toBe(REQUIRED_TEXT))
    // the error shows under the input with the caution icon, the hint is unchanged
    const error = wrapper.find(ERROR).element.parentElement!
    expect(error.querySelector('.iconify')).not.toBeNull()
    expect(wrapper.find(NUMBER_INPUT).element.compareDocumentPosition(error) & Node.DOCUMENT_POSITION_FOLLOWING)
      .toBeTruthy()
    expect(wrapper.find(HINT).text()).toBe(HINT_TEXT)
    expect(wrapper.find(HINT).classes()).not.toContain('text-error')
    expect(wrapper.find(NUMBER_INPUT).attributes('aria-required')).toBe('true')
    expect(wrapper.find(NUMBER_INPUT).attributes('aria-invalid')).toBe('true')
    expect(wrapper.find(NUMBER_INPUT).attributes('aria-describedby')!.split(' ')).toContain(error.id)
    expect(wrapper.find('fieldset').html()).toContain('shadow-section-error')
  })

  it('should drop the requirement and the error when plan of arrangement is unchecked', async () => {
    const wrapper = await mountForm()

    await wrapper.find(POA_CHECKBOX).trigger('click')
    await vi.waitFor(() => expect(wrapper.find(ERROR).text()).toBe(REQUIRED_TEXT))

    await wrapper.find(POA_CHECKBOX).trigger('click')

    await vi.waitFor(() => expect(wrapper.find(ERROR).text()).toBe(''))
    expect(wrapper.find(HINT).text()).toBe(HINT_TEXT)
    expect(wrapper.find(NUMBER_INPUT).attributes('aria-required')).toBeUndefined()
    expect(wrapper.find(NUMBER_INPUT).attributes('aria-invalid')).toBe('false')
    expect(wrapper.find('fieldset').html()).not.toContain('shadow-section-error')
  })

  it('should clear the error as soon as a valid number is typed', async () => {
    const wrapper = await mountForm()

    await wrapper.find(POA_CHECKBOX).trigger('click')
    await vi.waitFor(() => expect(wrapper.find(ERROR).text()).toBe(REQUIRED_TEXT))

    await wrapper.find(NUMBER_INPUT).setValue('12345-6789')

    await vi.waitFor(() => expect(wrapper.find(ERROR).text()).toBe(''))
    expect(wrapper.find(NUMBER_INPUT).attributes('aria-invalid')).toBe('false')
  })

  it('should not show an error when plan of arrangement is checked with a number entered', async () => {
    const wrapper = await mountForm({ hasPoa: false, courtOrderNumber: '12345-6789' })

    await wrapper.find(POA_CHECKBOX).trigger('click')
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(wrapper.find(ERROR).text()).toBe('')
    expect(wrapper.find(NUMBER_INPUT).attributes('aria-required')).toBe('true')
  })

  it('should keep a format error on the number when plan of arrangement is unchecked', async () => {
    const wrapper = await mountForm({ hasPoa: false, courtOrderNumber: '123' })

    await wrapper.find(POA_CHECKBOX).trigger('click')
    await vi.waitFor(() => expect(wrapper.find(ERROR).text()).toBe('Minimum 5 characters'))

    await wrapper.find(POA_CHECKBOX).trigger('click')
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(wrapper.find(ERROR).text()).toBe('Minimum 5 characters')
  })
})
