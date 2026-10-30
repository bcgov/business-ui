<script setup lang="ts" generic="T extends { actions: ActionType[] }">
import type { DropdownMenuItem } from '@nuxt/ui'

const {
  row,
  allowedActions,
  preventActions,
  labelOverrides,
  getCustomDropdownItems,
  editOptions,
  primaryAction = 'edit'
} = defineProps<{
  row: TableBusinessRow<T>
  allowedActions?: ManageAllowedAction[]
  preventActions?: boolean
  labelOverrides?: TableLabelOverrides
  getCustomDropdownItems?: (row: TableBusinessRow<T>) => DropdownMenuItem[]
  /** one edit entry per option for existing rows (e.g. address only) instead of the single "Change" entry */
  editOptions?: TableEditOption[]
  /** which action is the main button; 'remove' puts the remove entry first (e.g. "Cease" for directors) */
  primaryAction?: TablePrimaryAction
}>()

const emit = defineEmits<{
  // `actions` is set when the edit was opened from an edit option, limiting the form to those actions
  'init-edit': [actions?: ManageAllowedAction[]]
  'undo': []
  'remove': []
  'action-prevented': []
}>()

const { t } = useI18n()

interface RowAction {
  label: string
  icon?: string
  click: () => void
}

function isActionAllowed(action: ManageAllowedAction) {
  return !allowedActions || allowedActions.includes(action)
}

function emitAction(event: 'init-edit' | 'undo' | 'remove', editActions?: ManageAllowedAction[]) {
  if (preventActions) {
    emit('action-prevented')
    return
  }
  switch (event) {
    case 'init-edit': return emit('init-edit', editActions)
    case 'undo': return emit('undo')
    case 'remove': return emit('remove')
    default: return
  }
}

const isAdded = computed(() => row.original.old === undefined)
const isRemoved = computed(() => getIsRowRemoved(row))
const isEdited = computed(() => getIsRowEdited(row))
const isRemovedOrEdited = computed(() => isRemoved.value || isEdited.value)
const canRemove = computed(() => isActionAllowed(ManageAllowedAction.REMOVE) || isAdded.value)
const canChange = computed(() => {
  const allowed = isActionAllowed(ManageAllowedAction.ADDRESS_CHANGE)
    || isActionAllowed(ManageAllowedAction.EFFECTIVE_DATE_CHANGE)
    || isActionAllowed(ManageAllowedAction.NAME_CHANGE)
    || isActionAllowed(ManageAllowedAction.ROLE_CHANGE)
    || isActionAllowed(ManageAllowedAction.CHANGE)
  return allowed || isAdded.value
})

// the single "Change"/"Edit" entry, or one entry per edit option the row is allowed
// (added rows always get the single entry - their form allows every edit)
const editActions = computed<RowAction[]>(() => {
  if (!canChange.value || isRemoved.value) {
    return []
  }
  if (editOptions?.length && !isAdded.value) {
    return editOptions
      .filter(option => option.actions.some(isActionAllowed))
      .map(option => ({
        label: option.label,
        icon: option.icon,
        click: () => emitAction('init-edit', option.actions)
      }))
  }
  return [{
    label: isAdded.value
      ? t('label.edit')
      : labelOverrides?.editLabel || t('label.change'),
    icon: 'i-mdi-pencil',
    click: () => emitAction('init-edit')
  }]
})

const removeAction = computed<RowAction | undefined>(() => {
  if (!canRemove.value || isRemoved.value) {
    return undefined
  }
  return {
    // old is always undefined for newly added rows
    label: isAdded.value
      ? t('label.remove')
      : labelOverrides?.removeLabel || t('label.delete'),
    icon: labelOverrides?.removeIcon || 'i-mdi-delete',
    click: () => emitAction('remove')
  }
})

const availableActions = computed<RowAction[]>(() => {
  const actions: RowAction[] = []

  if (isRemovedOrEdited.value) {
    actions.push({
      label: t('label.undo'),
      icon: 'i-mdi-undo',
      click: () => emitAction('undo')
    })
  }

  const ordered = primaryAction === 'remove'
    ? [removeAction.value, ...editActions.value]
    : [...editActions.value, removeAction.value]
  actions.push(...ordered.filter((action): action is RowAction => !!action))

  return actions
})

const mainAction = computed(() => availableActions.value[0])
const dropdownActions = computed(() => {
  const items: DropdownMenuItem[] = []

  if (getCustomDropdownItems) {
    const customItems = getCustomDropdownItems(row)
    items.push(...customItems.map(item => ({
      ui: {
        item: 'text-primary',
        itemLeadingIcon: 'text-primary'
      },
      ...item,
      onSelect: (e: Event) => {
        if (preventActions) {
          return emit('action-prevented')
        }
        return item.onSelect?.(e)
      }
    })))
  }

  const defaultItems = availableActions.value.slice(1).map(action => ({
    label: action.label,
    icon: action.icon,
    onSelect: action.click,
    ui: {
      item: 'text-primary',
      itemLeadingIcon: 'text-primary'
    }
  }))

  if (defaultItems.length) {
    items.push(...defaultItems)
  }

  return items
})
const hasDropdownActions = computed(() => dropdownActions.value.length > 0 && !getIsRowRemoved(row))
</script>

<template>
  <div class="flex justify-end">
    <UFieldGroup v-if="mainAction" class="divide-x divide-line-muted">
      <UButton
        variant="ghost"
        :label="mainAction.label"
        :icon="mainAction.icon"
        @click="mainAction.click"
      />
      <UDropdownMenu
        v-if="hasDropdownActions"
        :items="dropdownActions"
        :content="{
          align: 'end',
          onCloseAutoFocus: (e: Event) => preventActions && e.preventDefault()
        }"
      >
        <UButton
          variant="ghost"
          icon="i-mdi-caret-down"
          class="px-4 data-[state=open]:bg-(--ui-primary)/25 group"
          :aria-label="t('label.moreActions')"
          :ui="{
            leadingIcon: 'shrink-0 group-data-[state=open]:rotate-180 transition-transform duration-200'
          }"
        />
      </UDropdownMenu>
    </UFieldGroup>
  </div>
</template>
