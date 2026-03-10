<script setup lang="ts" generic="T extends PartySchema = PartySchema">
import type { ExpandedState } from '@tanstack/vue-table'

const {
  columns = ['name', 'mailing', 'delivery', 'actions'],
  labelOverrides
} = defineProps<{
  data?: TableBusinessState<T>[]
  loading?: boolean
  emptyText?: string
  allowedActions?: ManageAllowedAction[]
  preventActions?: boolean
  labelOverrides?: TableLabelOverrides
  columns?: TablePartyColumnName[]
}>()

const partyColumns = getPartyTableColumns<T>(columns, labelOverrides?.badges)
const expanded = defineModel<ExpandedState | undefined>('expanded', { required: true })
</script>

<template>
  <TableBusiness
    v-model:expanded="expanded"
    :data
    :loading
    :empty-text="emptyText"
    :columns="partyColumns"
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
