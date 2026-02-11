import type { ExpandedState } from '@tanstack/vue-table'

export const useManageShareStructure = (stateKey: string = 'manage-share-structure') => {
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

  function removeShareClass(row: TableBusinessRow<ShareClassSchema>): void {
    const removedPriority = row.original.new.priority

    if (row.original.old === undefined) {
      tableState.value = tableState.value.filter(item => item.new.id !== row.original.new.id)
      tableState.value.forEach(item => item.new.priority > removedPriority && item.new.priority--)
    } else {
      const rowToUpdate = tableState.value.find(item => item.new.id === row.original.new.id)
      if (rowToUpdate) {
        rowToUpdate.new.actions = [ActionType.REMOVED]
      }
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

  function updateShareClass(row: TableBusinessRow<ShareClassSchema>, shareClass: ActiveShareClassSchema): void {
    if (!shareClass) {
      return
    }

    const rowToUpdate = tableState.value.find(item => item.new.id === row.original.new.id)

    if (rowToUpdate) {
      rowToUpdate.new = {
        ...shareClass,
        actions: row.original.old ? [ActionType.CHANGED] : [ActionType.ADDED]
      }
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

      if (seriesIndex !== -1) {
        parentRow.new.series[seriesIndex] = {
          ...shareSeries,
          actions: row.original.old ? [ActionType.CHANGED] : [ActionType.ADDED]
        }
      }
    }
  }

  function undoShareSeries(row: TableBusinessRow<ShareClassSchema>): void {
    const parentId = row.getParentRow()?.original.new.id
    const oldState = row.original.old

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

    if (row.original.old === undefined) {
      parentRow.new.series = seriesArray.filter(s => s.id !== row.original.new.id)
      parentRow.new.series.forEach(s => s.priority > removedPriority && s.priority--)
    } else {
      const removedSeries = seriesArray.find(s => s.id === row.original.new.id)
      if (removedSeries) {
        removedSeries.actions = [ActionType.REMOVED]
      }
    }
  }

  return {
    expandedState,
    tableState,
    addNewShareClass,
    removeShareClass,
    undoShareClass,
    updateShareClass,
    updateShareSeries,
    undoShareSeries,
    removeShareSeries
  }
}
