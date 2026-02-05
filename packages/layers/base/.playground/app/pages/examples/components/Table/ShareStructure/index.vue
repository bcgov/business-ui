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

const data: TableBusinessState<ShareClassSchema>[] = [
  {
    new: {
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
      series: [
        {
          actions: [ActionType.ADDED],
          name: 'Class 1 Series 1',
          priority: 1,
          maxNumberOfShares: 5,
          hasMaximumShares: true,
          hasRightsOrRestrictions: true,
          uuid: crypto.randomUUID()
        },
        {
          actions: [ActionType.ADDED],
          name: 'Class 1 Series 2',
          priority: 2,
          maxNumberOfShares: 5,
          hasMaximumShares: true,
          hasRightsOrRestrictions: true,
          uuid: crypto.randomUUID()
        }
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
      series: [
        {
          actions: [],
          name: 'Class 1 Series 1',
          priority: 1,
          maxNumberOfShares: 5,
          hasMaximumShares: true,
          hasRightsOrRestrictions: true,
          uuid: crypto.randomUUID()
        },
        {
          actions: [],
          name: 'Class 1 Series 2',
          priority: 2,
          maxNumberOfShares: 5,
          hasMaximumShares: true,
          hasRightsOrRestrictions: true,
          uuid: crypto.randomUUID()
        }
      ]
    }
  },
  {
    new: {
      actions: [ActionType.ADDED],
      name: 'Share Class 2',
      priority: 1,
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
  { 0: true }
  // Object.fromEntries(data.map(item => [item.new.uuid, true]))
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
    >
      <template #expanded="{ row }">
        <div class="max-w-sm">
          <!-- {{ row }} -->
        </div>
      </template>
    </TableShareStructure>
  </div>
</template>
