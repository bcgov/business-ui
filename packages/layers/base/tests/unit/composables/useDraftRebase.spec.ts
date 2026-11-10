/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const mockBusinessService = {
  getFilingChanges: vi.fn(),
  getResolutions: vi.fn()
}
mockNuxtImport('useBusinessService', () => () => mockBusinessService)

const businessId = 'BC1234567'
const draftId = 55

const party = (identifier: string, familyName: string, actions: string[] = []) => ({
  entity: { identifier, givenName: 'Jane', familyName },
  roles: [{ roleType: 'Director' }],
  actions
})

const draft = {
  filing: {
    header: { name: FilingType.TRANSITION, filingId: draftId, status: FilingStatus.DRAFT },
    business: { identifier: businessId },
    transition: {
      relationships: [party('1', 'Smith', ['ADDRESS_CHANGED']), party('2', 'Jones', ['ROLES_CHANGED'])],
      shareStructure: { resolutionDates: [{ type: 'SPECIAL', date: '2026-01-05' }] }
    }
  }
} as any

function report(overrides: Partial<DraftChangesReport> = {}): DraftChangesReport {
  return {
    baseTransactionId: 10,
    currentTransactionId: 12,
    upToDate: false,
    interveningFilings: [],
    businessChanges: {},
    changedSections: ['parties'],
    draftSections: ['parties'],
    conflicts: [{
      section: 'parties',
      entityKey: 'SMITH, JANE',
      rowId: 1,
      paths: ['/deliveryAddress/addressCity'],
      baseValue: {},
      currentValue: {},
      draftValue: party('1', 'Smith', ['ADDRESS_CHANGED'])
    }],
    alreadyApplied: [],
    absorbed: [],
    staleIds: { parties: [], nameTranslations: [], resolutions: [] },
    ...overrides
  }
}

describe('useDraftRebase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useDraftRebase().$reset()
    mockBusinessService.getFilingChanges.mockResolvedValue(report())
    mockBusinessService.getResolutions.mockResolvedValue([{ id: 7, type: 'SPECIAL', date: '2026-01-05' }])
  })

  describe('resolveDraftFiling', () => {
    it('should keep the draft and record the base when it is up to date', async () => {
      mockBusinessService.getFilingChanges.mockResolvedValue(report({ upToDate: true, conflicts: [] }))
      const rebase = useDraftRebase()

      const result = await rebase.resolveDraftFiling(businessId, draftId, draft, FilingType.TRANSITION)

      expect(mockBusinessService.getFilingChanges).toHaveBeenCalledWith(businessId, draftId)
      expect(result).toBe(draft)
      expect(rebase.report.value?.upToDate).toBe(true)
      expect(rebase.getSaveOptions()).toEqual({ baseTransactionId: 12 })
      expect(rebase.staffModified.value.parties).toEqual([])
    })

    it('should resolve the conflicts staff-wins and keep the discarded edits', async () => {
      const rebase = useDraftRebase()

      const result = await rebase.resolveDraftFiling(businessId, draftId, draft, FilingType.TRANSITION)

      expect((result.filing as any).transition.relationships).toEqual([party('2', 'Jones', ['ROLES_CHANGED'])])
      expect(rebase.staffModified.value.parties).toEqual(['1'])
      expect(rebase.discardedEdits.value).toHaveLength(1)
      expect(rebase.getSaveOptions()).toEqual({ baseTransactionId: 12 })
      // no resolution entry - the current resolutions are not needed
      expect(mockBusinessService.getResolutions).not.toHaveBeenCalled()
    })

    it('should fetch the current resolutions when the report names one', async () => {
      mockBusinessService.getFilingChanges.mockResolvedValue(report({
        conflicts: [],
        alreadyApplied: [{
          section: 'resolutions', entityKey: '2026-01-05 (SPECIAL)', rowId: null, draftValue: { type: 'SPECIAL', date: '2026-01-05' }
        }]
      }))
      const rebase = useDraftRebase()

      const result = await rebase.resolveDraftFiling(businessId, draftId, draft, FilingType.TRANSITION)

      expect(mockBusinessService.getResolutions).toHaveBeenCalledWith(businessId, false, true)
      expect((result.filing as any).transition.shareStructure.resolutionDates).toEqual([{ id: 7, type: 'SPECIAL', date: '2026-01-05' }])
      expect(rebase.staffModified.value.resolutions).toEqual(['2026-01-05 (SPECIAL)'])
    })

    it('should fetch the current resolutions when an absorbed entry names one', async () => {
      mockBusinessService.getFilingChanges.mockResolvedValue(report({
        conflicts: [],
        absorbed: [{ section: 'resolutions', entityKey: '2026-01-05 (SPECIAL)', rowId: 7, currentValue: { id: 7, type: 'SPECIAL', date: '2026-01-05' } }]
      }))
      mockBusinessService.getResolutions.mockResolvedValue([{ id: 7, type: 'SPECIAL', date: '2026-01-05' }])
      const rebase = useDraftRebase()

      const result = await rebase.resolveDraftFiling(businessId, draftId, draft, FilingType.TRANSITION)

      expect(mockBusinessService.getResolutions).toHaveBeenCalledWith(businessId, false, true)
      expect((result.filing as any).transition.shareStructure.resolutionDates).toEqual([{ id: 7, type: 'SPECIAL', date: '2026-01-05' }])
      expect(rebase.staffModified.value.resolutions).toEqual(['2026-01-05 (SPECIAL)'])
    })

    it('should keep no base when the report could not tell (upToDate null)', async () => {
      mockBusinessService.getFilingChanges.mockResolvedValue(report({ upToDate: null, baseTransactionId: null, conflicts: [] }))
      const rebase = useDraftRebase()

      await rebase.resolveDraftFiling(businessId, draftId, draft, FilingType.TRANSITION)

      expect(rebase.report.value?.upToDate).toBeNull()
      expect(rebase.getSaveOptions()).toBeUndefined()
    })

    it('should resume the draft as saved and clear the state when the report fails', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mockBusinessService.getFilingChanges.mockRejectedValue(new Error('boom'))
      const rebase = useDraftRebase()

      const result = await rebase.resolveDraftFiling(businessId, draftId, draft, FilingType.TRANSITION)

      expect(result).toBe(draft)
      expect(rebase.report.value).toBeUndefined()
      expect(rebase.getSaveOptions()).toBeUndefined()
      expect(warn).toHaveBeenCalled()
      warn.mockRestore()
    })
  })

  describe('markStaffModified', () => {
    beforeEach(() => {
      useDraftRebase().staffModified.value = {
        business: [],
        parties: ['1'],
        offices: [OfficeType.REGISTERED],
        shareClasses: ['COMMON'],
        nameTranslations: ['3', 'NOM'],
        resolutions: ['2026-01-05 (SPECIAL)']
      }
    })

    it('should tag the rows each section keys to and leave the rest alone', () => {
      const { markStaffModified } = useDraftRebase()

      const parties = markStaffModified([{ new: { id: '1' } }, { new: { id: '2' } }] as any, 'parties')
      expect(parties.map((row: any) => row.modifiedByStaff)).toEqual([true, undefined])

      const offices = markStaffModified(
        [{ new: { type: OfficeType.REGISTERED } }, { new: { type: OfficeType.RECORDS } }] as any, 'offices'
      )
      expect(offices.map((row: any) => row.modifiedByStaff)).toEqual([true, undefined])

      const classes = markStaffModified([{ new: { name: 'Common' } }, { new: { name: 'Preferred' } }] as any, 'shareClasses')
      expect(classes.map((row: any) => row.modifiedByStaff)).toEqual([true, undefined])

      const translations = markStaffModified(
        [{ new: { id: '3', name: 'x' } }, { new: { id: 'uuid', name: 'nom' } }, { new: { id: '9', name: 'y' } }] as any,
        'nameTranslations'
      )
      expect(translations.map((row: any) => row.modifiedByStaff)).toEqual([true, true, undefined])

      const resolutions = markStaffModified(
        [{ new: { date: '2026-01-05', type: 'SPECIAL' } }, { new: { date: '2025-01-05', type: 'SPECIAL' } }] as any,
        'resolutions'
      )
      expect(resolutions.map((row: any) => row.modifiedByStaff)).toEqual([true, undefined])
    })

    it('should pass undefined rows through', () => {
      expect(useDraftRebase().markStaffModified(undefined, 'parties')).toBeUndefined()
    })
  })

  describe('markStaffModifiedBusiness', () => {
    it('should flag the your-company fields the report named on both sides so undo keeps the badge', () => {
      const rebase = useDraftRebase()
      rebase.staffModified.value = { parties: [], offices: [], shareClasses: [], nameTranslations: [], resolutions: [], business: ['legalName'] }
      const state = formatYourCompanySection({ legalName: 'NEWCO INC.', legalType: 'BC' } as any)

      rebase.markStaffModifiedBusiness(state)

      expect(state.new.nameRequest!.modifiedByStaff).toBe(true)
      expect(state.old.nameRequest!.modifiedByStaff).toBe(true)
      expect(state.new.legalType.modifiedByStaff).toBeUndefined()
    })
  })

  describe('getSaveOptions', () => {
    it('should drop the base once a save found it stale', () => {
      const rebase = useDraftRebase()
      rebase.baseTransactionId.value = 12
      expect(rebase.getSaveOptions()).toEqual({ baseTransactionId: 12 })

      rebase.markStaleOnSave()
      expect(rebase.getSaveOptions()).toBeUndefined()
      // a submission keeps the stale base so the API rejects it instead of filing the stale form
      expect(rebase.getSaveOptions(true)).toEqual({ baseTransactionId: 12 })

      rebase.$reset()
      expect(rebase.staleOnSave.value).toBe(false)
      expect(rebase.baseTransactionId.value).toBeUndefined()
    })
  })
})
