/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const openModalMock = vi.fn()
mockNuxtImport('useModal', () => () => ({
  baseModal: { open: openModalMock }
}))

const createMockRow = (data: any, depth = 0, parentId?: string) => ({
  depth,
  original: data,
  getParentRow: () => (parentId ? { original: { new: { id: parentId } } } : undefined)
})

describe('useManageShareStructure', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Type Guards', () => {
    it('isClassData identifies share classes correctly', () => {
      const { isClassData } = useManageShareStructure()

      const classData = { id: 'c1', series: [] }
      const seriesData = { id: 's1', hasMaximumShares: true }
      const dateData = { id: 'd1', date: '2026-01-01' }

      expect(isClassData(classData as any)).toBe(true)
      expect(isClassData(seriesData as any)).toBe(false)
      expect(isClassData(dateData as any)).toBe(false)
    })

    it('isSeriesData identifies share series correctly', () => {
      const { isSeriesData } = useManageShareStructure()

      const classData = { id: 'c1', series: [] }
      const seriesData = { id: 's1', hasMaximumShares: true }
      const dateData = { id: 'd1', date: '2026-01-01' }

      expect(isSeriesData(seriesData as any)).toBe(true)
      expect(isSeriesData(classData as any)).toBe(false)
      expect(isSeriesData(dateData as any)).toBe(false)
    })

    it('isDateData identifies resolution dates correctly', () => {
      const { isDateData } = useManageShareStructure('')

      const classData = { id: 'c1', series: [] }
      const dateData = { id: 'd1', date: '2026-01-01' }

      expect(isDateData(dateData as any)).toBe(true)
      expect(isDateData(classData as any)).toBe(false)
    })
  })

  describe('Computed Properties', () => {
    it('hasChangedShares is true if class or series has active actions', () => {
      const { shareClasses, hasChangedShares } = useManageShareStructure()

      shareClasses.value = [
        { new: { id: 'c1', actions: [], series: [] }, old: undefined }
      ] as any
      expect(hasChangedShares.value).toBe(false)

      shareClasses.value[0]!.new.series = [{ id: 's1', actions: [ActionType.ADDED] }] as any
      expect(hasChangedShares.value).toBe(true)

      shareClasses.value[0]!.new.actions = [ActionType.CHANGED]
      shareClasses.value[0]!.new.series = []
      expect(hasChangedShares.value).toBe(true)
    })

    it('hasChangedDates is true if a resolution date has actions', () => {
      const { resolutionDates, hasChangedDates } = useManageShareStructure()

      resolutionDates.value = [{ new: { id: 'r1', actions: [] } }] as any
      expect(hasChangedDates.value).toBe(false)

      resolutionDates.value[0]!.new.actions = [ActionType.REMOVED]
      expect(hasChangedDates.value).toBe(true)
    })

    it('hasChanges is true if either shares or dates have changes', () => {
      const { shareClasses, resolutionDates, hasChanges } = useManageShareStructure()

      shareClasses.value = [{ new: { id: 'c1', actions: [], series: [] } }] as any
      resolutionDates.value = [{ new: { id: 'r1', actions: [] } }] as any
      expect(hasChanges.value).toBe(false)

      resolutionDates.value[0]!.new.actions = [ActionType.ADDED]
      expect(hasChanges.value).toBe(true)
    })

    it('hasRightsOrRestrictions checks both new and old states across classes and series', () => {
      const { shareClasses, hasRightsOrRestrictions } = useManageShareStructure()

      shareClasses.value = [
        {
          new: { id: 'c1', hasRightsOrRestrictions: false, series: [] },
          old: { id: 'c1', hasRightsOrRestrictions: false, series: [] }
        }
      ] as any
      expect(hasRightsOrRestrictions.value).toBe(false)

      shareClasses.value[0]!.old!.hasRightsOrRestrictions = true
      expect(hasRightsOrRestrictions.value).toBe(true)

      shareClasses.value[0]!.old!.hasRightsOrRestrictions = false
      shareClasses.value[0]!.new.series = [{ id: 's1', hasRightsOrRestrictions: true }] as any
      expect(hasRightsOrRestrictions.value).toBe(true)
    })

    it('existingResolutionDates and hasExistingResolutionDates', async () => {
      const { resolutionDates, existingResolutionDates, hasExistingResolutionDates } = useManageShareStructure()
      resolutionDates.value = []

      await nextTick()

      expect(hasExistingResolutionDates.value).toBe(false)
      expect(existingResolutionDates.value).toEqual([])

      const dateObj = { id: 'r1', date: '2026-03-31' }
      resolutionDates.value = [{ new: dateObj, old: undefined }] as any

      expect(hasExistingResolutionDates.value).toBe(true)
      expect(existingResolutionDates.value).toEqual([dateObj])
    })
  })

  describe('Resolution Date Sync', () => {
    it('syncs a valid resolution date on init', async () => {
      const standaloneDate = ref({ id: 'rd-1', date: '2026-01-15' }) as any
      const { resolutionDates } = useManageShareStructure('sync-init', {
        resolutionDate: standaloneDate
      })

      await nextTick()

      expect(resolutionDates.value).toHaveLength(1)
      expect(resolutionDates.value[0]!.new).toEqual({ id: 'rd-1', date: '2026-01-15' })
    })

    it('syncs a valid resolution date from undefined', async () => {
      const standaloneDate = ref<any>(undefined)
      const { resolutionDates } = useManageShareStructure('sync-init-undefined', {
        resolutionDate: standaloneDate
      })

      await nextTick()
      expect(resolutionDates.value).toHaveLength(0)

      standaloneDate.value = { id: 'rd-1', date: '2026-05-10' }
      await nextTick()

      expect(resolutionDates.value).toHaveLength(1)
      expect(resolutionDates.value[0]!.new).toEqual({ id: 'rd-1', date: '2026-05-10' })
    })

    it('syncs a valid resolution date from null', async () => {
      const standaloneDate = ref<any>(null)
      const { resolutionDates } = useManageShareStructure('sync-init-null', {
        resolutionDate: standaloneDate
      })

      await nextTick()
      expect(resolutionDates.value).toHaveLength(0)

      standaloneDate.value = { id: 'rd-1', date: '2026-05-10' }
      await nextTick()

      expect(resolutionDates.value).toHaveLength(1)
      expect(resolutionDates.value[0]!.new).toEqual({ id: 'rd-1', date: '2026-05-10' })
    })

    it('updates resolutionDates when standalone date changes', async () => {
      const standaloneDate = ref({ id: 'rd-1', date: '2026-01-15' }) as any
      const { resolutionDates } = useManageShareStructure('sync-update', {
        resolutionDate: standaloneDate
      })

      await nextTick()
      expect(resolutionDates.value[0]!.new.date).toBe('2026-01-15')

      standaloneDate.value.date = '2026-02-20'
      await nextTick()

      expect(resolutionDates.value).toHaveLength(1)
      expect(resolutionDates.value[0]!.new.date).toBe('2026-02-20')
    })

    it('removes date when cleared or whitespace only', async () => {
      const standaloneDate = ref({ id: 'rd-1', date: '2026-01-15' }) as any
      const { resolutionDates } = useManageShareStructure('sync-clear', {
        resolutionDate: standaloneDate
      })

      await nextTick()
      expect(resolutionDates.value).toHaveLength(1)

      standaloneDate.value.date = '   '
      await nextTick()

      expect(resolutionDates.value).toHaveLength(0)
    })

    it('removes date when invalid', async () => {
      const standaloneDate = ref({ id: 'rd-1', date: '2026-01-15' }) as any
      const { resolutionDates } = useManageShareStructure('sync-invalid', {
        resolutionDate: standaloneDate
      })

      await nextTick()
      expect(resolutionDates.value).toHaveLength(1)

      standaloneDate.value.date = 'invalid-date-string'
      await nextTick()

      expect(resolutionDates.value).toHaveLength(0)
    })

    it('deletes previous date when resolutionDate id changes', async () => {
      const standaloneDate = ref<any>({ id: 'rd-1', date: '2026-01-15' })
      const { resolutionDates } = useManageShareStructure('sync-swap', {
        resolutionDate: standaloneDate
      })

      await nextTick()
      expect(resolutionDates.value).toHaveLength(1)
      expect(resolutionDates.value[0]!.new.id).toBe('rd-1')

      standaloneDate.value = { id: 'rd-2', date: '2026-05-10' }
      await nextTick()

      expect(resolutionDates.value).toHaveLength(1)
      expect(resolutionDates.value[0]!.new.id).toBe('rd-2')
      expect(resolutionDates.value[0]!.new.date).toBe('2026-05-10')
    })

    it('removes row when resolutionDate is set to undefined', async () => {
      const standaloneDate = ref<any>({ id: 'rd-1', date: '2026-01-15' })
      const { resolutionDates } = useManageShareStructure('sync-undefined', {
        resolutionDate: standaloneDate
      })

      await nextTick()
      expect(resolutionDates.value).toHaveLength(1)

      standaloneDate.value = undefined
      await nextTick()

      expect(resolutionDates.value).toHaveLength(0)
    })

    it('removes row when resolutionDate is set to null', async () => {
      const standaloneDate = ref<any>({ id: 'rd-1', date: '2026-01-15' })
      const { resolutionDates } = useManageShareStructure('sync-null', {
        resolutionDate: standaloneDate
      })

      await nextTick()
      expect(resolutionDates.value).toHaveLength(1)

      standaloneDate.value = null
      await nextTick()

      expect(resolutionDates.value).toHaveLength(0)
    })

    it('should not sync duplicate dates', async () => {
      const standaloneDate = ref<any>(undefined)
      const { resolutionDates } = useManageShareStructure('sync-duplicate', {
        resolutionDate: standaloneDate
      })

      resolutionDates.value = [
        { old: undefined, new: { id: 'rd-table-1', date: '2026-01-15' } }
      ] as any

      standaloneDate.value = { id: 'rd-standalone', date: '2026-01-15' }
      await nextTick()

      expect(resolutionDates.value).toHaveLength(1)
      expect(resolutionDates.value[0]!.new.id).toBe('rd-table-1')
    })

    it('preserves existing resolution dates when standalone date becomes invalid', async () => {
      const standaloneDate = ref<any>({ id: 'rd-1', date: '2026-01-15' })
      const { resolutionDates } = useManageShareStructure('sync-preserve-others', {
        resolutionDate: standaloneDate
      })

      resolutionDates.value.push({
        old: undefined,
        new: { id: 'rd-existing', date: '2025-12-01' }
      } as any)

      await nextTick()
      expect(resolutionDates.value).toHaveLength(2)

      standaloneDate.value.date = ''
      await nextTick()

      expect(resolutionDates.value).toHaveLength(1)
      expect(resolutionDates.value[0]!.new.id).toBe('rd-existing')
    })

    it('allows resolutionDate opt to be a getter', async () => {
      const state = reactive({ standaloneDate: { id: 'rd-getter', date: '2026-04-10' } }) as any
      const { resolutionDates } = useManageShareStructure('sync-getter', {
        resolutionDate: () => state.standaloneDate
      })

      await nextTick()
      expect(resolutionDates.value).toHaveLength(1)
      expect(resolutionDates.value[0]!.new.id).toBe('rd-getter')

      state.standaloneDate.date = '2026-08-20'
      await nextTick()
      expect(resolutionDates.value[0]!.new.date).toBe('2026-08-20')
    })

    it('ignores object input if id is missing or empty', async () => {
      const standaloneDate = ref<any>({ id: '', date: '2026-01-15' })
      const { resolutionDates } = useManageShareStructure('sync-no-id', {
        resolutionDate: standaloneDate
      })

      await nextTick()
      expect(resolutionDates.value).toHaveLength(0)
    })
  })

  describe('addSubject', () => {
    it('adds a new share class and normalizes priorities', () => {
      const { shareClasses, addSubject } = useManageShareStructure('add-class')

      shareClasses.value = [
        { new: { id: 'c1', priority: 1, actions: [] }, old: undefined },
        { new: { id: 'c2', priority: 2, actions: [] }, old: undefined }
      ] as any

      addSubject({
        key: 'shareClass',
        value: { id: 'c3', name: 'Class C' }
      } as any)

      expect(shareClasses.value).toHaveLength(3)
      expect(shareClasses.value[0]!.new.id).toBe('c3')
      expect(shareClasses.value[0]!.new.actions).toContain(ActionType.ADDED)
      expect(shareClasses.value.map(c => c.new.priority)).toEqual([1, 2, 3])
    })

    it('adds a series to a class and normalizes series priorities', () => {
      const { shareClasses, addSubject } = useManageShareStructure()

      shareClasses.value = [
        {
          new: {
            id: 'c1',
            series: [{ id: 's1', priority: 1, actions: [] }]
          },
          old: undefined
        }
      ] as any

      addSubject(
        { key: 'shareSeries', value: { id: 's2', name: 'Series 2' } } as any,
        'c1'
      )

      const seriesList = shareClasses.value[0]!.new.series
      expect(seriesList).toHaveLength(2)
      expect(seriesList[0]!.id).toBe('s2')
      expect(seriesList[0]!.actions).toContain(ActionType.ADDED)
      expect(seriesList.map(s => s.priority)).toEqual([1, 2])
    })

    it('adds a resolution date to state', () => {
      const { resolutionDates, addSubject } = useManageShareStructure()

      addSubject({
        key: 'resolutionDate',
        value: { id: 'r1', date: '2026-05-15' } as any
      })

      expect(resolutionDates.value).toHaveLength(1)
      expect(resolutionDates.value[0]!.new.date).toBe('2026-05-15')
      expect(resolutionDates.value[0]!.new.actions).toContain(ActionType.ADDED)
    })

    it('does nothing for a class if subject or subject.value is missing', () => {
      const cleanup = vi.fn()
      const { shareClasses, addSubject } = useManageShareStructure('test-null', { cleanupFn: cleanup })

      addSubject(undefined as any)
      addSubject({ key: 'shareClass', value: undefined as any })

      expect(shareClasses.value).toHaveLength(0)
      expect(cleanup).not.toHaveBeenCalled()
    })

    it('does nothing for a series if parentId is missing or invalid', () => {
      const cleanup = vi.fn()
      const { shareClasses, addSubject } = useManageShareStructure('test-invalid-parent', { cleanupFn: cleanup })

      shareClasses.value = [{ new: { id: 'c1', series: [] } }] as any

      const seriesSubject = {
        key: 'shareSeries' as const,
        value: { id: 's1', name: 'Series A', hasMaximumShares: true }
      }

      addSubject(seriesSubject as any)
      addSubject(seriesSubject as any, 'non-existent-id')

      expect(shareClasses.value[0]!.new.series).toHaveLength(0)
      expect(cleanup).not.toHaveBeenCalled()
    })
  })

  describe('editSubject', () => {
    it('updates share class, resets currencyAdditional and adds ActionType.CHANGED when changed', () => {
      const cleanup = vi.fn()
      const { shareClasses, editSubject } = useManageShareStructure('edit-class', { cleanupFn: cleanup })

      const initialRecord = {
        new: { id: 'c1', name: 'Original Class', currencyAdditional: 'Custom', series: [], actions: [] },
        old: { id: 'c1', name: 'Original Class' }
      }
      shareClasses.value = [initialRecord] as any

      const mockRow = createMockRow(initialRecord) as any
      editSubject({ key: 'shareClass', value: { id: 'c1', name: 'Renamed Class', series: [] } } as any, mockRow)

      expect(shareClasses.value[0]!.new.name).toBe('Renamed Class')
      expect(shareClasses.value[0]!.new.currencyAdditional).toBeUndefined()
      expect(shareClasses.value[0]!.new.actions).toContain(ActionType.CHANGED)
      expect(cleanup).toHaveBeenCalled()
    })

    it('opens modal when maxShares or rights/restrictions are removed on a class with a series', () => {
      const cleanup = vi.fn()
      const { shareClasses, editSubject } = useManageShareStructure('edit-class-modal', { cleanupFn: cleanup })

      const classData = {
        new: {
          id: 'c1',
          name: 'Class A',
          maxNumberOfShares: 500,
          hasRightsOrRestrictions: true,
          series: [{ id: 's1', actions: [] }]
        },
        old: { id: 'c1' }
      }
      shareClasses.value = [classData] as any

      const mockRow = createMockRow(classData) as any

      editSubject(
        {
          key: 'shareClass',
          value: { id: 'c1', name: 'Class A', maxNumberOfShares: 500, hasRightsOrRestrictions: false } as any
        },
        mockRow
      )

      expect(openModalMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Remove Share Series' })
      )

      const modalConfig = openModalMock.mock.calls[0]![0]
      modalConfig.buttons.find((b: any) => b.label === 'Remove Series').onClick()

      const seriesItem = shareClasses.value[0]!.new.series[0]
      expect(seriesItem!.actions).toContain(ActionType.REMOVED)
      expect(seriesItem!.isInvalid).toBe(true)
      expect(cleanup).toHaveBeenCalled()
    })

    it('updates series and preserves ADDED action if series was newly added', () => {
      const { shareClasses, editSubject } = useManageShareStructure('edit-series')

      const draftSeries = { id: 's1', name: 'Draft', actions: [ActionType.ADDED] }
      shareClasses.value = [{ new: { id: 'c1', series: [draftSeries] } }] as any

      const mockRow = createMockRow({ new: draftSeries }, 1, 'c1') as any

      editSubject(
        { key: 'shareSeries', value: { id: 's1', name: 'Renamed Draft' } } as any,
        mockRow,
        'c1'
      )

      const updated = shareClasses.value[0]!.new.series[0]!
      expect(updated.name).toBe('Renamed Draft')
      expect(updated.actions).toEqual([ActionType.ADDED])
    })

    it('updates an existing resolution date and adds ActionType.CHANGED', () => {
      const { resolutionDates, editSubject } = useManageShareStructure()

      const dateRecord = {
        new: { id: 'r1', date: '2026-01-01', actions: [] },
        old: { id: 'r1', date: '2026-01-01' }
      }
      resolutionDates.value = [dateRecord] as any

      const mockRow = createMockRow(dateRecord) as any
      editSubject({ key: 'resolutionDate', value: { id: 'r1', date: '2026-06-01' } } as any, mockRow)

      expect(resolutionDates.value[0]!.new.date).toBe('2026-06-01')
      expect(resolutionDates.value[0]!.new.actions).toContain(ActionType.CHANGED)
    })
  })

  describe('removeSubject', () => {
    it('filters out newly added share classes and updates priorities', () => {
      const { shareClasses, removeSubject } = useManageShareStructure()

      shareClasses.value = [
        { new: { id: 'c1', priority: 1, series: [] }, old: undefined },
        { new: { id: 'c2', priority: 2, series: [] }, old: undefined }
      ] as any

      const mockRow = createMockRow(shareClasses.value[0]) as any
      removeSubject(mockRow)

      expect(shareClasses.value).toHaveLength(1)
      expect(shareClasses.value[0]!.new.id).toBe('c2')
      expect(shareClasses.value[0]!.new.priority).toBe(1)
    })

    it('sets existing share classes as REMOVED if old state is present', () => {
      const { shareClasses, removeSubject } = useManageShareStructure()

      const existingRecord = {
        new: { id: 'c1', priority: 1, series: [], actions: [] },
        old: { id: 'c1', name: 'Original Class' }
      }
      shareClasses.value = [existingRecord] as any

      removeSubject(createMockRow(existingRecord) as any)

      expect(shareClasses.value[0]!.new.actions).toContain(ActionType.REMOVED)
    })

    it('opens modal before removing class with series', () => {
      const { shareClasses, removeSubject } = useManageShareStructure()

      const classWithSeries = {
        new: { id: 'c1', priority: 1, series: [{ id: 's1', actions: [] }] },
        old: undefined
      }
      shareClasses.value = [classWithSeries] as any

      removeSubject(createMockRow(classWithSeries) as any)

      expect(openModalMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Remove Share Class with Series' })
      )
    })

    it('removes a newly added series and updates priorities', () => {
      const { shareClasses, removeSubject } = useManageShareStructure()

      const s1 = { id: 's1', priority: 1, hasMaximumShares: true }
      const s2 = { id: 's2', priority: 2, hasMaximumShares: true }
      const s3 = { id: 's3', priority: 3, hasMaximumShares: true }

      shareClasses.value = [{ new: { id: 'c1', series: [s1, s2, s3] } }] as any

      const mockRow = {
        depth: 1,
        original: { new: s2, old: undefined },
        getParentRow: () => ({ original: { new: { id: 'c1' } } })
      }

      removeSubject(mockRow as any)

      const remainingSeries = shareClasses.value[0]!.new.series
      expect(remainingSeries).toHaveLength(2)
      expect(remainingSeries.map(s => s.id)).toEqual(['s1', 's3'])
      expect(remainingSeries.map(s => s.priority)).toEqual([1, 2])
    })

    it('handles removing resolution dates correctly', () => {
      const { resolutionDates, removeSubject } = useManageShareStructure()

      const newDateRecord = { new: { id: 'r1', date: '2026-01-01' }, old: undefined }
      resolutionDates.value = [newDateRecord] as any

      removeSubject(createMockRow(newDateRecord) as any)
      expect(resolutionDates.value).toHaveLength(0)
    })
  })

  describe('undoSubject', () => {
    it('does nothing if old state is undefined', () => {
      const cleanup = vi.fn()
      const { undoSubject } = useManageShareStructure('undo-undefined', { cleanupFn: cleanup })

      const mockRow = createMockRow({ new: { id: 'c1' }, old: undefined }) as any
      undoSubject(mockRow)

      expect(cleanup).not.toHaveBeenCalled()
    })

    it('restores share class while preserving priority', () => {
      const { shareClasses, undoSubject } = useManageShareStructure('undo-class')

      const classData = {
        new: { id: 'c1', name: 'Modified', priority: 4, series: [], actions: [ActionType.CHANGED] },
        old: { id: 'c1', name: 'Original', priority: 1, series: [], actions: [] }
      }
      shareClasses.value = [classData] as any

      undoSubject(createMockRow(classData) as any)

      expect(shareClasses.value[0]!.new.name).toBe('Original')
      expect(shareClasses.value[0]!.new.priority).toBe(4)
      expect(shareClasses.value[0]!.new.actions).toEqual([])
    })

    it('restores series state', () => {
      const { shareClasses, undoSubject } = useManageShareStructure()

      const oldSeries = { id: 's1', name: 'Original Series', priority: 1, hasMaximumShares: true }
      const currentSeries = { id: 's1', name: 'Edited Series', priority: 3, hasMaximumShares: true }

      shareClasses.value = [{ new: { id: 'c1', series: [currentSeries] } }] as any

      const mockRow = {
        depth: 1,
        original: { new: currentSeries, old: oldSeries },
        getParentRow: () => ({ original: { new: { id: 'c1' } } })
      }

      undoSubject(mockRow as any)

      const result = shareClasses.value[0]!.new.series[0]!
      expect(result.name).toBe('Original Series')
      expect(result.priority).toBe(3)
    })

    it('restores resolution date state', () => {
      const { resolutionDates, undoSubject } = useManageShareStructure()

      const dateData = {
        new: { id: 'r1', date: '2026-12-31', actions: [ActionType.CHANGED] },
        old: { id: 'r1', date: '2026-01-01', actions: [] }
      }
      resolutionDates.value = [dateData] as any

      undoSubject(createMockRow(dateData) as any)

      expect(resolutionDates.value[0]!.new.date).toBe('2026-01-01')
      expect(resolutionDates.value[0]!.new.actions).toEqual([])
    })
  })

  describe('changePriority', () => {
    it('swaps priority between class items when moving down', () => {
      const { shareClasses, changePriority } = useManageShareStructure()

      const c1 = { new: { id: 'c1', priority: 1, series: [] } }
      const c2 = { new: { id: 'c2', priority: 2, series: [] } }
      shareClasses.value = [c1, c2] as any

      changePriority(createMockRow(c1) as any, 'down')

      expect(c1.new.priority).toBe(2)
      expect(c2.new.priority).toBe(1)
    })

    it('swaps priority between class items when moving up', () => {
      const { shareClasses, changePriority } = useManageShareStructure()

      const c1 = { new: { id: 'c1', priority: 1, series: [] } }
      const c2 = { new: { id: 'c2', priority: 2, series: [] } }
      shareClasses.value = [c1, c2] as any

      changePriority(createMockRow(c2) as any, 'up')

      expect(c1.new.priority).toBe(2)
      expect(c2.new.priority).toBe(1)
    })

    it('swaps priority between series', () => {
      const { shareClasses, changePriority } = useManageShareStructure()

      const s1 = { id: 's1', priority: 1, hasMaximumShares: true }
      const s2 = { id: 's2', priority: 2, hasMaximumShares: true }
      shareClasses.value = [{ new: { id: 'c1', series: [s1, s2] } }] as any

      const mockRow = {
        depth: 1,
        original: { new: s2 },
        getParentRow: () => ({ original: { new: { id: 'c1' } } })
      }

      changePriority(mockRow as any, 'up')

      expect(s1.priority).toBe(2)
      expect(s2.priority).toBe(1)
    })

    it('does nothing when moving top item up or bottom item down', () => {
      const { shareClasses, changePriority } = useManageShareStructure('test-bounds')

      const c1 = { new: { id: 'c1', priority: 1, series: [] } }
      const c2 = { new: { id: 'c2', priority: 2, series: [] } }
      shareClasses.value = [c1, c2] as any

      changePriority(createMockRow(c1) as any, 'up')
      expect(c1.new.priority).toBe(1)

      changePriority(createMockRow(c2) as any, 'down')
      expect(c2.new.priority).toBe(2)
    })
  })
})
