<script setup lang="ts" generic="T extends NameTranslationSchema = NameTranslationSchema">
import type { ExpandedState } from '@tanstack/vue-table'

const {
  data,
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

const nameTranslationColumns = getNameTranslationTableColumns<T>(labelOverrides?.badges)
const expanded = defineModel<ExpandedState | undefined>('expanded', { required: true })

// Local reference to the currently editing item
let activeEditingRow: T | null = null

watch(
  expanded,
  (v) => {
    if (!data) {
      return
    }

    // 1. Reset previous editing row
    if (activeEditingRow) {
      activeEditingRow.isEditing = false
      activeEditingRow = null
    }

    // 2. Set the newly expanded row to true
    if (v) {
      // Get the ExpandedState` key value
      // @ts-expect-error - key can't index type error
      const activeKey = Object.keys(v).find(key => v[key])

      if (activeKey !== undefined) {
        // Find the row item matching the key
        // This will only work if getRowId is set to row.original.new.id
        const target = data.find(item => item.new?.id === activeKey)?.new

        if (target) {
          target.isEditing = true
          activeEditingRow = target
        }
      }
    }
  },
  { deep: true, immediate: true }
)
</script>

<template>
  <TableBusiness
    v-model:expanded="expanded"
    :data
    :loading
    :empty-text="emptyText"
    :hide-empty-text="true"
    :columns="nameTranslationColumns"
    :allowed-actions="allowedActions"
    :prevent-actions="preventActions"
    :label-overrides="labelOverrides"
    :hide-actions-when
    :get-row-id="(row: TableBusinessState<T>) => row.new.id"
  >
    <template #expanded="{ row }">
      <div class="py-4 sm:py-7.5">
        <slot name="expanded" :row />
      </div>
    </template>
  </TableBusiness>
</template>
