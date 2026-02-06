<script setup lang="ts" generic="T extends { actions: ActionType[] }">
import type { DropdownMenuItem } from '@nuxt/ui'

const {
  row,
  allowedActions,
  preventActions,
  getCustomDropdownItems
} = defineProps<{
  row: TableBusinessRow<T>
  allowedActions?: ManageAllowedAction[]
  preventActions?: boolean
  getCustomDropdownItems?: (row: TableBusinessRow<T>) => DropdownMenuItem[]
}>()

const emit = defineEmits<{
  'init-edit': []
  'undo': []
  'remove': []
  'action-prevented': []
}>()

const { t } = useI18n()

function isActionAllowed(action: ManageAllowedAction) {
  return !allowedActions || allowedActions.includes(action)
}

function emitAction(event: 'init-edit' | 'undo' | 'remove') {
  if (preventActions) {
    emit('action-prevented')
    return
  }
  switch (event) {
    case 'init-edit': return emit('init-edit')
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
    || isActionAllowed(ManageAllowedAction.NAME_CHANGE)
    || isActionAllowed(ManageAllowedAction.ROLE_CHANGE)
  return allowed || isAdded.value
})

const availableActions = computed(() => {
  const actions = []

  if (isRemovedOrEdited.value) {
    actions.push({
      label: t('label.undo'),
      icon: 'i-mdi-undo',
      click: () => emitAction('undo')
    })
  }

  if (canChange.value && !isRemoved.value) {
    actions.push({
      label: t('label.change'),
      icon: 'i-mdi-pencil',
      click: () => emitAction('init-edit')
    })
  }

  if (canRemove.value && !isRemoved.value) {
    actions.push({
      label: t('label.remove'),
      icon: 'i-mdi-delete',
      click: () => emitAction('remove')
    })
  }

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
const hasDropdownActions = computed(() => dropdownActions.value.length > 0)
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
          onCloseAutoFocus: (e) => preventActions && e.preventDefault()
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
