<script setup lang="ts" generic="T extends OfficesSchema = OfficesSchema">
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
}>()

const officesColumns = getOfficesTableColumns<T>(labelOverrides?.badges)
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
    :label-overrides="labelOverrides"
  >
    <template #expanded="{ row }">
      <div class="py-4 sm:py-7.5">
        <slot name="expanded" :row />
      </div>
    </template>
  </TableBusiness>
</template>
