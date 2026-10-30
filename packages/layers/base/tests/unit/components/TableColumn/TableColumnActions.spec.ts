/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { TableColumnActions, UButton, UDropdownMenu } from '#components'

const { mockGetIsRowEdited } = vi.hoisted(() => ({ mockGetIsRowEdited: vi.fn() }))
mockNuxtImport('getIsRowEdited', () => mockGetIsRowEdited)

const { mockGetIsRowRemoved } = vi.hoisted(() => ({ mockGetIsRowRemoved: vi.fn() }))
mockNuxtImport('getIsRowRemoved', () => mockGetIsRowRemoved)

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
      expect(mainButton.props('label')).toBe('Change')
    })

    it('should render "Undo" button when edited', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(true)
      const wrapper = await mountComponent()
      const mainButton = wrapper.findComponent(UButton)

      expect(mainButton.exists()).toBe(true)
      expect(mainButton.props('icon')).toBe('i-mdi-undo')
      expect(mainButton.props('label')).toBe('Undo')
    })

    it('should render "Undo" button when removed', async () => {
      mockGetIsRowRemoved.mockReturnValue(true)
      mockGetIsRowEdited.mockReturnValue(false)
      const wrapper = await mountComponent()
      const mainButton = wrapper.findComponent(UButton)

      expect(mainButton.exists()).toBe(true)
      expect(mainButton.props('icon')).toBe('i-mdi-undo')
      expect(mainButton.props('label')).toBe('Undo')
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

    it('should only have delete action when not edited', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(false)
      const wrapper = await mountComponent()
      const dropdown = wrapper.findComponent(UDropdownMenu) as any
      const items = dropdown.props('items')

      expect(items).toHaveLength(1)
      expect(items[0].label).toBe('Delete')
      expect(items[0].icon).toBe('i-mdi-delete')
    })

    it('should have change and delete actions when edited', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(true)
      const wrapper = await mountComponent()
      const dropdown = wrapper.findComponent(UDropdownMenu) as any
      const items = dropdown.props('items')

      expect(items).toHaveLength(2)
      expect(items[0].label).toBe('Change')
      expect(items[0].icon).toBe('i-mdi-pencil')
      expect(items[1].label).toBe('Delete')
      expect(items[1].icon).toBe('i-mdi-delete')
    })

    it('should emit "remove" when remove action is selected', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(false)
      const wrapper = await mountComponent()
      const dropdown = wrapper.findComponent(UDropdownMenu) as any
      const items = dropdown.props('items')

      items[0].onSelect()

      expect(wrapper.emitted('remove')).toHaveLength(1)
    })

    it('should emit "init-edit" when change action is selected', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(true)
      const wrapper = await mountComponent()
      const dropdown = wrapper.findComponent(UDropdownMenu) as any
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

    it('should show Edit and Remove for a NEW row if allowedActions is empty', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(false)

      const wrapper = await mountComponent({
        allowedActions: [],
        row: createMockRow(true)
      })

      expect(wrapper.findComponent(UButton).exists()).toBe(true)
      expect(wrapper.findComponent(UButton).props('label')).toBe('Edit')

      const dropdown = wrapper.findComponent(UDropdownMenu) as any
      expect(dropdown.exists()).toBe(true)
      expect(dropdown.props('items')).toHaveLength(1)
    })

    it('should only show Delete if only REMOVE action is allowed on existing row', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(false)

      const wrapper = await mountComponent({
        allowedActions: [ManageAllowedAction.REMOVE],
        row: createMockRow(false)
      })

      const mainButton = wrapper.findComponent(UButton)
      expect(mainButton.props('label')).toBe('Delete')
      expect(wrapper.findComponent(UDropdownMenu as any).exists()).toBe(false)
    })

    it('should allow all actions if allowedActions is undefined', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(false)

      const wrapper = await mountComponent({ allowedActions: undefined })

      const mainButton = wrapper.findComponent(UButton)
      expect(mainButton.props('label')).toBe('Change')

      const dropdown = wrapper.findComponent(UDropdownMenu) as any
      expect(dropdown.exists()).toBe(true)
      expect(dropdown.props('items')).toHaveLength(1)
    })

    it('should show Change button if only ROLE_CHANGE is allowed', async () => {
      const wrapper = await mountComponent({
        allowedActions: [ManageAllowedAction.ROLE_CHANGE],
        row: createMockRow(false)
      })

      expect(wrapper.findComponent(UButton).props('label')).toBe('Change')
      expect(wrapper.findComponent(UDropdownMenu as any).exists()).toBe(false)
    })

    it('should show Change button if only ADDRESS_CHANGE is allowed', async () => {
      const wrapper = await mountComponent({
        allowedActions: [ManageAllowedAction.ADDRESS_CHANGE],
        row: createMockRow(false)
      })

      expect(wrapper.findComponent(UButton).props('label')).toBe('Change')
      expect(wrapper.findComponent(UDropdownMenu as any).exists()).toBe(false)
    })

    it('should show Change button if only NAME_CHANGE is allowed', async () => {
      const wrapper = await mountComponent({
        allowedActions: [ManageAllowedAction.NAME_CHANGE],
        row: createMockRow(false)
      })

      expect(wrapper.findComponent(UButton).props('label')).toBe('Change')
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
      expect(mainButton.props('label')).toBe('Undo')
    })

    it('should keep Undo as main action and push Delete to dropdown when edited', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(true)

      const wrapper = await mountComponent({
        allowedActions: [ManageAllowedAction.REMOVE],
        row: createMockRow(false)
      })

      expect(wrapper.findComponent(UButton).props('label')).toBe('Undo')

      const dropdown = wrapper.findComponent(UDropdownMenu) as any
      expect(dropdown.exists()).toBe(true)
      expect(dropdown.props('items')[0].label).toBe('Delete')
    })

    it('should show Undo as main action for a NEW row that has been edited', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(true)

      const wrapper = await mountComponent({
        allowedActions: [],
        row: createMockRow(true)
      })

      expect(wrapper.findComponent(UButton).props('label')).toBe('Undo')
    })
  })

  describe('Edit Options and Primary Action', () => {
    const editOptions = [
      { label: 'Change Address', actions: [ManageAllowedAction.ADDRESS_CHANGE] },
      { label: 'Change Legal Name', actions: [ManageAllowedAction.NAME_CHANGE] }
    ]

    function dropdownLabels(wrapper: any) {
      return (wrapper.findComponent(UDropdownMenu) as any).props('items').map((i: any) => i.label)
    }

    it('should replace the Change entry with one entry per edit option for an existing row', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(false)
      const wrapper = await mountComponent({ editOptions })

      // the first option is the main button, the rest and Delete sit in the dropdown
      expect(wrapper.findComponent(UButton).props('label')).toBe('Change Address')
      expect(dropdownLabels(wrapper)).toEqual(['Change Legal Name', 'Delete'])
    })

    it('should emit "init-edit" with the actions of the chosen option', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(false)
      const wrapper = await mountComponent({ editOptions })

      await wrapper.find('button').trigger('click')

      expect(wrapper.emitted('init-edit')).toEqual([[[ManageAllowedAction.ADDRESS_CHANGE]]])
    })

    it('should only list the edit options the row is allowed', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(false)
      const wrapper = await mountComponent({
        editOptions,
        allowedActions: [ManageAllowedAction.NAME_CHANGE, ManageAllowedAction.REMOVE]
      })

      expect(wrapper.findComponent(UButton).props('label')).toBe('Change Legal Name')
      expect(dropdownLabels(wrapper)).toEqual(['Delete'])
    })

    it('should keep the single Edit entry for a NEW row even with edit options', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(false)
      const wrapper = await mountComponent({ editOptions, row: createMockRow(true) })

      expect(wrapper.findComponent(UButton).props('label')).toBe('Edit')
      await wrapper.find('button').trigger('click')
      expect(wrapper.emitted('init-edit')).toEqual([[undefined]])
    })

    it('should put the remove entry first with its overrides when primaryAction is remove', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(false)
      const wrapper = await mountComponent({
        editOptions,
        primaryAction: 'remove',
        labelOverrides: { removeLabel: 'Cease', removeIcon: 'i-mdi-close' }
      })

      const mainButton = wrapper.findComponent(UButton)
      expect(mainButton.props('label')).toBe('Cease')
      expect(mainButton.props('icon')).toBe('i-mdi-close')
      expect(dropdownLabels(wrapper)).toEqual(['Change Address', 'Change Legal Name'])

      await wrapper.find('button').trigger('click')
      expect(wrapper.emitted('remove')).toHaveLength(1)
    })

    it('should keep Undo as the main button once the row is edited, with the remove entry next', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(true)
      const wrapper = await mountComponent({
        editOptions,
        primaryAction: 'remove',
        labelOverrides: { removeLabel: 'Cease' }
      })

      expect(wrapper.findComponent(UButton).props('label')).toBe('Undo')
      expect(dropdownLabels(wrapper)).toEqual(['Cease', 'Change Address', 'Change Legal Name'])
    })

    it('should use the remove label override without edit options and keep Remove for a NEW row', async () => {
      mockGetIsRowRemoved.mockReturnValue(false)
      mockGetIsRowEdited.mockReturnValue(false)
      const existing = await mountComponent({ labelOverrides: { removeLabel: 'Cease' } })
      expect(dropdownLabels(existing)).toEqual(['Cease'])

      const added = await mountComponent({ labelOverrides: { removeLabel: 'Cease' }, row: createMockRow(true) })
      expect(dropdownLabels(added)).toEqual(['Remove'])
    })
  })
})
