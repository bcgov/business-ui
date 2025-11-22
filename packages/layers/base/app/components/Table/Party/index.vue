<script setup lang="ts" generic="T extends PartySchema = PartySchema">
import type { ExpandedState } from '@tanstack/vue-table'

defineProps<{
  data?: TableBusinessState<T>[]
  loading?: boolean
  emptyText?: string
}>()

const partyColumns = getPartyTableColumns<T>()
const expanded = defineModel<ExpandedState | undefined>('expanded', { required: true })
</script>

<template>
  <TableBusiness
    v-model:expanded="expanded"
    :data
    :loading
    :empty-text="emptyText"
    :columns="partyColumns"
  >
    <template #expanded="{ row }">
      <slot name="expanded" :row />
    </template>
  </TableBusiness>
</template>
