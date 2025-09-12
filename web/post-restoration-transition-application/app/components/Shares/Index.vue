<script lang="ts" setup>
import getSymbolFromCurrency from 'currency-symbol-map'

const t = useNuxtApp().$i18n.t
const anyExpanded = ref(false)
const addingShare = ref(false)

const filingStore = usePostRestorationTransitionApplicationStore()
const {
  shareClasses,
  editingShareIndex,
  modifiedShareIndexes,
  ORIGINAL_SHARE_CLASSES,
  editingSeriesParent
} = storeToRefs(filingStore)

const addedIndexes = ref<number[]>([])
const editedIndexes = ref<number[]>([])
const addSeries = ref<boolean>(false)
const addSeriesShareIndex = ref<number>(-1)

const flattenData = (data: Share[]) => {
  const flatData: Series[] = []
  data.sort((a, b) => a.priority - b.priority)
  data.forEach((share, index) => {
    flatData.push(share)
    if (share.series && share.series.length > 0) {
      share.series.sort((a, b) => a.priority - b.priority)
      share.series.forEach((s) => {
        s.parentShareIndex = index
      })
      flatData.push(...flattenData(share.series))
    }
  })
  return flatData
}

const columns = [
  {
    accessorKey: 'name',
    header: t('label.shareColumnName'),
    meta: {
      class: {
        td: 'font-bold'
      }
    }
  },
  {
    accessorKey: 'maxNumberOfShares',
    header: t('label.shareColumnMaxNum'),
    meta: {
      class: {
        th: 'w-[140px] text-right',
        td: 'w-[140px] text-right'
      }
    },
    cell: ({ row }) => {
      const maxNumberOfShares = row.original.maxNumberOfShares || t('label.noMax')

      return maxNumberOfShares
    }
  },
  {
    accessorKey: 'parValue',
    header: t('label.shareColumnParValue'),
    meta: {
      class: {
        th: 'mr-8 w-[100px] text-right',
        td: 'w-[100px] text-right'
      }
    },
    cell: ({ row }) => {
      const symbol = getSymbolFromCurrency(row.original.currency) || ''
      const parValue = row.original.parValue || ''

      if (parValue === '0') {
        return t('label.noPar')
      }

      return `${symbol}${parValue}`
    }
  },
  {
    accessorKey: 'currency',
    header: t('label.shareColumnParValueCurrency'),
    meta: {
      class: {
        th: 'w-[100px]',
        td: 'w-[100px]'
      }
    }
  },
  {
    accessorKey: 'hasRightsOrRestrictions',
    header: t('label.shareColumnRightsRestrictions'),
    cell: ({ row }) => {
      return row.original.hasRightsOrRestrictions ? t('label.yes') : t('label.no')
    },
    meta: {
      class: {
        th: 'min-w-[150px]',
        td: 'min-w-[150px]'
      }
    }
  },
  {
    id: 'actions',
    meta: {
      class: {
        th: 'w-[160px] text-right',
        td: 'w-[160px] text-right'
      }
    }
  }
]

const tableMeta = {
  class: {
    tr: (row: Row<Share>) => {
      return row.original.removed ? 'text-bcGovColor-lightGray' : ''
    }
  }
}

const getDropdownActions = (row: Row<Share>) => {
  return [
    {
      label: t('label.addSeries'),
      icon: 'i-mdi-playlist-plus',
      onClick: () => {
        addASeries(row)
      },
      color: 'primary',
      disabled: !row.original.hasRightsOrRestrictions
    },
    {
      label: t('label.moveUp'),
      icon: 'i-mdi-arrow-up',
      onClick: () => {
        moveShare(row.index, true)
      },
      color: 'primary',
      disabled: row.index === 0
    },
    {
      label: t('label.moveDown'),
      icon: 'i-mdi-arrow-down',
      onClick: () => {
        moveShare(row.index, false)
      },
      color: 'primary',
      disabled: row.index === shareClasses.value.length - 1
    },
    {
      label: t('label.delete'),
      icon: 'i-mdi-delete',
      onClick: () => {
        deleteShare(row.index)
      },
      color: 'primary'
    }
  ]
}

const toggleShareExpanded = (row: Row<Share | Series>, skipValidations?: boolean) => {
  if (skipValidations === undefined) {
    skipValidations = false
  }

  if (skipValidations) {
    addingShare.value = false
    anyExpanded.value = false
    editingShareIndex.value = -1
  }

  if (addingShare.value) {
    return
  }

  if (anyExpanded.value && editingShareIndex.value !== row.index) {
    return
  }

  addSeries.value = row.original.series ? false : true
  if (addSeries.value) {
    editingSeriesParent.value = row.original.parentShareIndex
  }

  anyExpanded.value = true
  if (row.getIsExpanded()) {
    anyExpanded.value = false
    editingShareIndex.value = -1
  } else {
    editingShareIndex.value = row.index
  }
  row.toggleExpanded()
}

const moveShare = (index: number, moveUp: boolean) => {
  if (moveUp && index === 0) {
    return
  }
  if (!moveUp && index === shareClasses.value.length - 1) {
    return
  }

  const newIndex = moveUp ? index - 1 : index + 1
  // Swap elements using splice for reactivity
  const arr = shareClasses.value
  const temp = arr[index]
  const oldPriority = temp.priority
  temp.priority = arr[newIndex].priority
  arr[newIndex].priority = oldPriority
  arr.splice(index, 1)
  arr.splice(newIndex, 0, temp)
}

const deleteShare = (index: number) => {
  shareClasses.value[index].removed = true
  if (!modifiedShareIndexes.value.includes(index)) {
    modifiedShareIndexes.value.push(index)
  }
}

const undoDelete = (index: number) => {
  delete shareClasses.value[index].removed
  modifiedShareIndexes.value = modifiedShareIndexes.value.filter(i => i !== index)
}

const addShare = () => {
  if (addingShare.value || anyExpanded.value || addSeries.value) {
    return
  }
  addingShare.value = true
}

const addASeries = (row: Row<Share>) => {
  if (addingShare.value || anyExpanded.value) {
    return
  }
  addSeries.value = true
  addSeriesShareIndex.value = row.index
  anyExpanded.value = true
  editingSeriesParent.value = row.index
  editingShareIndex.value = -1
  row.toggleExpanded()
}

const updated = (row: Row<Share | Series>) => {
  if (addSeries.value) {
    editingShareIndex.value = editingSeriesParent.value
  }

  const original = JSON.stringify(ORIGINAL_SHARE_CLASSES.value[row.index])
  const current = JSON.stringify(shareClasses.value[row.index])

  if (original !== current) {
    if (!modifiedShareIndexes.value.includes(row.index)) {
      modifiedShareIndexes.value.push(row.index)
    }
    editedIndexes.value.push(row.index)
  } else {
    modifiedShareIndexes.value = modifiedShareIndexes.value.filter(i => i !== row.index)
    editedIndexes.value = editedIndexes.value.filter(i => i !== row.index)
  }
  let forceClose = false
  if (Object.keys(row.original).includes('parentShareIndex')) {
    forceClose = true
  } else if (
    (Object.keys(shareClasses.value[row.index]).includes('series'))
    && shareClasses.value[row.index]?.series?.length > 0) {
    const parValue = shareClasses.value[row.index].parValue
    const hasParValue = shareClasses.value[row.index].hasParValue
    const currency = shareClasses.value[row.index].currency

    for (let i = 0; i < shareClasses.value[row.index].series.length; i++) {
      shareClasses.value[row.index].series[i].parValue = parValue
      shareClasses.value[row.index].series[i].hasParValue = hasParValue
      shareClasses.value[row.index].series[i].currency = currency
    }
  }
  addSeries.value = false
  addingShare.value = false
  editingSeriesParent.value = -1
  toggleShareExpanded(row, forceClose)
}

const addedShare = () => {
  addedIndexes.value.push(shareClasses.value.length - 1)
  if (!modifiedShareIndexes.value.includes(shareClasses.value.length - 1)) {
    modifiedShareIndexes.value.push(shareClasses.value.length - 1)
  }
  addingShare.value = false
  addSeries.value = false
}
</script>

<template>
  <div>
    <p class="mx-6 mt-6 mb-4">
      {{ $t('text.sharesDescription') }}
    </p>
    <UButton
      :aria-label="$t('label.addShare')"
      data-testid="add-share-button"
      :label="$t('label.addShare')"
      :ui="{
        label: 'align-top leading-[19px]'
      }"
      class="inline-block rounded text-base ml-6 px-7 pt-[11px]"
      color="primary"
      icon="i-mdi-plus"
      variant="outline"
      @click="addShare()"
    />
    <SharesAddEdit
      v-show="addingShare"
      class="py-4 px-6"
      :is-series="false"
      @cancel="addingShare = false"
      @done="addedShare"
    />
    <UTable
      :data="flattenData(shareClasses)"
      :columns="columns"
      :ui="{
        thead: 'rounded-t-md',
        th: 'border-r-1 border-r-white p-4',
        td: 'p-4 text-sm text-black whitespace-nowrap [&:has([role=checkbox])]:pe-0'
      }"
      class="flex-1"
      :meta="tableMeta"
    >
      <template #name-cell="{ row }">
        <span v-if="!row.original.series" class="mx-2">&bull;</span> {{ row.original.name }}
        <div>
          <UBadge
            v-if="addedIndexes.includes(row.index)"
            color="primary"
            class="rounded-sm"
          >
            {{ t('label.added') }}
          </UBadge>
        </div>
        <div>
          <UBadge
            v-if="row.original.removed"
            class="rounded-sm bg-[#E0E0E0] text-[#5F6163]"
          >
            {{ t('label.deleted') }}
          </UBadge>
        </div>
        <div>
          <UBadge
            v-if="!addedIndexes.includes(row.index) && !row.original.removed && editedIndexes.includes(row.index)"
            color="primary"
            class="rounded-sm"
          >
            {{ t('label.changed') }}
          </UBadge>
        </div>
      </template>
      <template #actions-cell="{ row }">
        <UButton
          v-if="!row.original.removed"
          icon="i-mdi-pencil"
          :label="$t('label.change')"
          color="primary"
          class="inline-block mr-0 px-3"
          variant="ghost"
          :aria-label="$t('label.change')"
          :ui="{
            label: 'align-top'
          }"
          @click="toggleShareExpanded(row)"
        />
        <UButton
          v-else
          icon="i-mdi-undo"
          :label="$t('label.undo')"
          color="primary"
          class="inline-block mr-0 px-3"
          variant="ghost"
          :aria-label="$t('label.undo')"
          @click="undoDelete(row.index)"
        />
        <USeparator
          v-if="!row.original.removed"
          orientation="vertical"
          class="h-6 inline-block"
        />
        <UDropdownMenu v-if="!row.original.removed" :items="getDropdownActions(row)">
          <template #default="{ open }">
            <UButton
              :icon="open ? 'i-mdi-triangle' : 'i-mdi-triangle-down'"
              color="primary"
              variant="ghost"
              class="inline-block"
              :aria-label="$t('label.actions')"
              :ui="{
                leadingIcon: 'size-3 text-primary'
              }"
            />
          </template>
        </UDropdownMenu>
      </template>
      <template #expanded="{ row }">
        <SharesAddEdit
          class="pr-4"
          :is-series="addSeries"
          @cancel="toggleShareExpanded(row, true)"
          @done="updated(row)"
        />
      </template>
    </UTable>
  </div>
</template>
