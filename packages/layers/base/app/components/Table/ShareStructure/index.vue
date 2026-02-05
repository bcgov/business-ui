<script setup lang="ts" generic="T extends ShareClassSchema = ShareClassSchema">
import type { ExpandedState } from '@tanstack/vue-table'

defineProps<{
  data?: TableBusinessState<T>[]
  loading?: boolean
  emptyText?: string
  allowedActions?: ManageAllowedAction[]
  preventActions?: boolean
}>()

const shareStructureColumns = getShareStructureTableColumns<T>()
const expanded = defineModel<ExpandedState | undefined>('expanded', { required: true })
</script>

<template>
  <TableBusiness
    v-model:expanded="expanded"
    :data
    :loading
    :empty-text="emptyText"
    :columns="shareStructureColumns"
    :allowed-actions="allowedActions"
    :prevent-actions="preventActions"
    :sorting="[{ id: 'priority', desc: false }]"
    :column-visibility="{ priority: false }"
    :get-sub-rows="(row: TableBusinessState<T>) =>
      row.new.series?.map(s => ({ new: s, old: s })) as unknown as TableBusinessState<T>[]
    "
  >
    <template #expanded="{ row }">
      <slot name="expanded" :row />
    </template>
  </TableBusiness>
</template>
