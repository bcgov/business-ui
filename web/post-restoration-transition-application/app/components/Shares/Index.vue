<script setup lang="ts">
import getSymbolFromCurrency from 'currency-symbol-map'

const t = useNuxtApp().$i18n.t
const anyExpanded = ref(false)
const addingShare = ref(false)

const filingStore = usePostRestorationTransitionApplicationStore()
const {
  shareClasses,
  editingShareIndex,
  modifiedShareIndexes,
  ORIGINAL_SHARE_CLASSES
} = storeToRefs(filingStore)

const addedIndexes = ref<number[]>([])
const editedIndexes = ref<number[]>([])

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
        th: 'w-[115px]',
        td: 'w-[115px]'
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
      onClick: () => {
        // eslint-disable-next-line no-console
        console.log('Add Series', row)
      },
      disabled: !row.original.hasRightsOrRestrictions
    },
    {
      label: t('label.moveUp'),
      onClick: () => {
        moveShare(row.index, true)
      },
      disabled: row.index === 0
    },
    {
      label: t('label.moveDown'),
      onClick: () => {
        moveShare(row.index, false)
      },
      disabled: row.index === shareClasses.value.length - 1
    },
    {
      label: t('label.delete'),
      onClick: () => {
        deleteShare(row.index)
      }
    }
  ]
}

const toggleShareExpanded = (row: Row<Series>) => {
  if (addingShare.value) {
    return
  }

  if (anyExpanded.value && editingShareIndex.value !== row.index) {
    return
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
  if (addingShare.value === true || anyExpanded.value === true) {
    return
  }
  addingShare.value = true
}

const updated = (row: Row<Series>) => {
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
  toggleShareExpanded(row)
}

const addedShare = () => {
  addedIndexes.value.push(shareClasses.value.length - 1)
  if (!modifiedShareIndexes.value.includes(shareClasses.value.length - 1)) {
    modifiedShareIndexes.value.push(shareClasses.value.length - 1)
  }
  addingShare.value = false
}
</script>

<template>
  <div>
    <p>{{ $t('text.sharesDescription') }}</p>
    <UButton
      icon="i-mdi-plus"
      :label="$t('label.addShare')"
      color="primary"
      class="inline-block my-4 px-5 py-3"
      variant="outline"
      :ui="{
        label: 'align-top'
      }"
      :aria-label="$t('label.addShare')"
      @click="addShare()"
    />
    <SharesAddEdit
      v-show="addingShare"
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
            v-if="editedIndexes.includes(row.index)"
            color="primary"
            class="rounded-sm"
          >
            {{ t('label.edited') }}
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
          <UButton
            icon="i-mdi-chevron-down"
            color="primary"
            variant="ghost"
            class="inline-block"
            :aria-label="$t('label.actions')"
          />
        </UDropdownMenu>
      </template>
      <template #expanded="{ row }">
        <SharesAddEdit
          @cancel="toggleShareExpanded(row)"
          @done="updated(row)"
        />
      </template>
    </UTable>
  </div>
</template>
