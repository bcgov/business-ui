<script setup lang="ts" generic="T extends ShareClassSchema = ShareClassSchema">
import type { ExpandedState } from '@tanstack/vue-table'
import type { DropdownMenuItem } from '@nuxt/ui'

const { data } = defineProps<{
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
const expanded = defineModel<ExpandedState | undefined>('expanded', { required: true })

function disableChangePriority(row: TableBusinessRow<T>, direction: 'up' | 'down') {
  const isShareClass = row.depth === 0
  const list = isShareClass
    ? data?.map(d => d.new)
    : row.getParentRow()?.original.new.series

  if (!list || list.length <= 1) {
    return true
  }

  const currentPriority = row.original.new.priority

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
    :get-row-id="(row: TableBusinessState<T>) => row.new.uuid"
    :get-sub-rows="(row: TableBusinessState<T>) => {
      const newSeries = row.new.series || []
      const oldSeries = row.old?.series || []
      return newSeries.map(s => ({
        new: s,
        old: oldSeries.find(os => os.uuid === s.uuid) ?? undefined
      })) as unknown as TableBusinessState<T>[]
    }
    "
    @action-prevented="() => console.log('action prevented')"
  >
    <template #expanded="{ row }">
      <slot name="expanded" :row />
    </template>
  </TableBusiness>
</template>
