<script setup lang="ts">
import getSymbolFromCurrency from 'currency-symbol-map'

const t = useNuxtApp().$i18n.t
const title = "Shares"

const filingStore = usePostRestorationTransitionApplicationStore()
const {
  shareClasses
} = storeToRefs(filingStore)

const flattenData = (data: Share[]) => {
    const flatData: Series[] = []
    data.sort((a, b) => a.priority - b.priority)
    data.forEach((share) => {
        flatData.push(share)
        if (share.series && share.series.length > 0) {
          share.series.sort((a, b) => a.priority - b.priority)
          flatData.push(...flattenData(share.series))
        }
    })
    return flatData
}

const columns = [
    {
        accessorKey: 'name',
        header: t('shares.columns.name'),
        meta:{
          class: {
            td: 'font-bold'
          }
        }
    },
    {
        accessorKey: 'maxNumberOfShares',
        header: t('shares.columns.max_num'),
        meta:{
          class: {
            th: 'w-[140px] text-right',
            td: 'w-[140px] text-right'
          }
        }
    },
    {
        accessorKey: 'parValue',
        header: t('shares.columns.par_value'),
        meta:{
          class: {
            th: 'mr-8 w-[100px] text-right',
            td: 'w-[100px] text-right'
          }
        },
        cell: ({ row }) => {
            const symbol = getSymbolFromCurrency(row.original.currency) || ""
            const parValue = row.original.parValue || ""
            
            return `${symbol}${parValue}`
        }
    },
    {
        accessorKey: 'currency',
        header: t('shares.columns.par_value_currency'),
        meta:{
          class: {
            th: 'w-[100px]',
            td: 'w-[100px]'
          }
        }
    },
    {
        accessorKey: 'hasRightsOrRestrictions',
        header: t('shares.columns.rights_restrictions'),
        cell: ({ row }) => {
            return row.original.hasRightsOrRestrictions ? t('shares.rights_restrictions.yes') : t('shares.rights_restrictions.no')
        },
        meta:{
          class: {
            th: 'w-[115px]',
            td: 'w-[115px]'
          }
        }
    },
    {
        id: 'actions',
        meta:{
          class: {
            th: 'w-[160px] text-right',
            td: 'w-[160px] text-right'
          }
        }
    }
]

const getDropdownActions = (row: Row<Share>) => {
  console.log(row)
    return [
        {
            label: t('shares.actions.addSeries'),
            onClick: () => {
                console.log('Add Series', row)
            },
            disabled: !row.original.hasRightsOrRestrictions
        },
        {
            label: t('shares.actions.moveUp'),
            onClick: () => {
                console.log('Move Up', row)
            },
            disabled: row.index === 0
        },
        {
            label: t('shares.actions.moveDown'),
            onClick: () => {
                console.log('Move Down', row)
            },
            disabled: row.index === shareClasses.value.length - 1
        },
        {
            label: t('shares.actions.delete'),
            onClick: () => {
                console.log('Delete', row)
            }
        }
    ]
}

</script>

<template>
    <h1>{{ title }}</h1>
    <UTable
      :data="flattenData(shareClasses)"
      :columns="columns"
      :ui="{
        thead: 'rounded-t-md',
        th: 'border-r-1 border-r-white p-4',
        td: 'p-4 text-sm text-black whitespace-nowrap [&:has([role=checkbox])]:pe-0',
      }"
      class="flex-1"
    >
    <template #name-cell="{ row }">
        <span v-if="!row.original.series" class="mx-2">&bull;</span> {{ row.original.name }}
      </template>
      <template #actions-cell="{ row }">
        <UButton
          icon="i-mdi-pencil"
          :label="$t('label.change')"
          color="primary"
          class="inline-block mr-0 px-3"
          variant="ghost"
          aria-label="change"
        />
        <USeparator orientation="vertical" class="h-6 inline-block" />
        <UDropdownMenu :items="getDropdownActions(row)">
          <UButton
            icon="i-mdi-chevron-down"
            color="primary"
            variant="ghost"
            class="inline-block"
            aria-label="actions"
          />
      </UDropdownMenu>
      </template>
    </UTable>
</template>
