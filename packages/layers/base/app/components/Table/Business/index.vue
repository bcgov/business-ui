<script setup lang="ts" generic="T extends { actions: ActionType[] }">
import type { ExpandedState } from '@tanstack/vue-table'

const props = defineProps<{
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

const expandedTrClass = computed(() => {
  const expandedKeys = (typeof expanded.value === 'object' && expanded.value !== null)
    ? Object.keys(expanded.value)
    : []

  const rowIndex = expandedKeys.length > 0 ? Number(expandedKeys[0]) : undefined

  const isFirstRow = rowIndex === 0
  const isLastRow = props.data && rowIndex !== undefined && rowIndex === props.data.length - 1

  let classes = ''

  if (!isFirstRow) {
    classes += 'data-[expanded=true]:border-t-6 data-[expanded=true]:border-shade '
  }

  if (!isLastRow) {
    classes += '[&[data-expanded=true]+tr]:border-b-6 [&[data-expanded=true]+tr]:border-shade'
  }

  return classes
})
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
      td: 'px-4 pt-4 text-neutral-highlighted align-top text-sm whitespace-normal',
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
      <slot name="expanded" :row />
    </template>

    <template #empty>
      <div class="text-neutral text-left text-base px-6">
        {{ emptyText ?? $t('text.noDataToDisplay') }}
      </div>
    </template>
  </UTable>
</template>
