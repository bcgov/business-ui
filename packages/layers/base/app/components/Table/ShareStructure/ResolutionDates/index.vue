<script setup lang="ts" generic="T extends ResolutionDateSchema = ResolutionDateSchema">
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
  hideActionsWhen?: (row: TableBusinessRow<T>) => boolean
}>()

const columns = getResolutionDatesTableColumns<T>(labelOverrides?.badges)
const expanded = defineModel<ExpandedState | undefined>('expanded')
</script>

<template>
  <TableBusiness
    v-model:expanded="expanded"
    :data
    :loading
    :empty-text
    :columns
    :allowed-actions="allowedActions"
    :prevent-actions="preventActions"
    :label-overrides="labelOverrides"
    :hide-actions-when
  >
    <template #expanded="{ row }">
      <div class="py-4 sm:py-7.5">
        <slot name="expanded" :row />
      </div>
    </template>
  </TableBusiness>
</template>
