/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { useTruncateText } from '#imports'

const TestComponent = defineComponent({
  props: {
    name: { type: String, required: true },
    secondHalfLength: { type: Number, default: 14 }
  },
  setup(props) {
    const { firstHalfRefKey, isTruncated, firstHalf, secondHalf } = useTruncateText(
      () => props.name,
      props.secondHalfLength
    )
    return { firstHalfRefKey, isTruncated, firstHalf, secondHalf }
  },
  template: `
    <div>
      <span :ref="firstHalfRefKey" class="first-half">{{ firstHalf }}</span>
      <span class="second-half">{{ secondHalf }}</span>
      <span class="is-truncated">{{ isTruncated }}</span>
    </div>
  `
})

describe('useTruncateText', () => {
  it('returns raw string in firstHalf when length <= secondHalfLength', () => {
    const wrapper = mount(TestComponent, {
      props: { name: 'order.pdf', secondHalfLength: 14 }
    })

    expect(wrapper.find('.first-half').text()).toBe('order.pdf')
    expect(wrapper.find('.second-half').text()).toBe('')
    expect(wrapper.find('.is-truncated').text()).toBe('false')
  })

  it('splits firstHalf and secondHalf when length exceeds secondHalfLength', () => {
    const filename = 'BC1234567_court_order_document_2026.pdf'
    const wrapper = mount(TestComponent, {
      props: { name: filename, secondHalfLength: 14 }
    })

    const expectedSecondHalf = filename.slice(-14)
    const expectedFirstHalf = filename.slice(0, -14)

    expect(wrapper.find('.first-half').text()).toBe(expectedFirstHalf)
    expect(wrapper.find('.second-half').text()).toBe(expectedSecondHalf)
  })

  it('generates a unique ref key using useId', () => {
    const ParentComponent = defineComponent({
      components: { TestComponent },
      template: `
      <div>
        <TestComponent ref="comp1" name="file1.pdf" />
        <TestComponent ref="comp2" name="file2.pdf" />
      </div>
    `
    })

    const wrapper = mount(ParentComponent)

    const comp1 = wrapper.findComponent({ ref: 'comp1' })
    const comp2 = wrapper.findComponent({ ref: 'comp2' })

    const key1 = (comp1.vm as any).firstHalfRefKey
    const key2 = (comp2.vm as any).firstHalfRefKey

    expect(key1).toMatch(/^first-half-ref-/)
    expect(key2).toMatch(/^first-half-ref-/)
    expect(key1).not.toBe(key2)
  })

  it('updates when name prop changes', async () => {
    const wrapper = mount(TestComponent, {
      props: { name: 'short.pdf' }
    })

    expect(wrapper.find('.second-half').text()).toBe('')

    const updatedName = 'very_long_court_order_file_name_sample.pdf'
    await wrapper.setProps({ name: updatedName })

    expect(wrapper.find('.second-half').text()).toBe(updatedName.slice(-14))
  })

  it('evaluates isTruncated to true when scrollWidth > spanWidth', async () => {
    const wrapper = mount(TestComponent, {
      props: { name: 'BC1234567_court_order_document_2026.pdf' }
    })

    const targetElement = wrapper.find('.first-half').element as HTMLElement

    Object.defineProperty(targetElement, 'scrollWidth', {
      configurable: true,
      value: 250
    })

    vi.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue({
      width: 100,
      height: 20,
      top: 0,
      left: 0,
      bottom: 20,
      right: 100,
      x: 0,
      y: 0,
      toJSON: () => {}
    })

    window.dispatchEvent(new Event('resize'))
    await nextTick()

    expect(wrapper.find('.is-truncated').text()).toBe('true')
  })

  it('evaluates isTruncated to false when element is not overflowing', async () => {
    const wrapper = mount(TestComponent, {
      props: { name: 'BC1234567_court_order_document_2026.pdf' }
    })

    const targetElement = wrapper.find('.first-half').element as HTMLElement

    Object.defineProperty(targetElement, 'scrollWidth', {
      configurable: true,
      value: 80
    })

    vi.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue({
      width: 100,
      height: 20,
      top: 0,
      left: 0,
      bottom: 20,
      right: 100,
      x: 0,
      y: 0,
      toJSON: () => {}
    })

    window.dispatchEvent(new Event('resize'))
    await nextTick()

    expect(wrapper.find('.is-truncated').text()).toBe('false')
  })
})
