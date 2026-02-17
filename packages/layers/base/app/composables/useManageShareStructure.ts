import type { ExpandedState } from '@tanstack/vue-table'
import { isEqual, omit } from 'es-toolkit'

export const useManageShareStructure = (stateKey: string = 'manage-share-structure') => {
  const { baseModal } = useModal()
  const { t } = useNuxtApp().$i18n
  const expandedState = useState<ExpandedState | undefined>(`${stateKey}-expanded-state`, () => undefined)
  const tableState = useState<TableBusinessState<ShareClassSchema>[]>(`${stateKey}-table-state`, () => [])

  function addNewShareClass(shareClass: ActiveShareClassSchema) {
    if (!shareClass) {
      return
    }
    const newState: TableBusinessState<ShareClassSchema> = {
      new: {
        ...shareClass,
        actions: [ActionType.ADDED]
      },
      old: undefined
    }

    // place new row at the beginning of the list
    tableState.value = [
      JSON.parse(JSON.stringify(newState)),
      ...tableState.value
    ]

    // increase every row priority that was not the row just added by 1
    tableState.value.filter(item => item.new.id !== shareClass.id).forEach(item => item.new.priority++)
  }

  function removeShareClass(row: TableBusinessRow<ShareClassSchema>, cleanupForm?: () => void): void {
    const removedPriority = row.original.new.priority
    const rowToUpdate = tableState.value.find(item => item.new.id === row.original.new.id)

    const applyEdits = () => {
      // if it was a newly added row, fully remove and update other row priorities
      if (row.original.old === undefined) {
        tableState.value = tableState.value.filter(item => item.new.id !== row.original.new.id)
        tableState.value.forEach(item => item.new.priority > removedPriority && item.new.priority--)
      } else {
        // if it was an existing row, add the removed action
        if (rowToUpdate) {
          rowToUpdate.new.actions = [ActionType.REMOVED]
        }
      }
    }

    // open confirmation modal if removing a share class that has series under it
    if (rowToUpdate && rowToUpdate.new.series.length) {
      baseModal.open({
        title: t('modal.removeClassWithSeries.title'),
        description: t('modal.removeClassWithSeries.description'),
        dismissible: false,
        buttons: [
          { label: t('label.cancel'), shouldClose: true, variant: 'outline' },
          {
            label: t('label.remove'),
            shouldClose: true,
            onClick: () => {
              applyEdits()
              if (cleanupForm) {
                cleanupForm()
              }
            }
          }
        ]
      })
    } else {
      applyEdits()
      cleanupForm?.()
    }
  }

  function undoShareClass(row: TableBusinessRow<ShareClassSchema>): void {
    const rowToUpdate = tableState.value.find(item => item.new.id === row.original.new.id)
    const currentPriority = rowToUpdate?.new.priority
    if (rowToUpdate && row.original.old && currentPriority) {
      rowToUpdate.new = {
        ...row.original.old,
        priority: currentPriority
      }
    }
  }

  function updateShareClass(
    row: TableBusinessRow<ShareClassSchema>,
    shareClass: ActiveShareClassSchema,
    cleanupForm: () => void
  ) {
    if (!shareClass) {
      return
    }

    const rowToUpdate = tableState.value.find(item => item.new.id === row.original.new.id)

    if (rowToUpdate) {
      // only apply edits if changes have been made, exclude series from the equality check
      const applyEdits = () => {
        if (!isEqual(omit(rowToUpdate.new, ['series']), omit(shareClass, ['series']))) {
          rowToUpdate.new = {
            ...shareClass,
            actions: row.original.old ? [ActionType.CHANGED] : [ActionType.ADDED]
          }
        }
      }

      // if changing right or restrictions or max shares count, open confirmation modal that series will also be removed
      const initialMaxShares = row.original.new.maxNumberOfShares
      const submittedMaxShares = shareClass.maxNumberOfShares
      const maxSharesChanged = initialMaxShares !== submittedMaxShares

      if ((!shareClass.hasRightsOrRestrictions || maxSharesChanged) && rowToUpdate.new.series?.length) {
        const description = maxSharesChanged
          ? t('modal.removeShareSeries.changeMaxSharesDescription')
          : t('modal.removeShareSeries.removeRorDescription')
        baseModal.open({
          title: t('modal.removeShareSeries.title'),
          description,
          dismissible: false,
          buttons: [
            { label: t('label.cancel'), shouldClose: true, variant: 'outline' },
            {
              label: t('label.removeSeries'),
              shouldClose: true,
              onClick: () => {
                applyEdits()
                rowToUpdate.new.series.forEach((s) => {
                  s.actions = [ActionType.REMOVED]
                  s.isInvalid = true
                })
                cleanupForm()
              }
            }
          ]
        })
      } else {
        applyEdits()
        cleanupForm()
      }
    }
  }

  function addNewShareSeries(row: TableBusinessRow<ShareClassSchema>, shareSeries: ActiveShareSeriesSchema) {
    if (!shareSeries) {
      return
    }

    const parentRow = tableState.value.find(item => item.new.id === row.original.new.id)
    const seriesArray = parentRow?.new.series

    if (seriesArray) {
      seriesArray.unshift({
        ...shareSeries,
        actions: [ActionType.ADDED]
      })
      // increase every row priority that was not the row just added by 1
      seriesArray.forEach((item) => {
        if (item.id !== shareSeries.id) {
          item.priority++
        }
      })
    }
  }

  function updateShareSeries(row: TableBusinessRow<ShareClassSchema>, shareSeries: ActiveShareSeriesSchema): void {
    if (!shareSeries) {
      return
    }

    const parentId = row.getParentRow()?.original.new.id
    if (!parentId) {
      return
    }

    const parentRow = tableState.value.find(item => item.new.id === parentId)

    if (parentRow) {
      const seriesIndex = parentRow.new.series.findIndex(s => s.id === row.original.new.id)

      // only apply edits if changes were made
      if (seriesIndex !== -1) {
        if (!isEqual(parentRow.new.series[seriesIndex], shareSeries)) {
          parentRow.new.series[seriesIndex] = {
            ...shareSeries,
            actions: row.original.old ? [ActionType.CHANGED] : [ActionType.ADDED]
          }
        }
      }
    }
  }

  function undoShareSeries(row: TableBusinessRow<ShareClassSchema>): void {
    const parentId = row.getParentRow()?.original.new.id
    const oldState = row.original.old as unknown as ShareSeriesSchema

    if (!parentId || !oldState) {
      return
    }

    const parentRow = tableState.value.find(item => item.new.id === parentId)

    if (parentRow) {
      const seriesIndex = parentRow.new.series.findIndex(s => s.id === row.original.new.id)

      if (seriesIndex !== -1) {
        const currentPriority = parentRow.new.series[seriesIndex]?.priority

        if (currentPriority) {
          parentRow.new.series[seriesIndex] = {
            ...oldState,
            priority: currentPriority
          }
        }
      }
    }
  }

  function removeShareSeries(row: TableBusinessRow<ShareClassSchema>): void {
    const parentId = row.getParentRow()?.original.new.id
    if (!parentId) {
      return
    }

    const parentRow = tableState.value.find(item => item.new.id === parentId)
    if (!parentRow) {
      return
    }

    const seriesArray = parentRow.new.series
    const removedPriority = row.original.new.priority

    // if it was a newly added series, remove from list and fix other series priorities
    if (row.original.old === undefined) {
      parentRow.new.series = seriesArray.filter(s => s.id !== row.original.new.id)
      parentRow.new.series.forEach(s => s.priority > removedPriority && s.priority--)
    } else {
      // if it was an existing series add the removed action
      const removedSeries = seriesArray.find(s => s.id === row.original.new.id)
      if (removedSeries) {
        removedSeries.actions = [ActionType.REMOVED]
      }
    }
  }

  function changePriority(row: TableBusinessRow<ShareClassSchema>, direction: 'up' | 'down') {
    const selectedRow = row.original.new
    const isClass = row.depth === 0
    const parentRowId = row.getParentRow()?.original.new.id

    const classOrSeriesList = isClass
      ? tableState.value
      : tableState.value.find(item => item.new.id === parentRowId)?.new.series

    if (!classOrSeriesList || classOrSeriesList.length < 2) {
      return
    }

    const flattenedList: Array<{ id: string, priority: number }> = isClass
      ? (classOrSeriesList as TableBusinessState<ShareClassSchema>[]).map(item => item.new)
      : (classOrSeriesList as ShareSeriesSchema[])

    // find the nearest item above or below the selectedRow
    const targetRow = flattenedList
      .filter(item => direction === 'up' ? item.priority < selectedRow.priority : item.priority > selectedRow.priority)
      .sort((a, b) => direction === 'up' ? b.priority - a.priority : a.priority - b.priority)[0]

    if (targetRow) {
      [selectedRow.priority, targetRow.priority] = [targetRow.priority, selectedRow.priority]
    }
  }

  return {
    expandedState,
    tableState,
    addNewShareClass,
    removeShareClass,
    undoShareClass,
    updateShareClass,
    addNewShareSeries,
    updateShareSeries,
    undoShareSeries,
    removeShareSeries,
    changePriority
  }
}
