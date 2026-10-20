const SHARE_CLASS_NON_EDITABLE_FIELDS = ['id', 'isEditing', 'actions', 'series'] as const
const SHARE_SERIES_NON_EDITABLE_FIELDS = ['id', 'isEditing', 'actions'] as const
const RESOLUTION_DATE_NON_EDITABLE_FIELDS = ['id', 'isEditing', 'actions'] as const

function isClassData(
  data: ShareClassSchema | ShareSeriesSchema | ResolutionDateSchema
): data is ShareClassSchema {
  return 'series' in data
}

function isSeriesData(
  data: ShareClassSchema | ShareSeriesSchema | ResolutionDateSchema
): data is ShareSeriesSchema {
  return !('series' in data) && 'hasMaximumShares' in data
}

function isDateData(
  data: ShareClassSchema | ShareSeriesSchema | ResolutionDateSchema
): data is ResolutionDateSchema {
  return 'date' in data
}

export const useManageShareStructure = (
  stateKey: string = 'manage-share-structure',
  opts?: {
    cleanupFn?: () => void
  }
) => {
  const { baseModal } = useModal()
  const { t } = useNuxtApp().$i18n

  const shareClasses = useState<TableBusinessState<ShareClassSchema>[]>(
    `${stateKey}-share-classes-state`,
    () => []
  )
  const resolutionDates = useState<TableBusinessState<ResolutionDateSchema>[]>(
    `${stateKey}-resolution-dates-state`,
    () => []
  )

  /** returns true if only the share structure has changes */
  const hasChangedShares = computed(() => shareClasses.value.some((c) => {
    const classHasChanges = c.new.actions.length > 0
    const seriesHasChanges = c.new.series.some(s => s.actions.length > 0)
    return classHasChanges || seriesHasChanges
  }))

  /** returns true if only the resolution dates have changes */
  const hasChangedDates = computed(() => resolutionDates.value.some(
    rd => rd.new.actions.length > 0
  ))

  /** returns true if either the share structure or resolution dates have changes */
  const hasChanges = computed(() => hasChangedShares.value || hasChangedDates.value)

  /** returns true if a share class or series has rights or restrictions */
  const hasRightsOrRestrictions = computed(() => shareClasses.value.some((c) => {
    const classHasRor = c.new.hasRightsOrRestrictions || c.old?.hasRightsOrRestrictions
    const seriesHasRor = c.new.series.some(s => s.hasRightsOrRestrictions)
      || c.old?.series.some(s => s.hasRightsOrRestrictions)
    return classHasRor || seriesHasRor
  }))

  /** returns an array of raw resolutionDate object (not new/old table state) */
  const existingResolutionDates = computed(() => resolutionDates.value.map(rd => rd.new))

  /** returns an array of raw resolutionDate object (not wrapped in new/old table state) */
  const hasExistingResolutionDates = computed(() => existingResolutionDates.value.length > 0)

  function resolvePriorities<T extends { id: string, priority: number, actions?: ActionType[] }>(items: T[]) {
    const sorted = items.toSorted((a, b) => a.priority - b.priority)
    sorted.forEach((item, index) => {
      item.priority = index + 1
    })
  }

  function updateTable(
    subject?: ActiveShareStructureSchema,
    parentId?: string
  ): void {
    if (!subject || !subject.value) {
      return
    }

    const { key, value } = subject

    switch (key) {
      case 'shareClass': {
        const index = shareClasses.value.findIndex(item => item.new.id === value.id)

        if (index === -1) {
          const newRecord: TableBusinessState<ShareClassSchema> = {
            old: undefined,
            new: {
              ...cloneDeep(value),
              priority: 0,
              isEditing: false,
              actions: [ActionType.ADDED]
            }
          }
          shareClasses.value = [newRecord, ...shareClasses.value]
        } else {
          const existing = shareClasses.value[index]!
          const oldState = existing.old
          const isChanged = !isEqualOmit(value, existing.new, SHARE_CLASS_NON_EDITABLE_FIELDS)

          const updatedRecord: TableBusinessState<ShareClassSchema> = {
            old: oldState,
            new: {
              ...cloneDeep(value),
              series: existing.new.series,
              currencyAdditional: undefined,
              isEditing: false,
              actions: oldState ? (isChanged ? [ActionType.CHANGED] : []) : [ActionType.ADDED]
            }
          }
          shareClasses.value = shareClasses.value.toSpliced(index, 1, updatedRecord)
        }

        resolvePriorities(shareClasses.value.map(c => c.new))
        break
      }

      case 'shareSeries': {
        if (!parentId) {
          return
        }
        const parentRow = shareClasses.value.find(item => item.new.id === parentId)
        if (!parentRow) {
          return
        }

        const seriesArray = parentRow.new.series
        const index = seriesArray.findIndex(s => s.id === value.id)

        if (index === -1) {
          const newSeries: ShareSeriesSchema = {
            ...cloneDeep(value),
            priority: 0,
            isEditing: false,
            actions: [ActionType.ADDED]
          }
          parentRow.new.series = [newSeries, ...seriesArray]
        } else {
          const existingSeries = seriesArray[index]!
          const isChanged = !isEqualOmit(value, existingSeries, SHARE_SERIES_NON_EDITABLE_FIELDS)

          const updatedSeries: ShareSeriesSchema = {
            ...cloneDeep(value),
            isEditing: false,
            actions: existingSeries.actions.includes(ActionType.ADDED)
              ? [ActionType.ADDED]
              : (isChanged ? [ActionType.CHANGED] : [])
          }
          parentRow.new.series = seriesArray.toSpliced(index, 1, updatedSeries)
        }

        resolvePriorities(parentRow.new.series)
        break
      }

      case 'resolutionDate': {
        const index = resolutionDates.value.findIndex(item => item.new.id === value.id)

        if (index === -1) {
          const newRecord: TableBusinessState<ResolutionDateSchema> = {
            old: undefined,
            new: {
              ...cloneDeep(value),
              isEditing: false,
              actions: [ActionType.ADDED]
            }
          }
          resolutionDates.value = [newRecord, ...resolutionDates.value]
        } else {
          const existing = resolutionDates.value[index]!
          const oldState = existing.old
          const isChanged = !isEqualOmit(value, existing.new, RESOLUTION_DATE_NON_EDITABLE_FIELDS)

          const updatedRecord: TableBusinessState<ResolutionDateSchema> = {
            old: oldState,
            new: {
              ...cloneDeep(value),
              isEditing: false,
              actions: oldState ? (isChanged ? [ActionType.CHANGED] : []) : [ActionType.ADDED]
            }
          }
          resolutionDates.value = resolutionDates.value.toSpliced(index, 1, updatedRecord)
        }
        break
      }
    }

    opts?.cleanupFn?.()
  }

  /** Add a new Class or Series to the shareClasses table state (add resolution date not supported) */
  function addSubject(subject: ActiveShareStructureSchema, parentId?: string) {
    updateTable(subject, parentId)
  }

  function editSubject<T extends ShareClassSchema | ShareSeriesSchema | ResolutionDateSchema>(
    subject: ActiveShareStructureSchema,
    row?: TableBusinessRow<T>,
    parentId?: string
  ): void {
    if (!subject || !subject.value) {
      return
    }

    // Intercept Share Class edit if child series exist & structural rules changed
    if (subject.key === 'shareClass' && row && isClassData(row.original.new)) {
      const classData = row.original.new
      const currentClassState = shareClasses.value.find(item => item.new.id === classData.id)
      const activeSeries = currentClassState?.new.series.filter(s => !s.actions.includes(ActionType.REMOVED)) ?? []

      if (currentClassState && activeSeries.length > 0) {
        const initialMaxShares = classData.maxNumberOfShares
        const submittedMaxShares = subject.value.maxNumberOfShares
        const maxSharesChanged = initialMaxShares !== submittedMaxShares
        const rightsRemoved = !subject.value.hasRightsOrRestrictions

        if (rightsRemoved || maxSharesChanged) {
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
                  updateTable(subject, parentId)
                  const updatedClass = shareClasses.value.find(item => item.new.id === classData.id)
                  if (updatedClass) {
                    updatedClass.new.series.forEach((s) => {
                      s.actions = [ActionType.REMOVED]
                      s.isInvalid = true
                    })
                  }
                  opts?.cleanupFn?.()
                }
              }
            ]
          })
          return
        }
      }
    }

    updateTable(subject, parentId)
  }

  function removeSubject<T extends ShareClassSchema | ShareSeriesSchema | ResolutionDateSchema>(
    row: TableBusinessRow<T>
  ) {
    const isExisting = getIsExistingRecord(row)
    const newState = row.original.new

    if (isClassData(newState)) {
      const classToUpdate = shareClasses.value.find(item => item.new.id === newState.id)
      const activeSeries = classToUpdate?.new.series.filter(s => !s.actions.includes(ActionType.REMOVED)) ?? []

      const removeClass = (isExisting: boolean, newState: ShareClassSchema) => {
        if (isExisting) {
          const rowToUpdate = shareClasses.value.find(item => item.new.id === newState.id)
          if (rowToUpdate) {
            rowToUpdate.new.actions = [ActionType.REMOVED]
          }
        } else {
          shareClasses.value = shareClasses.value.filter(item => item.new.id !== newState.id)
          resolvePriorities(shareClasses.value.map(c => c.new))
        }
        opts?.cleanupFn?.()
      }

      if (classToUpdate && activeSeries.length > 0) {
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
                removeClass(isExisting, newState)
              }
            }
          ]
        })
        return
      }

      removeClass(isExisting, newState)
      return
    }

    if (isSeriesData(newState)) {
      const parentId = row.getParentRow()?.original.new.id
      const parentRow = shareClasses.value.find(item => item.new.id === parentId)
      if (parentRow) {
        if (isExisting) {
          const series = parentRow.new.series.find(s => s.id === newState.id)
          if (series) {
            series.actions = [ActionType.REMOVED]
          }
        } else {
          parentRow.new.series = parentRow.new.series.filter(s => s.id !== newState.id)
          resolvePriorities(parentRow.new.series)
        }
      }
      opts?.cleanupFn?.()
      return
    }

    if (isDateData(newState)) {
      if (isExisting) {
        const rowToUpdate = resolutionDates.value.find(item => item.new.id === newState.id)
        if (rowToUpdate) {
          rowToUpdate.new.actions = [ActionType.REMOVED]
        }
      } else {
        resolutionDates.value = resolutionDates.value.filter(item => item.new.id !== newState.id)
      }
      opts?.cleanupFn?.()
    }
  }

  function undoSubject<T extends ShareClassSchema | ShareSeriesSchema | ResolutionDateSchema>(
    row: TableBusinessRow<T>
  ) {
    const oldState = row.original.old

    // nothing to undo if no old state
    if (!oldState) {
      return
    }

    if (isClassData(oldState)) {
      const rowToUpdate = shareClasses.value.find(item => item.new.id === oldState.id)
      if (rowToUpdate) {
        const currentPriority = rowToUpdate.new.priority
        rowToUpdate.new = {
          ...cloneDeep(oldState),
          priority: currentPriority
        }
      }
    } else if (isSeriesData(oldState)) {
      const parentId = row.getParentRow()?.original.new.id
      const parentRow = shareClasses.value.find(item => item.new.id === parentId)
      if (parentRow) {
        const seriesIndex = parentRow.new.series.findIndex(s => s.id === oldState.id)
        if (seriesIndex !== -1) {
          const currentPriority = parentRow.new.series[seriesIndex]!.priority
          parentRow.new.series[seriesIndex] = {
            ...cloneDeep(oldState),
            priority: currentPriority
          }
        }
      }
    } else if (isDateData(oldState)) {
      const rowToUpdate = resolutionDates.value.find(item => item.new.id === oldState.id)
      if (rowToUpdate) {
        rowToUpdate.new = cloneDeep(oldState)
      }
    }

    opts?.cleanupFn?.()
  }

  function changePriority<T extends ShareClassSchema | ShareSeriesSchema>(
    row: TableBusinessRow<T>,
    direction: 'up' | 'down'
  ) {
    const rowData = row.original.new

    const reorderItem = <I extends { priority: number }>(
      item: I,
      list: I[],
      direction: 'up' | 'down'
    ) => {
      if (list.length < 2) {
        return
      }

      const targetItem = list
        .filter(i => (direction === 'up' ? i.priority < item.priority : i.priority > item.priority))
        .sort((a, b) => (direction === 'up' ? b.priority - a.priority : a.priority - b.priority))[0]

      if (targetItem) {
        [item.priority, targetItem.priority] = [targetItem.priority, item.priority]
      }
    }

    if (isClassData(rowData)) {
      reorderItem(rowData, shareClasses.value.map(item => item.new), direction)
    } else if (isSeriesData(rowData)) {
      const parentRowId = row.getParentRow()?.original.new.id
      if (!parentRowId) {
        return
      }

      const seriesList = shareClasses.value.find(item => item.new.id === parentRowId)?.new.series
      if (seriesList) {
        reorderItem(rowData, seriesList, direction)
      }
    }
  }

  return {
    shareClasses,
    resolutionDates,
    hasChangedShares,
    hasChangedDates,
    hasChanges,
    hasRightsOrRestrictions,
    existingResolutionDates,
    hasExistingResolutionDates,
    isClassData,
    isSeriesData,
    isDateData,
    addSubject,
    editSubject,
    removeSubject,
    undoSubject,
    changePriority
  }
}
