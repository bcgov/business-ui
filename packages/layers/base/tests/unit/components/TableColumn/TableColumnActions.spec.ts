/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { TableColumnActions, UButton, UDropdownMenu } from '#components'

const mockT = vi.fn((key: string) => key)
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: mockT
  })
}))

function mountComponent(props = { isRemoved: false, isEdited: false }) {
  return mountSuspended(TableColumnActions, {
    props,
    global: {
      mocks: {
        $t: mockT
      }
    }
  })
}

describe('TableColumnActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Main Action', () => {
    it('should render "Change" button when not removed or edited', async () => {
      const wrapper = await mountComponent()
      const mainButton = wrapper.findComponent(UButton)

      expect(mainButton.exists()).toBe(true)
      expect(mainButton.props('icon')).toBe('i-mdi-pencil')
      expect(mainButton.props('label')).toBe('label.change')
    })

    it('should render "Undo" button when edited', async () => {
      const wrapper = await mountComponent({ isRemoved: false, isEdited: true })
      const mainButton = wrapper.findComponent(UButton)

      expect(mainButton.exists()).toBe(true)
      expect(mainButton.props('icon')).toBe('i-mdi-undo')
      expect(mainButton.props('label')).toBe('label.undo')
    })

    it('should render "Undo" button when removed', async () => {
      const wrapper = await mountComponent({ isRemoved: true, isEdited: false })
      const mainButton = wrapper.findComponent(UButton)

      expect(mainButton.exists()).toBe(true)
      expect(mainButton.props('icon')).toBe('i-mdi-undo')
      expect(mainButton.props('label')).toBe('label.undo')
    })

    it('should emit "init-edit" on click in default state', async () => {
      const wrapper = await mountComponent({ isRemoved: false, isEdited: false })
      const mainButton = wrapper.find('button')

      await mainButton.trigger('click')

      expect(wrapper.emitted('init-edit')).toHaveLength(1)
      expect(wrapper.emitted('undo')).toBeUndefined()
    })

    it('should emit "undo" on click when edited', async () => {
      const wrapper = await mountComponent({ isRemoved: false, isEdited: true })
      const mainButton = wrapper.find('button')

      await mainButton.trigger('click')

      expect(wrapper.emitted('undo')).toHaveLength(1)
      expect(wrapper.emitted('init-edit')).toBeUndefined()
    })

    it('should emit "undo" on click when removed', async () => {
      const wrapper = await mountComponent({ isRemoved: true, isEdited: false })
      const mainButton = wrapper.find('button')

      await mainButton.trigger('click')

      expect(wrapper.emitted('undo')).toHaveLength(1)
      expect(wrapper.emitted('init-edit')).toBeUndefined()
    })
  })

  describe('Dropdown Menu', () => {
    it('should render the dropdown menu when not removed', async () => {
      const wrapper = await mountComponent({ isRemoved: false, isEdited: false })
      const dropdown = wrapper.findComponent(UDropdownMenu as any)

      expect(dropdown.exists()).toBe(true)
    })

    it('should not render the dropdown menu when removed', async () => {
      const wrapper = await mountComponent({ isRemoved: true, isEdited: false })
      const dropdown = wrapper.findComponent(UDropdownMenu as any)

      expect(dropdown.exists()).toBe(false)
    })

    it('should only have removed action when not edited', async () => {
      const wrapper = await mountComponent({ isRemoved: false, isEdited: false })
      const dropdown = wrapper.findComponent(UDropdownMenu as any)
      const items = dropdown.props('items')

      expect(items).toHaveLength(1)
      expect(items[0].label).toBe('label.remove')
      expect(items[0].icon).toBe('i-mdi-delete')
    })

    it('should have change and remove actions when edited', async () => {
      const wrapper = await mountComponent({ isRemoved: false, isEdited: true })
      const dropdown = wrapper.findComponent(UDropdownMenu as any)
      const items = dropdown.props('items')

      expect(items).toHaveLength(2)
      expect(items[0].label).toBe('label.change')
      expect(items[0].icon).toBe('i-mdi-pencil')
      expect(items[1].label).toBe('label.remove')
      expect(items[1].icon).toBe('i-mdi-delete')
    })

    it('should emit "remove" when remove action is selected', async () => {
      const wrapper = await mountComponent({ isRemoved: false, isEdited: false })
      const dropdown = wrapper.findComponent(UDropdownMenu as any)
      const items = dropdown.props('items')

      items[0].onSelect()

      expect(wrapper.emitted('remove')).toHaveLength(1)
    })

    it('should emit "init-edit" when change action is selected', async () => {
      const wrapper = await mountComponent({ isRemoved: false, isEdited: true })
      const dropdown = wrapper.findComponent(UDropdownMenu as any)
      const items = dropdown.props('items')

      items[0].onSelect()

      expect(wrapper.emitted('init-edit')).toHaveLength(1)
    })
  })
})
