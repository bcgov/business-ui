<script setup lang="ts">
/* eslint-disable max-len */
// https://github.com/bcgov/business-schemas/blob/main/src/registry_schemas/schemas/share_structure.json
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'

definePageMeta({
  layout: 'connect-auth'
})

interface ShareSeries {
  name: string
  priority: number
  maxNumberOfShares: number | null
  hasMaximumShares: boolean
  hasRightsOrRestrictions: boolean
  isEditing?: boolean
  addSeries?: boolean
  uuid: string
}

interface ShareClass {
  name: string
  priority: number
  maxNumberOfShares: number | null
  parValue: number | null
  currency: string | null
  hasMaximumShares: boolean
  hasParValue: boolean
  hasRightsOrRestrictions: boolean
  series?: ShareSeries[]
  isEditing?: boolean
  addSeries?: boolean
  uuid: string
}

const data = ref<ShareClass[]>([
  {
    name: 'Share Class 1',
    priority: 1,
    maxNumberOfShares: 10,
    parValue: 2,
    currency: 'CAD',
    hasMaximumShares: true,
    hasParValue: true,
    hasRightsOrRestrictions: true,
    isEditing: false,
    uuid: crypto.randomUUID(),
    series: [
      {
        name: 'Class 1 Series 1',
        priority: 1,
        maxNumberOfShares: 5,
        hasMaximumShares: true,
        hasRightsOrRestrictions: true,
        uuid: crypto.randomUUID()
      },
      {
        name: 'Class 1 Series 2',
        priority: 2,
        maxNumberOfShares: 5,
        hasMaximumShares: true,
        hasRightsOrRestrictions: true,
        uuid: crypto.randomUUID()
      }
    ]
  },
  {
    name: 'Share Class 2',
    priority: 2,
    maxNumberOfShares: 1000,
    parValue: null,
    currency: '',
    hasMaximumShares: true,
    hasParValue: true,
    hasRightsOrRestrictions: true,
    isEditing: false,
    uuid: crypto.randomUUID(),
    series: [
      {
        name: 'Class 2 Series 1',
        priority: 1,
        maxNumberOfShares: 750,
        hasMaximumShares: true,
        hasRightsOrRestrictions: true,
        uuid: crypto.randomUUID()
      },
      {
        name: 'Class 2 Series 2',
        priority: 2,
        maxNumberOfShares: 250,
        hasMaximumShares: true,
        hasRightsOrRestrictions: true,
        uuid: crypto.randomUUID()
      }
    ]
  }
])

const columns: TableColumn<ShareClass | ShareSeries>[] = [
  {
    accessorKey: 'priority'
  },
  {
    accessorKey: 'name',
    header: 'Name of Share Class or Series',
    cell: ({ row }) => {
      return h(
        'div',
        {
          class: row.depth === 1
            ? [
              'flex items-center gap-2',
              'before:size-1 before:bg-black before:rounded-full'
            ]
            : undefined
        },
        row.original.name
      )
    }
  },
  {
    accessorKey: 'maxNumberOfShares',
    header: 'Maximum Number of Shares'
  },
  {
    accessorKey: 'parValue',
    header: 'Par Value'
  },
  {
    accessorKey: 'currency',
    header: 'Currency'
  },
  {
    accessorKey: 'hasRightsOrRestrictions',
    header: 'Special Rights or Restrictions'
  },
  {
    id: 'actions',
    accessorKey: 'actions',
    header: 'Actions'
  }
]

const expanded = ref<Record<string, boolean>>(
  Object.fromEntries(data.value.map(item => [item.uuid, true]))
)

function changePriority(row: Row<ShareClass | ShareSeries>, direction: 'up' | 'down') {
  const isClass = row.depth === 0
  const list = isClass
    ? data.value
    : data.value.find(item => item.uuid === row.parentId)?.series

  if (!list) {
    return
  }

  const currentPriority = row.original.priority

  const siblings = list.filter(item =>
    direction === 'up'
      ? item.priority < currentPriority
      : item.priority > currentPriority
  )

  siblings.sort((a, b) => direction === 'up'
    ? b.priority - a.priority
    : a.priority - b.priority
  )

  const nearestRow = siblings[0]

  if (nearestRow) {
    const temp = row.original.priority
    row.original.priority = nearestRow.priority
    nearestRow.priority = temp
  }
}

function disableChangePriority(row: Row<ShareClass | ShareSeries>, direction: 'up' | 'down') {
  const isClass = row.depth === 0
  const list = isClass
    ? data.value
    : data.value.find(item => item.uuid === row.parentId)?.series

  if (!list || list.length === 0) {
    return true
  }

  const currentPriority = row.original.priority

  return direction === 'up'
    ? !list.some(item => item.priority < currentPriority)
    : !list.some(item => item.priority > currentPriority)
}

function getRowActions(row: Row<ShareClass | ShareSeries>): DropdownMenuItem[] {
  return [
    ...(row.depth === 0
      ? [
        {
          label: 'Add Series',
          icon: 'i-mdi-playlist-add',
          onSelect: () => {
            row.original.addSeries = true
          }
        }]
      : []),
    {
      label: 'Move Up',
      icon: 'i-mdi-arrow-up',
      disabled: disableChangePriority(row, 'up'),
      onSelect: () => {
        changePriority(row, 'up')
      }
    },
    {
      label: 'Move Down',
      icon: 'i-mdi-arrow-down',
      disabled: disableChangePriority(row, 'down'),
      onSelect: () => {
        changePriority(row, 'down')
      }
    },
    {
      label: 'Remove',
      icon: 'i-mdi-delete',
      onSelect: () => {
        console.info('Remove clicked for: ', row.original.name)
      }
    }
  ]
}

watch(data, (v) => {
  console.info('Priority Updated')
  console.info('Share Class 1 Priority: ', v.find(item => item.name === 'Share Class 1')?.priority)
  console.info('Class 1 Series 1 Priority: ', v.find(item => item.name === 'Share Class 1')?.series?.find(s => s.name === 'Class 1 Series 1')?.priority)
  console.info('Class 1 Series 2 Priority: ', v.find(item => item.name === 'Share Class 1')?.series?.find(s => s.name === 'Class 1 Series 2')?.priority)
  console.info('Share Class 2 Priority: ', v.find(item => item.name === 'Share Class 2')?.priority)
  console.info('Class 2 Series 1 Priority: ', v.find(item => item.name === 'Share Class 2')?.series?.find(s => s.name === 'Class 2 Series 1')?.priority)
  console.info('Class 2 Series 2 Priority: ', v.find(item => item.name === 'Share Class 2')?.series?.find(s => s.name === 'Class 2 Series 2')?.priority)
}, { deep: true })
</script>

<template>
  <div class="py-10 flex flex-col gap-10 items-center">
    <ConnectPageSection
      :heading="{ label: 'Share Structure', icon: 'i-mdi-sitemap' }"
      class="max-w-5xl"
    >
      <UTable
        v-model:expanded="expanded"
        :data="data"
        :columns="columns"
        :get-sub-rows="(row) => 'series' in row ? row.series : undefined"
        :sorting="[{ id: 'priority', desc: false }]"
        :column-visibility="{ priority: false }"
        :get-row-id="(row) => row.uuid"
        class="flex-1"
        :ui="{
          base: 'border-separate border-spacing-0',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          tr: 'group',
          td: 'empty:p-0 group-has-[td:not(:empty)]:border-b border-default text-neutral'
        }"
      >
        <template #actions-cell="{ row }">
          <UFieldGroup>
            <UButton
              label="Change"
              @click="() => {
                row.original.isEditing = !row.original.isEditing
                if (row.depth === 0) {
                  row.toggleExpanded(true)
                }
                else {
                  row.toggleExpanded(row.original.isEditing)
                }
              }"
            />
            <UDropdownMenu :items="getRowActions(row)">
              <UButton icon="i-mdi-caret-down" />
            </UDropdownMenu>
          </UFieldGroup>
        </template>
        <template #expanded="{ row }">
          <div v-if="row.original.isEditing" class="p-4">
            {{ row.depth === 0 ? 'Edit Class Row Here' : 'Edit Series Row Here' }}
          </div>
          <div v-else-if="row.original.addSeries" class="p-4">
            Add Series Here
            <UButton label="Close" @click="row.original.addSeries = false" />
          </div>
        </template>
      </UTable>
    </ConnectPageSection>
  </div>
</template>
