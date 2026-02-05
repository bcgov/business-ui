<script setup lang="ts" generic="T extends PartySchema = PartySchema">
import type { ExpandedState } from '@tanstack/vue-table'

const {
  columns = ['name', 'delivery', 'mailing', 'actions']
} = defineProps<{
  data?: TableBusinessState<T>[]
  loading?: boolean
  emptyText?: string
  allowedActions?: ManageAllowedAction[]
  preventActions?: boolean
  columns?: TablePartyColumnName[]
}>()

const partyColumns = getPartyTableColumns<T>(columns)
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
  >
    <template #expanded="{ row }">
      <slot name="expanded" :row />
    </template>
  </TableBusiness>
</template>
