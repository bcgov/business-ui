<script setup lang="ts" generic="T extends ShareClassSchema = ShareClassSchema">
import type { ExpandedState } from '@tanstack/vue-table'
import type { DropdownMenuItem } from '@nuxt/ui'

const props = defineProps<{
  data?: TableBusinessState<T>[]
  loading?: boolean
  emptyText?: string
  allowedActions?: ManageAllowedAction[]
  preventActions?: boolean
}>()

const emit = defineEmits<{
  'move-row': [row: TableBusinessRow<T>, direction: 'up' | 'down']
  'add-series': [row: TableBusinessRow<T>]
}>()

const { t } = useI18n()

const shareStructureColumns = getShareStructureTableColumns<T>()
const expanded = defineModel<ExpandedState | undefined>('expanded', { required: true, default: {} })

// ensure all items are always expanded
watch(() => props.data, (newData) => {
  if (!newData) {
    return
  }

  const allParentIds = Object.fromEntries(
    newData.map(item => [item.new.id, true])
  )

  expanded.value = { ...allParentIds, ...(expanded.value as object ?? {}) }
}, { immediate: true })

function disableChangePriority(row: TableBusinessRow<T>, direction: 'up' | 'down') {
  const isClass = row.depth === 0
  // get the list (class or series) to compare
  const list = isClass
    ? props.data?.map(d => d.new)
    : row.getParentRow()?.original.new.series

  if (!list || list.length <= 1) {
    return true
  }

  const currentPriority = row.original.new.priority

  // check if the given row has any rows above or below it
  return direction === 'up'
    ? !list.some(item => item.priority < currentPriority)
    : !list.some(item => item.priority > currentPriority)
}

function getCustomDropdownItems(row: TableBusinessRow<T>) {
  const hasRor = row.original.new.hasRightsOrRestrictions

  const items: DropdownMenuItem[] = []

  if (hasRor && row.depth === 0) {
    items.push({
      label: t('label.addSeries'),
      icon: 'i-mdi-playlist-add',
      onSelect: () => emit('add-series', row)
    })
  }

  items.push(
    {
      label: t('label.moveUp'),
      icon: 'i-mdi-arrow-up',
      disabled: disableChangePriority(row, 'up'),
      onSelect: () => emit('move-row', row, 'up')
    },
    {
      label: t('label.moveDown'),
      icon: 'i-mdi-arrow-down',
      disabled: disableChangePriority(row, 'down'),
      onSelect: () => emit('move-row', row, 'down')
    }
  )

  return items
}
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
    :get-custom-dropdown-items="getCustomDropdownItems"
    :sorting="[{ id: 'priority', desc: false }]"
    :column-visibility="{ priority: false }"
    :get-row-id="(row: TableBusinessState<T>) => row.new.id"
    :get-sub-rows="(row: TableBusinessState<T>) => {
      const newSeries = row.new.series || []
      const oldSeries = row.old?.series || []
      // normalize sub rows to satisfy type definition
      return newSeries.map(s => ({
        new: s,
        old: oldSeries.find(os => os.id === s.id)
      }))
    }"
  >
    <template #expanded="{ row }">
      <slot name="expanded" :row />
    </template>
  </TableBusiness>
</template>
