<script setup lang="ts" generic="T extends { actions: ActionType[], isEditing: boolean }">
import type { ExpandedState } from '@tanstack/vue-table'
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  data?: TableBusinessState<T>[]
  columns: TableBusinessColumn<T>[]
  loading?: boolean
  emptyText?: string
  allowedActions?: ManageAllowedAction[]
  preventActions?: boolean
  getCustomDropdownItems?: (row: TableBusinessRow<T>) => DropdownMenuItem[]
  hideActionsWhen?: (row: TableBusinessRow<T>) => boolean
}>()

defineEmits<{
  'init-edit': [row: TableBusinessRow<T>]
  'undo': [row: TableBusinessRow<T>]
  'remove': [row: TableBusinessRow<T>]
  'action-prevented': []
}>()

const expanded = defineModel<ExpandedState | undefined>('expanded', { required: true })

const trClass = '[&:has([data-is-editing="true"])]:hidden'
</script>

<template>
  <UTable
    v-model:expanded="expanded"
    :data
    :loading
    :columns
    sticky
    :ui="{
      root: 'bg-white rounded-sm',
      tbody: 'px-10',
      th: 'text-neutral-highlighted px-2',
      td: 'text-neutral-highlighted align-top text-sm whitespace-normal p-0',
      tr: trClass
    }"
  >
    <template #actions-cell="{ row }">
      <div
        v-if="row.original.new.isEditing"
        data-is-editing="true"
        class="hidden"
      />
      <TableColumnActions
        v-if="(row.depth === 0 || !getIsRowRemoved(row.getParentRow())) && !hideActionsWhen?.(row)"
        :row
        :allowed-actions="allowedActions"
        :prevent-actions="preventActions"
        :get-custom-dropdown-items="getCustomDropdownItems"
        @init-edit="$emit('init-edit', row)"
        @undo="$emit('undo', row)"
        @remove="$emit('remove', row)"
        @action-prevented="$emit('action-prevented')"
      />
    </template>

    <template #expanded="{ row }">
      <slot name="expanded" :row />
    </template>

    <template #empty>
      <div class="text-neutral text-left text-base px-6">
        {{ emptyText ?? $t('text.noDataToDisplay') }}
      </div>
    </template>
  </UTable>
</template>
