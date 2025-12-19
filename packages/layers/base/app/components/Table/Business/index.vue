<script setup lang="ts" generic="T extends { actions: ActionType[] }">
import type { ExpandedState } from '@tanstack/vue-table'

defineProps<{
  data?: TableBusinessState<T>[]
  columns: TableBusinessColumn<T>[]
  loading?: boolean
  emptyText?: string
  allowedActions?: ManageAllowedAction[]
}>()

defineEmits<{
  'init-edit': [row: TableBusinessRow<T>]
  'undo': [row: TableBusinessRow<T>]
  'table-action': []
  'remove': [row: TableBusinessRow<T>]
}>()

const expanded = defineModel<ExpandedState | undefined>('expanded', { required: true })

// apply border to top of table row if expanded except for 1st row
const expandedTrClass = computed(() =>
  (typeof expanded.value === 'object' && expanded.value !== null && expanded.value[0] === true)
    ? ''
    : 'data-[expanded=true]:border-t-6 data-[expanded=true]:border-gray-100'
)
</script>

<template>
  <UTable
    v-model:expanded="expanded"
    :data
    :loading
    :columns
    sticky
    :ui="{
      root: 'bg-white rounded-sm ring ring-gray-200',
      tbody: 'px-10',
      th: 'bg-shade-secondary text-neutral-highlighted px-2',
      td: 'px-2 py-4 text-neutral-highlighted align-top text-sm whitespace-normal',
      tr: expandedTrClass
    }"
  >
    <template #actions-cell="{ row }">
      <TableColumnActions
        :row
        :allowed-actions="allowedActions"
        @init-edit="$emit('init-edit', row)"
        @undo="$emit('undo', row)"
        @remove="$emit('remove', row)"
      />
    </template>

    <template #expanded="{ row }">
      <div :class="{ 'border-b-6 border-shade': (data && row.index !== data.length - 1) }">
        <slot name="expanded" :row />
      </div>
    </template>

    <template #empty>
      <div class="text-neutral text-left text-base px-6">
        {{ emptyText ?? $t('text.noDataToDisplay') }}
      </div>
    </template>
  </UTable>
</template>
