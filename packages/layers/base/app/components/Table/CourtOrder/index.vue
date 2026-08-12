<script setup lang="ts" generic="T extends CourtOrderPoaFullSchema = CourtOrderPoaFullSchema">
import type { ExpandedState } from '@tanstack/vue-table'

const {
  labelOverrides
} = defineProps<{
  data?: TableBusinessState<T>[]
  loading?: boolean
  emptyText?: string
  allowedActions?: ManageAllowedAction[]
  preventActions?: boolean
  labelOverrides?: TableLabelOverrides
  taskGuardConfig?: {
    message?: string
    messageId: string
    targetId: string
  }
}>()

const columns = getCourtOrderTableColumns<T>(labelOverrides?.badges)
const expanded = defineModel<ExpandedState | undefined>('expanded')
</script>

<template>
  <TableBusiness
    v-model:expanded="expanded"
    :data
    :loading
    :empty-text
    :columns
    :allowed-actions
    :prevent-actions
    :label-overrides
    :task-guard-config
  >
    <template #expanded="{ row }">
      <div class="py-4 sm:py-7.5">
        <slot name="expanded" :row />
      </div>
    </template>
  </TableBusiness>
</template>
