/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const openModalMock = vi.fn()
mockNuxtImport('useModal', () => () => ({
  baseModal: { open: openModalMock }
}))

// Helper to create a dummy row for TanStack table logic
const createMockRow = (data: any, depth = 0, parentId?: string) => ({
  depth,
  original: data,
  getParentRow: () => parentId ? { original: { new: { id: parentId } } } : undefined
})

describe('useManageShareStructure', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Share Class Methods', () => {
    describe('addNewShareClass', () => {
      it('should add a new class to start of array and increment existing priorities', () => {
        const { tableState, addNewShareClass } = useManageShareStructure('test1')

        tableState.value = [{
          new: { id: 'old-1', priority: 1, series: [] },
          old: undefined
        }] as any

        const newClass = { id: 'new-2', priority: 1, series: [] }
        addNewShareClass(newClass as any)

        expect(tableState.value).toHaveLength(2)
        expect(tableState.value[0]!.new.id).toBe('new-2')
        expect(tableState.value[0]!.new.actions).toContain(ActionType.ADDED)
        expect(tableState.value[1]!.new.priority).toBe(2)
      })
    })

    describe('removeShareClass', () => {
      it('should delete from state and update other priorities if newly added (no old state)', () => {
        const { tableState, removeShareClass } = useManageShareStructure('test2')

        tableState.value = [
          { new: { id: '1', priority: 1, series: [] }, old: undefined },
          { new: { id: '2', priority: 2, series: [] }, old: undefined }
        ] as any

        const mockRow = createMockRow(tableState.value[0]) as any
        removeShareClass(mockRow)

        expect(tableState.value).toHaveLength(1)
        expect(tableState.value[0]!.new.id).toBe('2')
        expect(tableState.value[0]!.new.priority).toBe(1)
      })

      it('should add removed action if class has an old state and no series', () => {
        const { tableState, removeShareClass } = useManageShareStructure('test3')

        const rowData = {
          new: { id: '1', priority: 1, series: [], actions: [] },
          old: { id: '1', name: 'Original' }
        }
        tableState.value = [rowData] as any

        const mockRow = createMockRow(rowData) as any
        removeShareClass(mockRow)

        expect(tableState.value).toHaveLength(1)
        expect(tableState.value[0]!.new.actions).toContain(ActionType.REMOVED)
      })

      it('should trigger modal if class has series', () => {
        const { tableState, removeShareClass } = useManageShareStructure('test4')
        const rowData = {
          new: { id: '1', priority: 1, series: [{ id: 's1' }] },
          old: { id: '1' }
        }
        tableState.value = [rowData] as any

        removeShareClass(createMockRow(rowData) as any)

        expect(openModalMock).toHaveBeenCalledWith(expect.objectContaining({
          title: 'Remove Share Class with Series'
        }))
      })

      it('should only apply removal after modal confirmation when series exist', () => {
        const { tableState, removeShareClass } = useManageShareStructure('test5')

        const rowData = {
          new: { id: '1', priority: 1, series: [{ id: 's1' }] },
          old: undefined
        }
        tableState.value = [rowData] as any

        removeShareClass(createMockRow(rowData) as any)

        expect(openModalMock).toHaveBeenCalled()

        expect(tableState.value).toHaveLength(1)

        const modalConfig = openModalMock.mock.calls[0]![0]
        const removeButton = modalConfig.buttons.find((b: any) => b.label === 'Remove')

        removeButton.onClick()
        expect(tableState.value).toHaveLength(0)
      })

      it('should not remove the class if the modal is opened but Cancel is clicked', () => {
        const { tableState, removeShareClass } = useManageShareStructure('test6')
        const rowData = { new: { id: '1', priority: 1, series: [{ id: 's1' }] }, old: undefined }
        tableState.value = [rowData] as any

        removeShareClass(createMockRow(rowData) as any)

        const modalConfig = openModalMock.mock.calls[0]![0]
        const cancelButton = modalConfig.buttons.find((b: any) => b.label === 'Cancel')

        if (cancelButton.onClick) {
          cancelButton.onClick()
        }

        expect(tableState.value).toHaveLength(1)
        expect(tableState.value[0]!.new.id).toBe('1')
      })

      it('should only update priorities for rows with a priority greater than the removed row', () => {
        const { tableState, removeShareClass } = useManageShareStructure('test7')
        tableState.value = [
          { new: { id: '1', priority: 1, series: [] }, old: undefined },
          { new: { id: '2', priority: 2, series: [] }, old: undefined },
          { new: { id: '3', priority: 3, series: [] }, old: undefined }
        ] as any

        const mockRow = createMockRow(tableState.value[1]) as any
        removeShareClass(mockRow)

        expect(tableState.value).toHaveLength(2)
        expect(tableState.value.find(r => r.new.id === '1')?.new.priority).toBe(1)
        expect(tableState.value.find(r => r.new.id === '3')?.new.priority).toBe(2)
      })

      it('should call cleanupForm callback after removal', () => {
        const { tableState, removeShareClass } = useManageShareStructure('test8')
        const cleanup = vi.fn()

        const rowA = { new: { id: '1', priority: 1, series: [] }, old: undefined }
        tableState.value = [rowA] as any
        removeShareClass(createMockRow(rowA) as any, cleanup)
        expect(cleanup).toHaveBeenCalledTimes(1)

        const rowB = { new: { id: '2', priority: 1, series: [{ id: 's1' }] }, old: undefined }
        tableState.value = [rowB] as any
        removeShareClass(createMockRow(rowB) as any, cleanup)

        const modalConfig = openModalMock.mock.calls[openModalMock.mock.calls.length - 1]![0]
        modalConfig.buttons.find((b: any) => b.label === 'Remove').onClick()

        expect(cleanup).toHaveBeenCalledTimes(2)
      })
    })

    describe('undoShareClass', () => {
      it('should revert the new state to the old state', () => {
        const { tableState, undoShareClass } = useManageShareStructure('test9')

        const rowData = {
          new: { id: '1', name: 'Changed Name', priority: 1, series: [], actions: [ActionType.CHANGED] },
          old: { id: '1', name: 'Original Name', priority: 1, series: [], actions: [] }
        }
        tableState.value = [rowData] as any

        undoShareClass(createMockRow(rowData) as any)

        expect(tableState.value[0]!.new.name).toBe('Original Name')
        expect(tableState.value[0]!.new.actions).toEqual([])
      })

      it('should preserve the current priority when undoing other data', () => {
        const { tableState, undoShareClass } = useManageShareStructure('test10')

        const rowData = {
          new: { id: '1', name: 'New Name', priority: 5 },
          old: { id: '1', name: 'Old Name', priority: 1 }
        }
        tableState.value = [rowData] as any

        undoShareClass(createMockRow(rowData) as any)

        expect(tableState.value[0]!.new.name).toBe('Old Name')
        expect(tableState.value[0]!.new.priority).toBe(5)
      })
    })

    describe('updateShareClass', () => {
      it('should not update the action or state if no data was changed', () => {
        const { tableState, updateShareClass } = useManageShareStructure('test11')
        const cleanup = vi.fn()
        const rowData = {
          new: { id: '1', name: 'Class A', series: [], actions: [] },
          old: { id: '1' }
        }
        tableState.value = [rowData] as any

        updateShareClass(createMockRow(rowData) as any, rowData.new as any, cleanup)

        expect(tableState.value[0]!.new.actions).toEqual([])
        expect(cleanup).toHaveBeenCalled()
      })

      it('should add changed action for existing rows and added for new rows', () => {
        const { tableState, updateShareClass } = useManageShareStructure('test12')

        const existingRow = { new: { id: '1', name: 'Old' }, old: { id: '1' } }
        tableState.value = [existingRow] as any
        updateShareClass(createMockRow(existingRow) as any, { id: '1', name: 'New' } as any, vi.fn())
        expect(tableState.value[0]!.new.actions).toContain(ActionType.CHANGED)

        const newRow = { new: { id: '2', name: 'New' }, old: undefined }
        tableState.value = [newRow] as any
        updateShareClass(createMockRow(newRow) as any, { id: '2', name: 'Newer' } as any, vi.fn())
        expect(tableState.value[0]!.new.actions).toContain(ActionType.ADDED)
      })

      it('should ignore the series when checking for changes', () => {
        const { tableState, updateShareClass } = useManageShareStructure('test13')
        const rowData = {
          new: { id: '1', name: 'Class A', series: [], actions: [] },
          old: { id: '1' }
        }
        tableState.value = [rowData] as any

        const dataWithNewSeries = { ...rowData.new, series: [{ id: 'new-s' }] }
        updateShareClass(createMockRow(rowData) as any, dataWithNewSeries as any, vi.fn())

        expect(tableState.value[0]!.new.actions).toEqual([])
      })

      it('should trigger modal and invalidate series when maxShares changes', () => {
        const { tableState, updateShareClass } = useManageShareStructure('test14')
        const cleanup = vi.fn()
        const rowData = {
          new: {
            id: '1',
            maxNumberOfShares: 100,
            hasRightsOrRestrictions: true,
            series: [{ id: 's1', actions: [] }]
          },
          old: { id: '1' }
        }
        tableState.value = [rowData] as any

        const updatedData = { ...rowData.new, maxNumberOfShares: 200 }
        updateShareClass(createMockRow(rowData) as any, updatedData as any, cleanup)

        expect(openModalMock).toHaveBeenCalledWith(expect.objectContaining({
          title: 'Remove Share Series'
        }))

        const modalConfig = openModalMock.mock.calls[0]![0]
        modalConfig.buttons.find((b: any) => b.label === 'Remove Series').onClick()

        const series = tableState.value[0]!.new.series[0]
        expect(series!.actions).toContain(ActionType.REMOVED)
        expect(series!.isInvalid).toBe(true)
        expect(cleanup).toHaveBeenCalled()
      })

      it('should not trigger modal if maxShares changes but no series exist', () => {
        const { tableState, updateShareClass } = useManageShareStructure('test15')
        const cleanup = vi.fn()

        const rowData = {
          new: {
            id: '1',
            maxNumberOfShares: 100,
            series: []
          },
          old: { id: '1' }
        }
        tableState.value = [rowData] as any

        const updatedData = { ...rowData.new, maxNumberOfShares: 200 }
        updateShareClass(createMockRow(rowData) as any, updatedData as any, cleanup)

        expect(openModalMock).not.toHaveBeenCalled()
        expect(cleanup).toHaveBeenCalled()
      })
    })
  })

  describe('Share Series Methods', () => {
    describe('addNewShareSeries', () => {
      it('should add a new series and increment priority of existing ones', () => {
        const { tableState, addNewShareSeries } = useManageShareStructure('test16')

        const existingSeries = { id: 's1', priority: 1, actions: [] }
        const rowData = {
          original: { new: { id: 'class-1' } },
          new: {
            id: 'class-1',
            series: [existingSeries]
          }
        }
        tableState.value = [rowData] as any

        const newSeries = { id: 's2', priority: 1 }

        addNewShareSeries(rowData as any, newSeries as any)

        const seriesArray = tableState.value[0]!.new.series

        expect(seriesArray[0]!.id).toBe('s2')
        expect(seriesArray[0]!.actions).toContain(ActionType.ADDED)

        expect(seriesArray[1]!.id).toBe('s1')
        expect(seriesArray[1]!.priority).toBe(2)
      })
    })

    describe('updateShareSeries', () => {
      it('should not update if no changes', () => {
        const { tableState, updateShareSeries } = useManageShareStructure('test17')

        const existingSeries = { id: 's1', name: 'Series A', actions: [] }
        tableState.value = [{
          new: { id: 'parent-1', series: [existingSeries] }
        }] as any

        const rowMock = {
          original: { new: { id: 's1' } },
          getParentRow: () => ({ original: { new: { id: 'parent-1' } } })
        }

        updateShareSeries(rowMock as any, { ...existingSeries } as any)
        expect(tableState.value[0]!.new.series[0]!.actions).toEqual([])
      })

      it('should add the changed action if edits were made to an existing series', () => {
        const { tableState, updateShareSeries } = useManageShareStructure('test18')

        const existingSeries = { id: 's1', name: 'Original Name', actions: [] }
        tableState.value = [{
          new: { id: 'parent-1', series: [existingSeries] }
        }] as any

        const rowMock = {
          original: {
            new: { id: 's1' },
            old: { id: 's1' }
          },
          getParentRow: () => ({
            original: { new: { id: 'parent-1' } }
          })
        }

        const updatedSeries = { id: 's1', name: 'Updated Name' }

        updateShareSeries(rowMock as any, updatedSeries as any)

        const resultSeries = tableState.value[0]!.new.series[0]
        expect(resultSeries!.name).toBe('Updated Name')
        expect(resultSeries!.actions).toContain(ActionType.CHANGED)
        expect(resultSeries!.actions).not.toContain(ActionType.ADDED)
      })

      it('should maintain the ADDED action if edits are made to a series with no old state', () => {
        const { tableState, updateShareSeries } = useManageShareStructure('test19')

        const draftSeries = {
          id: 's-new-123',
          name: 'Draft Series',
          actions: [ActionType.ADDED]
        }

        tableState.value = [{
          new: { id: 'parent-1', series: [draftSeries] }
        }] as any

        const rowMock = {
          original: {
            new: { id: 's-new-123' },
            old: undefined
          },
          getParentRow: () => ({
            original: { new: { id: 'parent-1' } }
          })
        }

        const updatedSeriesData = { id: 's-new-123', name: 'Renamed Draft Series' }

        updateShareSeries(rowMock as any, updatedSeriesData as any)

        const resultSeries = tableState.value[0]!.new.series[0]
        expect(resultSeries!.name).toBe('Renamed Draft Series')

        expect(resultSeries!.actions).toEqual([ActionType.ADDED])
        expect(resultSeries!.actions).not.toContain(ActionType.CHANGED)
      })
    })

    describe('undoShareSeries', () => {
      it('should revert series data to old state but keep current priority', () => {
        const { tableState, undoShareSeries } = useManageShareStructure('test20')

        const oldState = { id: 's1', name: 'Original Name', priority: 1 }
        const currentState = { id: 's1', name: 'Edited Name', priority: 5 }

        tableState.value = [{
          new: { id: 'p1', series: [currentState] }
        }] as any

        const rowMock = {
          original: {
            new: currentState,
            old: oldState
          },
          getParentRow: () => ({ original: { new: { id: 'p1' } } })
        }

        undoShareSeries(rowMock as any)

        const result = tableState.value[0]!.new.series[0]!
        expect(result.name).toBe('Original Name')
        expect(result.priority).toBe(5)
      })
    })

    describe('removeShareSeries', () => {
      it('should fully remove a new series and update other priorities', () => {
        const { tableState, removeShareSeries } = useManageShareStructure('test21')

        const s1 = { id: 's1', priority: 1 }
        const s2 = { id: 's2', priority: 2 }
        const s3 = { id: 's3', priority: 3 }

        tableState.value = [{
          new: { id: 'p1', series: [s1, s2, s3] }
        }] as any

        const rowMock = {
          original: { new: s2, old: undefined },
          getParentRow: () => ({ original: { new: { id: 'p1' } } })
        }

        removeShareSeries(rowMock as any)

        const finalSeries = tableState.value[0]!.new.series

        expect(finalSeries.length).toBe(2)
        expect(finalSeries.find(s => s.id === 's2')).toBeUndefined()

        expect(finalSeries.find(s => s.id === 's1')!.priority).toBe(1)
        expect(finalSeries.find(s => s.id === 's3')!.priority).toBe(2)
      })

      it('should add removed action when removing an existing series', () => {
        const { tableState, removeShareSeries } = useManageShareStructure('test22')

        const existingSeries = { id: 's1', priority: 1, actions: [] }
        tableState.value = [{
          new: { id: 'p1', series: [existingSeries] }
        }] as any

        const rowMock = {
          original: {
            new: existingSeries,
            old: { id: 's1' }
          },
          getParentRow: () => ({ original: { new: { id: 'p1' } } })
        }

        removeShareSeries(rowMock as any)

        const result = tableState.value[0]!.new.series[0]!
        expect(result.id).toBe('s1')
        expect(result.actions).toContain(ActionType.REMOVED)
      })
    })
  })

  describe('changePriority', () => {
    it('class - should swap priority with the nearest item below when moving down', () => {
      const { tableState, changePriority } = useManageShareStructure('test23')

      const class1 = { new: { id: 'c1', priority: 1 } }
      const class2 = { new: { id: 'c2', priority: 2 } }
      tableState.value = [class1, class2] as any

      const rowMock = {
        depth: 0,
        original: class1,
        getParentRow: () => undefined
      }

      changePriority(rowMock as any, 'down')

      expect(class1.new.priority).toBe(2)
      expect(class2.new.priority).toBe(1)
    })

    it('class - should swap priority with the nearest item above when moving up', () => {
      const { tableState, changePriority } = useManageShareStructure('test24')

      const class1 = { new: { id: 'c1', priority: 1 } }
      const class2 = { new: { id: 'c2', priority: 2 } }
      tableState.value = [class1, class2] as any

      const rowMock = {
        depth: 0,
        original: class2,
        getParentRow: () => undefined
      }

      changePriority(rowMock as any, 'up')

      expect(class1.new.priority).toBe(2)
      expect(class2.new.priority).toBe(1)
    })

    it('series - should swap priority with the nearest item above when moving up', () => {
      const { tableState, changePriority } = useManageShareStructure('test24')

      const s1 = { id: 's1', priority: 1 }
      const s2 = { id: 's2', priority: 2 }
      const s3 = { id: 's3', priority: 3 }

      tableState.value = [{
        new: { id: 'p1', series: [s1, s2, s3] }
      }] as any

      const rowMock = {
        depth: 1,
        original: { new: s3 },
        getParentRow: () => ({ original: { new: { id: 'p1' } } })
      }

      changePriority(rowMock as any, 'up')

      expect(s3.priority).toBe(2)
      expect(s2.priority).toBe(3)
      expect(s1.priority).toBe(1)
    })

    it('series - should swap priority with the nearest item below when moving down', () => {
      const { tableState, changePriority } = useManageShareStructure('test25')

      const s1 = { id: 's1', priority: 1 }
      const s2 = { id: 's2', priority: 2 }
      const s3 = { id: 's3', priority: 3 }

      tableState.value = [{
        new: { id: 'p1', series: [s1, s2, s3] }
      }] as any

      const rowMock = {
        depth: 1,
        original: { new: s2 },
        getParentRow: () => ({ original: { new: { id: 'p1' } } })
      }

      changePriority(rowMock as any, 'down')

      expect(s3.priority).toBe(2)
      expect(s2.priority).toBe(3)
      expect(s1.priority).toBe(1)
    })
  })
})
