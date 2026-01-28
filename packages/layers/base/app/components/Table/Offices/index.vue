<script setup lang="ts" generic="T extends OfficesSchema = OfficesSchema">
import type { ExpandedState } from '@tanstack/vue-table'

defineProps<{
  data?: TableBusinessState<T>[]
  loading?: boolean
  emptyText?: string
  allowedActions?: ManageAllowedAction[]
  preventActions?: boolean
}>()

const officesColumns = getOfficesTableColumns<T>()
const expanded = defineModel<ExpandedState | undefined>('expanded', { required: true })
</script>

<template>
  <TableBusiness
    v-model:expanded="expanded"
    :data
    :loading
    :empty-text="emptyText"
    :columns="officesColumns"
    :allowed-actions="allowedActions"
    :prevent-actions="preventActions"
  >
    <template #expanded="{ row }">
      <slot name="expanded" :row />
    </template>
  </TableBusiness>
</template>
