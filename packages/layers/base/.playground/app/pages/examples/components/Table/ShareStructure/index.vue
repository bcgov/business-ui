<script setup lang="ts">
import type { ExpandedState } from '@tanstack/vue-table'

definePageMeta({
  layout: 'connect-auth'
})

function removeFn(row: TableBusinessRow<ShareClassSchema>) {
  console.info('remove: ', row)
  // row.original.new.actions - typed
  // row.original.new.roles - typed
  // row.original.new.address - typed
  // row.original.new.name - typed
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
      actions: [],
      name: 'Share Class 1',
      priority: 1,
      maxNumberOfShares: 10,
      parValue: 2,
      currency: 'CAD',
      hasMaximumShares: true,
      hasParValue: true,
      hasRightsOrRestrictions: true,
      uuid: shareClass1Id,
      series: [
        {
          actions: [],
          name: 'Class 1 Series 1',
          priority: 1,
          maxNumberOfShares: 5,
          hasMaximumShares: true,
          hasRightsOrRestrictions: true,
          uuid: class1Series1Id
        },
        {
          actions: [],
          name: 'Class 1 Series 2',
          priority: 2,
          maxNumberOfShares: 5,
          hasMaximumShares: true,
          hasRightsOrRestrictions: true,
          uuid: class1Series2Id
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
      uuid: shareClass1Id,
      series: [
        {
          actions: [],
          name: 'Class 1 Series 1',
          priority: 1,
          maxNumberOfShares: 5,
          hasMaximumShares: true,
          hasRightsOrRestrictions: true,
          uuid: class1Series1Id
        },
        {
          actions: [],
          name: 'Class 1 Series 2',
          priority: 2,
          maxNumberOfShares: 5,
          hasMaximumShares: true,
          hasRightsOrRestrictions: true,
          uuid: class1Series2Id
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
      uuid: crypto.randomUUID(),
      series: [
        // {
        //   actions: [ActionType.ADDED],
        //   name: 'Class 2 Series 1',
        //   priority: 1,
        //   maxNumberOfShares: 5,
        //   hasMaximumShares: true,
        //   hasRightsOrRestrictions: true,
        //   uuid: crypto.randomUUID()
        // },
        // {
        //   actions: [ActionType.ADDED],
        //   name: 'Class 2 Series 2',
        //   priority: 2,
        //   maxNumberOfShares: 5,
        //   hasMaximumShares: true,
        //   hasRightsOrRestrictions: true,
        //   uuid: crypto.randomUUID()
        // }
      ]
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
      uuid: crypto.randomUUID(),
      series: []
    }
  }
]

const expanded = ref<Record<string, boolean>>(
  // { 0: true }
  Object.fromEntries(data.map(item => [item.new.uuid, true]))
)
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
          <!-- {{ row }} -->
        </div>
      </template>
    </TableShareStructure>
  </div>
</template>
