/* eslint-disable @typescript-eslint/no-explicit-any */
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect } from 'vitest'
import { SubFormWrapper } from '#components'

const findButtonByText = (wrapper: any, text: string) => {
  return wrapper.findAllComponents({ name: 'UButton' }).find((b: any) => b.text().includes(text))
}

describe('SubFormWrapper', () => {
  const defaultProps = {
    variant: 'edit' as const,
    itemLabel: 'Officer'
  }

  it('should render the correct label prefix for each variant', async () => {
    const variants = [
      { type: 'edit', expected: 'Editing' },
      { type: 'add', expected: 'Adding' },
      { type: 'correct', expected: 'Correcting' },
      { type: 'change', expected: 'Changing' }
    ]

    for (const { type, expected } of variants) {
      const wrapper = await mountSuspended(SubFormWrapper, {
        props: { variant: type as any, itemLabel: 'Officer' }
      })
      expect(wrapper.find('legend').text()).toContain(`${expected} Officer`)
    }
  })

  it('should use "Delete" label for correct/change variants and "Remove" for edit', async () => {
    const editWrapper = await mountSuspended(SubFormWrapper, {
      props: { ...defaultProps, variant: 'edit' }
    })
    expect(findButtonByText(editWrapper, 'Remove')).toBeDefined()

    const correctWrapper = await mountSuspended(SubFormWrapper, {
      props: { ...defaultProps, variant: 'correct' }
    })
    expect(findButtonByText(correctWrapper, 'Delete')).toBeDefined()
  })

  it('should hide the remove button when variant is "add"', async () => {
    const wrapper = await mountSuspended(SubFormWrapper, {
      props: { ...defaultProps, variant: 'add' }
    })
    expect(findButtonByText(wrapper, 'Remove')).toBeUndefined()
  })

  it('should hide the remove button when hideRemove prop is true', async () => {
    const wrapper = await mountSuspended(SubFormWrapper, {
      props: { ...defaultProps, variant: 'edit', hideRemove: true }
    })
    expect(findButtonByText(wrapper, 'Remove')).toBeUndefined()
  })

  it('should hide header cancel button when hideHeaderCancel is true', async () => {
    const wrapper = await mountSuspended(SubFormWrapper, {
      props: { ...defaultProps, hideHeaderCancel: true }
    })

    const buttons = wrapper.findAllComponents({ name: 'UButton' })
    const cancelButtons = buttons.filter(b => b.text().includes('Cancel'))
    expect(cancelButtons.length).toBe(1) // only in footer
  })

  it('should emit "cancel" when header Cancel button is clicked', async () => {
    const wrapper = await mountSuspended(SubFormWrapper, { props: defaultProps })
    const headerCancel = wrapper.find('legend').findComponent({ name: 'UButton' })
    await headerCancel.vm.$emit('click')
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('should emit "done" when footer Done button is clicked', async () => {
    const wrapper = await mountSuspended(SubFormWrapper, { props: defaultProps })
    const doneBtn = findButtonByText(wrapper, 'Done')
    await doneBtn.vm.$emit('click')
    expect(wrapper.emitted('done')).toBeTruthy()
  })

  it('should emit "remove" when the Remove button is clicked', async () => {
    const wrapper = await mountSuspended(SubFormWrapper, { props: defaultProps })
    const removeBtn = findButtonByText(wrapper, 'Remove')
    await removeBtn.vm.$emit('click')
    expect(wrapper.emitted('remove')).toBeTruthy()
  })

  it('should render slot content', async () => {
    const wrapper = await mountSuspended(SubFormWrapper, {
      props: defaultProps,
      slots: { default: '<div id="test-content">Slot Content</div>' }
    })
    expect(wrapper.find('#test-content').exists()).toBe(true)
  })

  it('should apply error classes when error prop is true', async () => {
    const wrapper = await mountSuspended(SubFormWrapper, {
      props: { ...defaultProps, error: true }
    })
    const body = wrapper.find('div.rounded-b')
    expect(body.classes()).toContain('border-l-error')
    expect(body.classes()).toContain('border-l-3')
  })

  const taskGuardConfig = {
    message: 'Error Message',
    messageId: 'msg-id',
    targetId: 'target-id'
  }

  it('should render FormAlertMessage when config is defined', async () => {
    const wrapper = await mountSuspended(SubFormWrapper, {
      props: { ...defaultProps, taskGuardConfig }
    })
    expect(wrapper.findComponent({ name: 'FormAlertMessage' }).exists()).toBe(true)
  })

  it('should add correct attributes to the Done button for task guards', async () => {
    const wrapper = await mountSuspended(SubFormWrapper, {
      props: { ...defaultProps, taskGuardConfig }
    })
    const doneBtn = findButtonByText(wrapper, 'Done')
    const attrs = doneBtn?.find('button').attributes()
    expect(attrs).toHaveProperty('data-alert-focus-target', 'target-id')
    expect(attrs).toHaveProperty('aria-describedby', 'msg-id')
  })
})
