import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { ButtonControlGroup } from '#components'

const buttonControl = ref<Record<string, unknown>>({})
mockNuxtImport('useConnectButtonControl', () => () => ({ buttonControl }))

function setGroups(rightAlertText?: string) {
  buttonControl.value = {
    leftGroup: {
      stacked: false,
      alertText: 'There are no changes to save',
      buttons: [{ label: 'Save and Resume Later' }]
    },
    rightGroup: { stacked: true, alertText: rightAlertText, buttons: [{ label: 'Cancel' }, { label: 'File and Pay' }] }
  }
}

describe('ButtonControlGroup', () => {
  it('renders only the requested group', async () => {
    setGroups()
    const wrapper = await mountSuspended(ButtonControlGroup, { props: { side: 'right' } })

    expect(wrapper.find('[data-testid="right-buttons"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Cancel')
    expect(wrapper.text()).toContain('File and Pay')
    expect(wrapper.text()).not.toContain('Save and Resume Later')
  })

  it('stacks a stacked group and shows the group alert', async () => {
    setGroups()
    const right = await mountSuspended(ButtonControlGroup, { props: { side: 'right' } })
    const left = await mountSuspended(ButtonControlGroup, { props: { side: 'left' } })

    expect(right.find('[data-testid="right-buttons"]').classes()).toContain('flex-col')
    expect(left.find('[data-testid="left-buttons"]').classes()).toContain('flex-row')
    expect(left.find('[role="alert"]').text()).toBe('There are no changes to save')
  })

  it('renders nothing when the group has no buttons', async () => {
    buttonControl.value = { leftGroup: { buttons: [] }, rightGroup: { buttons: [] } }
    const wrapper = await mountSuspended(ButtonControlGroup, { props: { side: 'left' } })

    expect(wrapper.find('[data-testid="left-buttons"]').exists()).toBe(false)
  })
})
