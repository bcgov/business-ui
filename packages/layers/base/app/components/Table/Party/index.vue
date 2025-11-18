<script setup lang="ts" generic="T extends PartyStateBase">
defineProps<{
  data?: TablePartyState<T>[]
  columns: TablePartyColumn<T>[]
  loading?: boolean
  emptyText?: string
}>()

defineEmits<{
  'init-edit': [row: TablePartyRow<T>]
  'undo': [row: TablePartyRow<T>]
  'table-action': []
  'remove': [row: TablePartyRow<T>]
}>()

const { expanded, getIsRowRemoved, getIsRowEdited } = usePartyTable()

// apply border to top of table row if expanded except for 1st row
const expandedTrClass = computed(() =>
  (typeof expanded.value === 'object' && expanded.value !== null && expanded.value[0] === true)
    ? ''
    : 'data-[expanded=true]:border-t-6 data-[expanded=true]:border-gray-100'
)
</script>

<template>
  <UTable
    v-model:expanded="expanded"
    :data
    :loading
    :columns
    sticky
    :ui="{
      root: 'bg-white rounded-sm ring ring-gray-200',
      tbody: 'px-10',
      th: 'bg-shade-secondary text-neutral-highlighted px-2',
      td: 'px-0 py-0 text-neutral-highlighted align-top',
      tr: expandedTrClass
    }"
  >
    <template #actions-cell="{ row }">
      <TableColumnActions
        :row
        :is-removed="getIsRowRemoved(row)"
        :is-edited="getIsRowEdited(row)"
        @init-edit="$emit('init-edit', row)"
        @undo="$emit('undo', row)"
        @remove="$emit('remove', row)"
      />
    </template>

    <template #expanded="{ row }">
      <div :class="{ 'border-b-6 border-shade': (data && row.index !== data.length - 1) }">
        <slot name="expanded" :row />
      </div>
    </template>

    <template #empty>
      <div class="text-neutral text-left text-base px-6">
        {{ emptyText ?? $t('text.noDataToDisplay') }}
      </div>
    </template>
  </UTable>
</template>
