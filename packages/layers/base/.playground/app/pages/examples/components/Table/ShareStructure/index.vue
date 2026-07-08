<script setup lang="ts">
definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ to: '/', label: 'Examples' }, { label: 'TableShareStructure' }]
})

function removeFn(row: TableBusinessRow<ShareClassSchema>) {
  console.info('remove: ', row)
}
function undoFn(row: TableBusinessRow<ShareClassSchema>) {
  console.info('undo: ', row)
}
function initEditFn(row: TableBusinessRow<ShareClassSchema>) {
  console.info('init edit: ', row)
  expanded.value = { [row.index]: true }
}
function moveRowFn(row: TableBusinessRow<ShareClassSchema>, direction: 'up' | 'down') {
  console.info(`move row ${direction}: `, row)
}
function addSeriesFn(row: TableBusinessRow<ShareClassSchema>) {
  console.info('add series: ', row)
}

const shareClass1Id = crypto.randomUUID()
const class1Series1Id = crypto.randomUUID()
const class1Series2Id = crypto.randomUUID()

const data: TableBusinessState<ShareClassSchema>[] = [
  {
    new: {
      actions: [ActionType.REMOVED],
      name: 'Share Class 1',
      priority: 1,
      maxNumberOfShares: 10,
      parValue: 2,
      currency: 'CAD',
      hasMaximumShares: true,
      hasParValue: true,
      hasRightsOrRestrictions: true,
      id: shareClass1Id,
      isEditing: false,
      series: [
        {
          actions: [ActionType.REMOVED],
          name: 'Class 1 Series 1',
          priority: 1,
          maxNumberOfShares: 5,
          hasMaximumShares: true,
          hasRightsOrRestrictions: true,
          id: class1Series1Id,
          isInvalid: false,
          isEditing: false
        },
        {
          actions: [],
          name: 'Class 1 Series 2',
          priority: 2,
          maxNumberOfShares: 5,
          hasMaximumShares: true,
          hasRightsOrRestrictions: true,
          id: class1Series2Id,
          isInvalid: false,
          isEditing: false
        }
      ]
    },
    old: {
      actions: [],
      name: 'Share Class 1',
      priority: 1,
      maxNumberOfShares: 10,
      parValue: 2,
      currency: 'CAD',
      hasMaximumShares: true,
      hasParValue: true,
      hasRightsOrRestrictions: true,
      id: shareClass1Id,
      isEditing: false,
      series: [
        {
          actions: [],
          name: 'Class 1 Series 1',
          priority: 1,
          maxNumberOfShares: 5,
          hasMaximumShares: true,
          hasRightsOrRestrictions: true,
          id: class1Series1Id,
          isInvalid: false,
          isEditing: false
        },
        {
          actions: [],
          name: 'Class 1 Series 2',
          priority: 2,
          maxNumberOfShares: 5,
          hasMaximumShares: true,
          hasRightsOrRestrictions: true,
          id: class1Series2Id,
          isInvalid: false,
          isEditing: false
        }
      ]
    }
  },
  {
    new: {
      actions: [ActionType.ADDED],
      name: 'Share Class 2',
      priority: 2,
      maxNumberOfShares: null,
      parValue: 2,
      currency: 'CAD',
      hasMaximumShares: true,
      hasParValue: true,
      hasRightsOrRestrictions: true,
      id: crypto.randomUUID(),
      isEditing: false,
      series: []
    },
    old: {
      actions: [ActionType.ADDED],
      name: 'Share Class 1',
      priority: 1,
      maxNumberOfShares: 10,
      parValue: 2,
      currency: 'CAD',
      hasMaximumShares: true,
      hasParValue: true,
      hasRightsOrRestrictions: true,
      id: crypto.randomUUID(),
      isEditing: false,
      series: []
    }
  }
]

const expanded = ref<Record<string, boolean>>(Object.fromEntries(data.map(item => [item.new.id, true])))
</script>

<template>
  <div class="p-20">
    <TableShareStructure
      v-model:expanded="expanded"
      :data
      @init-edit="initEditFn"
      @remove="removeFn"
      @undo="undoFn"
      @move-row="moveRowFn"
      @add-series="addSeriesFn"
    >
      <template #expanded="{ row }">
        <div class="max-w-sm">
          {{ row }}
        </div>
      </template>
    </TableShareStructure>
  </div>
</template>
