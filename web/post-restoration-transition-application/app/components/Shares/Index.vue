<script lang="ts" setup>
import getSymbolFromCurrency from 'currency-symbol-map'
import { PageSection } from '~/enum/page_sections'
import { compare } from '~/utils/compare'

const t = useNuxtApp().$i18n.t
const anyExpanded = ref(false)
const addingShare = ref(false)
const shareTableKey = ref(0)

const { editFormClosed, editFormOpen, scrollToOpenForm } = useEditFormHandlers()

const props = defineProps<{
  formId: string
  editFormError: string | undefined
}>()

const filingStore = usePostRestorationTransitionApplicationStore()
const {
  shareClasses,
  editingShareIndex,
  ORIGINAL_SHARE_CLASSES,
  editingSeriesParent
} = storeToRefs(filingStore)

const sharesAddFormId = `${props.formId}-add-form`
const sharesEditFormId = `${props.formId}-edit-form`
filingStore.registerFormIdToSection(sharesAddFormId, PageSection.SHARES)
filingStore.registerFormIdToSection(sharesEditFormId, PageSection.SHARES)

const addEditSeries = ref<boolean>(false)

const addSeries = ref<boolean>(false)
const addSeriesShareIndex = ref<number>(-1)

const bottomShare = computed(() => {
  return flattenedShareClasses.value.findLastIndex(s => Object.keys(s).includes('series'))
})

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

const flattenedShareClasses = computed (() => {
  return flattenData(shareClasses.value)
})

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
      disabled: !row.original.hasRightsOrRestrictions || (row.original.parentShareIndex !== undefined)
    },
    {
      label: t('label.moveUp'),
      icon: 'i-mdi-arrow-up',
      onClick: () => {
        moveShare(row.index, true)
      },
      color: 'primary',
      disabled: (
        row.original.removed
        || row.index === 0
        || (
          row.original?.parentShareIndex !== undefined && row.original.parentShareIndex !== -1
          && JSON.stringify(row.original) === JSON.stringify(
            shareClasses.value[row.original.parentShareIndex].series[0]
          )
        )
      )
    },
    {
      label: t('label.moveDown'),
      icon: 'i-mdi-arrow-down',
      onClick: () => {
        moveShare(row.index, false)
      },
      color: 'primary',
      disabled: (
        row.original.removed
        || (row.index >= bottomShare.value && row.original.parentShareIndex === undefined)
        || (
          row.original?.parentShareIndex !== undefined && row.original.parentShareIndex !== -1
          && JSON.stringify(row.original) === JSON.stringify(
            shareClasses.value[row.original.parentShareIndex].series[
              shareClasses.value[row.original.parentShareIndex].series.length - 1
            ]
          )
        )
      )
    },
    {
      label: t('label.delete'),
      icon: 'i-mdi-delete',
      onClick: () => {
        const rowIndex = row.index
        if (row.original.series && row.original.series.length > 0) {
          useModal().baseModal.open({
            title: t('label.shareSeriesRightsRestrictionsWithClass'),
            description: t('text.shareSeriesRightsRestrictionsWithClass'),
            dismissible: false,
            buttons: [
              { label: t('btn.cancel'), variant: 'outline', size: 'xl', shouldClose: true },
              {
                label: t('label.remove'), size:
                  'xl', shouldClose:
                  true, onClick:
                  () => {
                    deleteShare(rowIndex)
                  }
              }
            ]
          })
          return
        }
        deleteShare(rowIndex)
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
    scrollToOpenForm('edit')
    return
  }

  if (anyExpanded.value && editingShareIndex.value !== row.index) {
    scrollToOpenForm('edit')
    return
  }

  addEditSeries.value = row.original.series ? false : true
  if (addEditSeries.value) {
    editingSeriesParent.value = row.original.parentShareIndex
  }

  anyExpanded.value = true
  if (row.getIsExpanded()) {
    anyExpanded.value = false
    addSeries.value = false
    editingShareIndex.value = -1
    editFormClosed(sharesEditFormId)
  } else {
    if (editFormOpen(sharesEditFormId)) {
      return
    }
    editingShareIndex.value = row.index
  }
  row.toggleExpanded()
}

// This takes a table row Index and returns the indexes for the unflattened data.
// series index is the index the series is in the share's series array (if applicable)
// and share index is the index that the share is in the unflattened array
// the flattened array is e.g. given the following
// shares [ a: { series: [ b, c ] }, d ]
// the flattened array would be [ a, b, c, d ]
// given row index 1 the function would return { shareIndex: 0, seriesIndex: 0 }
const getIndexFromRowIndex = (rowIndex: number) => {
  const isSeries = Object.keys(flattenedShareClasses.value[rowIndex]).includes('parentShareIndex')
  if (isSeries) {
    const shareIndex = flattenedShareClasses.value[rowIndex].parentShareIndex
    const seriesIndex = shareClasses.value[shareIndex].series.findIndex((s) => {
      return JSON.stringify(s) === JSON.stringify(flattenedShareClasses.value[rowIndex])
    })
    return { shareIndex, seriesIndex }
  }
  const shareIndex = shareClasses.value.findIndex((s) => {
    return JSON.stringify(s) === JSON.stringify(flattenedShareClasses.value[rowIndex])
  })
  const seriesIndex = -1
  return { shareIndex, seriesIndex }
}

const moveShare = (index: number, moveUp: boolean) => {
  if (moveUp && index === 0) {
    return
  }
  if (!moveUp && index === flattenedShareClasses.value.length - 1) {
    return
  }

  const isSeries = Object.keys(flattenedShareClasses.value[index]).includes('parentShareIndex')
  const { shareIndex, seriesIndex } = getIndexFromRowIndex(index)

  if (isSeries) {
    const newIndex = moveUp ? seriesIndex - 1 : seriesIndex + 1
    if (newIndex < 0 || newIndex >= shareClasses.value[shareIndex].series.length) {
      return
    }
    // Swap elements using splice for reactivity
    const arr = shareClasses.value[shareIndex].series
    const temp = arr[seriesIndex]
    const oldPriority = temp.priority

    temp.priority = arr[newIndex].priority
    arr[newIndex].priority = oldPriority

    arr.splice(seriesIndex, 1)
    arr.splice(newIndex, 0, temp)
    return
  }
  // otherwise it's a share -- find the index of the share in the unflattened array
  const newIndex = moveUp ? shareIndex - 1 : shareIndex + 1

  // Swap elements using splice for reactivity
  // This will cause the flattened array to update because it's computed on shareClasses
  const arr = shareClasses.value
  const temp = arr[shareIndex]
  const oldPriority = temp.priority
  temp.priority = arr[newIndex].priority
  arr[newIndex].priority = oldPriority
  arr.splice(shareIndex, 1)
  arr.splice(newIndex, 0, temp)
}

// This function determines how to delete the given share/series
// If it's added on this visit then it gets truly removed
// If it's previously saved it gets marked as removed
// additionally if its a share class that has series the delete has to cascade down to the series that it has
const deleteShare = (index: number) => {
  const isSeries = Object.keys(flattenedShareClasses.value[index]).includes('parentShareIndex')
  const { shareIndex, seriesIndex } = getIndexFromRowIndex(index)
  if (isSeries) {
    // for series if added, remove and otherwise mark as removed
    if (shareClasses.value[shareIndex].series[seriesIndex].added) {
      shareClasses.value[shareIndex].series.splice(seriesIndex, 1)
      return
    }
    shareClasses.value[shareIndex].series[seriesIndex].removed = true
    return
  }

  // if it's a share class remove it if it's added (note this also removed any (also added) series)
  if (shareClasses.value[shareIndex]?.added === true) {
    shareClasses.value.splice(shareIndex, 1)
    return
  }
  // otherwise mark it as removed and cascade down to any series it has either removing (newly added)
  // or marking as removed (previously saved)
  shareClasses.value[shareIndex].removed = true
  for (let i = 0; i < shareClasses.value[shareIndex]?.series.length; i++) {
    if (shareClasses.value[shareIndex]?.series[i].added === true) {
      shareClasses.value[shareIndex].series.splice(i, 1)
    } else {
      shareClasses.value[shareIndex].series[i].removed = true
    }
  }
}

const undoDelete = (index: number) => {
  const isSeries = Object.keys(flattenedShareClasses.value[index]).includes('parentShareIndex')
  const { shareIndex, seriesIndex } = getIndexFromRowIndex(index)
  if (isSeries) {
    shareClasses.value[shareIndex].series[seriesIndex].removed = false
    return
  }

  shareClasses.value[shareIndex].removed = false
  for (let i = 0; i < shareClasses.value[shareIndex].series.length; i++) {
    shareClasses.value[shareIndex].series[i].removed = false
  }
}

const addShare = () => {
  if (addingShare.value || anyExpanded.value || addSeries.value || addEditSeries.value) {
    scrollToOpenForm('edit')
    return
  }

  // check if any other form is open, if is scroll to it and cancel adding share
  if (editFormOpen(sharesAddFormId)) {
    return
  }

  addingShare.value = true
}

const addASeries = (row: Row<Share>) => {
  if (addingShare.value || anyExpanded.value) {
    return
  }
  addEditSeries.value = true
  addSeriesShareIndex.value = row.index
  addSeries.value = true
  anyExpanded.value = true
  let parentIndex = -1
  for (let i = 0; i < shareClasses.value.length; i++) {
    if (JSON.stringify(shareClasses.value[i]) === JSON.stringify(row.original)) {
      parentIndex = i
      break
    }
  }
  editingSeriesParent.value = parentIndex
  editingShareIndex.value = -1
  row.toggleExpanded()
}

// this function returns the shareIndex and series index as they are expected in the updated function
// this requires them to be set in the store as opposed to looked up in the flat/unflattened array
const getIndexes = () => {
  let shareIndex = -1
  let seriesIndex = -1

  if (editingSeriesParent.value !== -1) {
    shareIndex = editingSeriesParent.value
  } else if (editingShareIndex.value === -1) {
    shareIndex = shareClasses.value.length
  } else {
    shareIndex = editingShareIndex.value
  }

  if (addSeries.value) {
    seriesIndex = shareClasses.value[shareIndex].series.length - 1
  } else if (addEditSeries.value) {
    seriesIndex = editingShareIndex.value
  }

  return { shareIndex, seriesIndex }
}

// this function handles updates of shares or series as well as adding a new SERIES only
// it does not handle adding a share class
const updated = (row: Row<Share | Series>) => {
  const { shareIndex, seriesIndex } = getIndexes()

  // if adding a series simply set it as added, set it's parent to modified and force a reactivity update
  if (addSeries.value) {
    // adding a series
    shareClasses.value[shareIndex].series[seriesIndex].added = true
    shareClasses.value[editingSeriesParent.value].modified = true
    const newValues = JSON.stringify(shareClasses.value)
    shareClasses.value = [...JSON.parse(newValues)]
    shareClasses.value.push()
  } else {
    // updating either a series or a share
    const original = JSON.parse(JSON.stringify(ORIGINAL_SHARE_CLASSES.value[shareIndex]))
    const current = JSON.parse(JSON.stringify(shareClasses.value[shareIndex]))
    delete current.modified
    delete current.removed
    delete current.added
    // it's updated if it has changed from the original form, this allows it to go back to unmodified
    // if the user changes it back to it's original state
    shareClasses.value[shareIndex].modified = !compare(original, current)
    if (addEditSeries.value) {
      // updating a series
      const original = JSON.parse(JSON.stringify(ORIGINAL_SHARE_CLASSES.value[shareIndex].series[seriesIndex]))
      const current = JSON.parse(JSON.stringify(shareClasses.value[shareIndex].series[seriesIndex]))
      delete current.modified
      delete current.removed
      delete current.added
      shareClasses.value[shareIndex].series[seriesIndex].modified = !compare(original, current)
    }
  }

  // ensure the series closes when series is updated
  const forceClose = addEditSeries.value

  // if it's a share and it has child series then update the parvalue information to match
  if (
    (Object.keys(shareClasses.value[shareIndex]).includes('series'))
    && shareClasses.value[shareIndex]?.series?.length > 0) {
    const parValue = shareClasses.value[shareIndex].parValue
    const hasParValue = shareClasses.value[shareIndex].hasParValue
    const currency = shareClasses.value[shareIndex].currency

    for (let i = 0; i < shareClasses.value[shareIndex].series.length; i++) {
      shareClasses.value[shareIndex].series[i].parValue = parValue
      shareClasses.value[shareIndex].series[i].hasParValue = hasParValue
      shareClasses.value[shareIndex].series[i].currency = currency
    }
  }

  // reset the store values and close the row
  addEditSeries.value = false
  addingShare.value = false
  editingSeriesParent.value = -1
  shareTableKey.value++
  toggleShareExpanded(row, forceClose)
  editingShareIndex.value = -1
}

const addedShare = () => {
  shareClasses.value[shareClasses.value.length - 1].added = true
  editFormClosed(sharesAddFormId)
  addingShare.value = false
  addEditSeries.value = false
  shareTableKey.value++
}

const shareAddEditCancelHandler = () => {
  addingShare.value = false
  editFormClosed(sharesAddFormId)
}

const shareAddEditDoneHandler = () => {
  addedShare()
  editFormClosed(sharesAddFormId)
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
      :form-id="sharesAddFormId"
      :form-error="editFormError"
      @cancel="shareAddEditCancelHandler"
      @done="shareAddEditDoneHandler"
    />
    <UTable
      :key="`share-table-${shareTableKey}`"
      :data="flattenedShareClasses"
      data-testid="share-table"
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
        <div data-testid="share-badge">
          <UBadge
            v-if="row.original.removed"
            class="rounded-sm bg-[#E0E0E0] text-[#5F6163]"
          >
            {{ t('label.deleted') }}
          </UBadge>
          <UBadge
            v-else-if="row.original.added"
            color="primary"
            class="rounded-sm"
          >
            {{ t('label.added') }}
          </UBadge>
          <UBadge
            v-else-if="row.original.modified"
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
          v-else-if="row.original.removed
            && (
              !Object.keys(row.original).includes('parentShareIndex')
              || shareClasses[row.original.parentShareIndex].removed === false
              || shareClasses[row.original.parentShareIndex].removed === undefined)"
          icon="i-mdi-undo"
          :label="$t('label.undo')"
          color="primary"
          class="inline-block mr-0 px-3"
          :disabled="row.original.parentShareIndex !== undefined
            && shareClasses[row.original.parentShareIndex]?.hasRightsOrRestrictions === false"
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
          :form-id="sharesEditFormId"
          :form-error="editFormError"
          class="pr-4"
          :is-series="addEditSeries"
          @cancel="toggleShareExpanded(row, true)"
          @done="updated(row)"
        />
      </template>
    </UTable>
  </div>
</template>
