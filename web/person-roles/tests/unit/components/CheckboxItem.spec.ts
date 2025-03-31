import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, test, expect } from 'vitest'
import { FormCheckboxItem } from '#components'

describe('Example Test', () => {
  test('Renders when checked = false', async () => {
    const wrapper = await mountSuspended(FormCheckboxItem, {
      props: {
        item: {
          value: 'test-value',
          label: 'Test Label'
        },
        checked: false
      }
    })

    expect(wrapper.text()).toContain('Test Label')

    // unchecked icon when checked is false
    expect(wrapper.find('span.i-mdi\\:checkbox-blank-outline').exists()).toBe(true)

    // checked icon not rendered when checked is false
    expect(wrapper.find('span.i-mdi\\:checkbox-marked').exists()).toBe(false)
  })

  test('Renders when checked = true', async () => {
    const wrapper = await mountSuspended(FormCheckboxItem, {
      props: {
        item: {
          value: 'test-value',
          label: 'Test Label'
        },
        checked: true
      }
    })

    expect(wrapper.text()).toContain('Test Label')

    await wrapper.find('button').trigger('click')

    // unchecked icon not rendered
    expect(wrapper.find('span.i-mdi\\:checkbox-blank-outline').exists()).toBe(false)

    // checked icon rendered when item selected
    expect(wrapper.find('span.i-mdi\\:checkbox-marked').exists()).toBe(true)
  })
})
