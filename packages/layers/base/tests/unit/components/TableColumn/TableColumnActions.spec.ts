/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { TableColumnActions, UButton, UDropdownMenu } from '#components'
import { mockGetIsRowEdited, mockGetIsRowRemoved } from '../../mocks/business-table-utils'

const mockT = vi.fn((key: string) => key)
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: mockT
  })
}))

function createMockRow(isNew: boolean) {
  return {
    original: {
      old: isNew ? undefined : { name: 'test' },
      new: { name: 'test' }
    }
  }
}

function mountComponent(props: any = {}) {
  return mountSuspended(TableColumnActions, {
    props: {
      row: createMockRow(false),
      ...props
    },
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
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(false)
      const wrapper = await mountComponent()
      const mainButton = wrapper.findComponent(UButton)

      expect(mainButton.exists()).toBe(true)
      expect(mainButton.props('icon')).toBe('i-mdi-pencil')
      expect(mainButton.props('label')).toBe('label.change')
    })

    it('should render "Undo" button when edited', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(true)
      const wrapper = await mountComponent()
      const mainButton = wrapper.findComponent(UButton)

      expect(mainButton.exists()).toBe(true)
      expect(mainButton.props('icon')).toBe('i-mdi-undo')
      expect(mainButton.props('label')).toBe('label.undo')
    })

    it('should render "Undo" button when removed', async () => {
      mockGetIsRowRemoved.mockReturnValue(true)
      mockGetIsRowEdited.mockReturnValue(false)
      const wrapper = await mountComponent()
      const mainButton = wrapper.findComponent(UButton)

      expect(mainButton.exists()).toBe(true)
      expect(mainButton.props('icon')).toBe('i-mdi-undo')
      expect(mainButton.props('label')).toBe('label.undo')
    })

    it('should emit "init-edit" on click in default state', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(false)
      const wrapper = await mountComponent()
      const mainButton = wrapper.find('button')

      await mainButton.trigger('click')

      expect(wrapper.emitted('init-edit')).toHaveLength(1)
      expect(wrapper.emitted('undo')).toBeUndefined()
    })

    it('should emit "undo" on click when edited', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(true)
      const wrapper = await mountComponent()
      const mainButton = wrapper.find('button')

      await mainButton.trigger('click')

      expect(wrapper.emitted('undo')).toHaveLength(1)
      expect(wrapper.emitted('init-edit')).toBeUndefined()
    })

    it('should emit "undo" on click when removed', async () => {
      mockGetIsRowRemoved.mockReturnValue(true)
      mockGetIsRowEdited.mockReturnValue(false)
      const wrapper = await mountComponent()
      const mainButton = wrapper.find('button')

      await mainButton.trigger('click')

      expect(wrapper.emitted('undo')).toHaveLength(1)
      expect(wrapper.emitted('init-edit')).toBeUndefined()
    })
  })

  describe('Dropdown Menu', () => {
    it('should render the dropdown menu when not removed or edited', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(false)
      const wrapper = await mountComponent()
      const dropdown = wrapper.findComponent(UDropdownMenu as any)

      expect(dropdown.exists()).toBe(true)
    })

    it('should not render the dropdown menu when removed', async () => {
      mockGetIsRowRemoved.mockReturnValue(true)
      mockGetIsRowEdited.mockReturnValue(false)
      const wrapper = await mountComponent()
      const dropdown = wrapper.findComponent(UDropdownMenu as any)

      expect(dropdown.exists()).toBe(false)
    })

    it('should only have removed action when not edited', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(false)
      const wrapper = await mountComponent()
      const dropdown = wrapper.findComponent(UDropdownMenu as any)
      const items = dropdown.props('items')

      expect(items).toHaveLength(1)
      expect(items[0].label).toBe('label.remove')
      expect(items[0].icon).toBe('i-mdi-delete')
    })

    it('should have change and remove actions when edited', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(true)
      const wrapper = await mountComponent()
      const dropdown = wrapper.findComponent(UDropdownMenu as any)
      const items = dropdown.props('items')

      expect(items).toHaveLength(2)
      expect(items[0].label).toBe('label.change')
      expect(items[0].icon).toBe('i-mdi-pencil')
      expect(items[1].label).toBe('label.remove')
      expect(items[1].icon).toBe('i-mdi-delete')
    })

    it('should emit "remove" when remove action is selected', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(false)
      const wrapper = await mountComponent()
      const dropdown = wrapper.findComponent(UDropdownMenu as any)
      const items = dropdown.props('items')

      items[0].onSelect()

      expect(wrapper.emitted('remove')).toHaveLength(1)
    })

    it('should emit "init-edit" when change action is selected', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(true)
      const wrapper = await mountComponent()
      const dropdown = wrapper.findComponent(UDropdownMenu as any)
      const items = dropdown.props('items')

      items[0].onSelect()

      expect(wrapper.emitted('init-edit')).toHaveLength(1)
    })
  })

  describe('Allowed Actions', () => {
    it('should hide all actions if row has no allowed actions', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(false)

      const wrapper = await mountComponent({
        allowedActions: [],
        row: createMockRow(false)
      })

      expect(wrapper.findComponent(UButton).exists()).toBe(false)
    })

    it('should show Change and Remove for a NEW row if allowedActions is empty', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(false)

      const wrapper = await mountComponent({
        allowedActions: [],
        row: createMockRow(true)
      })

      expect(wrapper.findComponent(UButton).exists()).toBe(true)
      expect(wrapper.findComponent(UButton).props('label')).toBe('label.change')

      const dropdown = wrapper.findComponent(UDropdownMenu as any)
      expect(dropdown.exists()).toBe(true)
      expect(dropdown.props('items')).toHaveLength(1)
    })

    it('should only show Remove if only REMOVE action is allowed on existing row', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(false)

      const wrapper = await mountComponent({
        allowedActions: [ManageAllowedAction.REMOVE],
        row: createMockRow(false)
      })

      const mainButton = wrapper.findComponent(UButton)
      expect(mainButton.props('label')).toBe('label.remove')
      expect(wrapper.findComponent(UDropdownMenu as any).exists()).toBe(false)
    })

    it('should allow all actions if allowedActions is undefined', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(false)

      const wrapper = await mountComponent({ allowedActions: undefined })

      const mainButton = wrapper.findComponent(UButton)
      expect(mainButton.props('label')).toBe('label.change')

      const dropdown = wrapper.findComponent(UDropdownMenu as any)
      expect(dropdown.exists()).toBe(true)
      expect(dropdown.props('items')).toHaveLength(1)
    })

    it('should show Change button if only ROLE_CHANGE is allowed', async () => {
      const wrapper = await mountComponent({
        allowedActions: [ManageAllowedAction.ROLE_CHANGE],
        row: createMockRow(false)
      })

      expect(wrapper.findComponent(UButton).props('label')).toBe('label.change')
      expect(wrapper.findComponent(UDropdownMenu as any).exists()).toBe(false)
    })

    it('should show Change button if only ADDRESS_CHANGE is allowed', async () => {
      const wrapper = await mountComponent({
        allowedActions: [ManageAllowedAction.ADDRESS_CHANGE],
        row: createMockRow(false)
      })

      expect(wrapper.findComponent(UButton).props('label')).toBe('label.change')
      expect(wrapper.findComponent(UDropdownMenu as any).exists()).toBe(false)
    })

    it('should show Change button if only NAME_CHANGE is allowed', async () => {
      const wrapper = await mountComponent({
        allowedActions: [ManageAllowedAction.NAME_CHANGE],
        row: createMockRow(false)
      })

      expect(wrapper.findComponent(UButton).props('label')).toBe('label.change')
      expect(wrapper.findComponent(UDropdownMenu as any).exists()).toBe(false)
    })

    it('should show Undo even allowedActions is empty (if row is already edited)', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(true)

      const wrapper = await mountComponent({
        allowedActions: [],
        row: createMockRow(false)
      })

      const mainButton = wrapper.findComponent(UButton)
      expect(mainButton.props('label')).toBe('label.undo')
    })

    it('should keep Undo as main action and push Remove to dropdown when edited', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(true)

      const wrapper = await mountComponent({
        allowedActions: [ManageAllowedAction.REMOVE],
        row: createMockRow(false)
      })

      expect(wrapper.findComponent(UButton).props('label')).toBe('label.undo')

      const dropdown = wrapper.findComponent(UDropdownMenu as any)
      expect(dropdown.exists()).toBe(true)
      expect(dropdown.props('items')[0].label).toBe('label.remove')
    })

    it('should show Undo as main action for a NEW row that has been edited', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(true)

      const wrapper = await mountComponent({
        allowedActions: [],
        row: createMockRow(true)
      })

      expect(wrapper.findComponent(UButton).props('label')).toBe('label.undo')
    })
  })
})
