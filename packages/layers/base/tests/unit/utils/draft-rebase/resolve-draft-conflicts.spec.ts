// @vitest-environment node
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'

const party = (identifier: string | undefined, givenName: string, familyName: string, actions: string[] = []) => ({
  entity: { identifier, givenName, familyName },
  roles: [{ roleType: 'Director' }],
  actions
})

const currentClass = (id: number, name: string, series: Array<{ id: number, name: string }> = []) => ({
  id,
  name,
  priority: 1,
  hasMaximumShares: false,
  maxNumberOfShares: null,
  hasRightsOrRestrictions: series.length > 0,
  hasParValue: false,
  parValue: null,
  currency: null,
  currencyAdditional: null,
  series: series.map(s => ({ ...s, priority: 1, hasMaximumShares: false, maxNumberOfShares: null, hasRightsOrRestrictions: false }))
})

function draftFiling(body: Record<string, unknown>) {
  return {
    filing: {
      header: { name: FilingType.TRANSITION, filingId: 1, status: FilingStatus.DRAFT },
      business: { identifier: 'BC1234567' },
      transition: body
    }
  } as any
}

function report(overrides: Partial<DraftChangesReport> = {}): DraftChangesReport {
  return {
    baseTransactionId: 10,
    currentTransactionId: 12,
    upToDate: false,
    interveningFilings: [],
    businessChanges: {},
    changedSections: [],
    draftSections: [],
    conflicts: [],
    alreadyApplied: [],
    absorbed: [],
    staleIds: { parties: [], nameTranslations: [], resolutions: [], courtOrders: [] },
    ...overrides
  }
}

const conflict = (
  section: DraftChangesSection,
  entityKey: string,
  rowId: number | null,
  draftValue: Record<string, unknown> | null,
  currentValue: Record<string, unknown> | null = {}
): DraftChangeConflict => ({ section, entityKey, rowId, change: 'modified', paths: [], baseValue: null, currentValue, draftValue })

describe('resolveDraftConflicts', () => {
  describe('parties', () => {
    it('should drop the draft row the conflict names by id and flag the current row id', () => {
      const draft = draftFiling({ relationships: [party('1', 'Jane', 'Smith', ['ADDRESS_CHANGED']), party('2', 'Bob', 'Jones', ['ROLES_CHANGED'])] })
      const changes = report({ conflicts: [conflict('parties', 'SMITH, JANE', 1, party('1', 'Jane', 'Smith'))] })

      const { draftFiling: resolved, staffModified, discardedEdits } = resolveDraftConflicts(draft, FilingType.TRANSITION, changes)

      expect((resolved.filing as any).transition.relationships).toEqual([party('2', 'Bob', 'Jones', ['ROLES_CHANGED'])])
      expect(staffModified.parties).toEqual(['1'])
      expect(discardedEdits).toEqual([expect.objectContaining({ section: 'parties', entityKey: 'SMITH, JANE', alreadyApplied: false })])
      // the draft as loaded is untouched
      expect((draft.filing as any).transition.relationships).toHaveLength(2)
    })

    it('should drop an added draft row by name when the draft value has no id', () => {
      const draft = draftFiling({ relationships: [party(undefined, 'Jane', 'Smith', ['ADDED']), party('2', 'Bob', 'Jones', ['ROLES_CHANGED'])] })
      const changes = report({ alreadyApplied: [{ section: 'parties', entityKey: 'SMITH, JANE', rowId: 9, change: 'modified', draftValue: party('', 'Jane', 'Smith', ['ADDED']) }] })

      const { draftFiling: resolved, staffModified, discardedEdits } = resolveDraftConflicts(draft, FilingType.TRANSITION, changes)

      expect((resolved.filing as any).transition.relationships).toEqual([party('2', 'Bob', 'Jones', ['ROLES_CHANGED'])])
      expect(staffModified.parties).toEqual(['9'])
      expect(discardedEdits[0]!.alreadyApplied).toBe(true)
    })

    it('should pair a removal (no draft value) by the current id, then by the entity name', () => {
      const draft = draftFiling({ relationships: [party('5', 'Jane', 'Smith'), party(undefined, 'Bob', 'Jones')] })
      const changes = report({ conflicts: [
        conflict('parties', 'SMITH, JANE', 5, null),
        conflict('parties', 'JONES, BOB #3', null, null)
      ] })

      const { draftFiling: resolved } = resolveDraftConflicts(draft, FilingType.TRANSITION, changes)

      expect((resolved.filing as any).transition.relationships).toEqual([])
    })

    it('should not flag anything when the current row is gone', () => {
      const draft = draftFiling({ relationships: [party('1', 'Jane', 'Smith', ['ADDRESS_CHANGED'])] })
      const changes = report({ conflicts: [conflict('parties', 'SMITH, JANE', null, party('1', 'Jane', 'Smith'), null)] })

      const { staffModified } = resolveDraftConflicts(draft, FilingType.TRANSITION, changes)

      expect(staffModified.parties).toEqual([])
    })
  })

  describe('untagged parties', () => {
    const completingParty = (actions: string[] = []) => ({
      entity: { givenName: 'Jane', familyName: 'Smith' },
      roles: [{ roleType: 'Completing Party' }],
      actions
    })

    it('should drop rows without actions (a full roster carries base values) but keep the completing party', () => {
      const draft = draftFiling({ relationships: [party('1', 'Jane', 'Smith'), party('2', 'Bob', 'Jones', ['ADDRESS_CHANGED']), completingParty()] })

      const { draftFiling: resolved } = resolveDraftConflicts(draft, FilingType.TRANSITION, report())

      expect((resolved.filing as any).transition.relationships).toEqual([party('2', 'Bob', 'Jones', ['ADDRESS_CHANGED']), completingParty()])
    })

    it('should leave the roster alone when the report is up to date', () => {
      const draft = draftFiling({ relationships: [party('1', 'Jane', 'Smith')] })

      const { draftFiling: resolved } = resolveDraftConflicts(draft, FilingType.TRANSITION, report({ upToDate: true }))

      expect((resolved.filing as any).transition.relationships).toEqual([party('1', 'Jane', 'Smith')])
    })

    it('should not drop the completing party when a same-named added director is discarded by name', () => {
      const draft = draftFiling({ relationships: [party(undefined, 'Jane', 'Smith', ['ADDED']), completingParty(['ADDED'])] })
      const changes = report({ alreadyApplied: [{ section: 'parties', entityKey: 'SMITH, JANE', rowId: 9, change: 'modified', draftValue: party('', 'Jane', 'Smith', ['ADDED']) }] })

      const { draftFiling: resolved } = resolveDraftConflicts(draft, FilingType.TRANSITION, changes)

      expect((resolved.filing as any).transition.relationships).toEqual([completingParty(['ADDED'])])
    })
  })

  describe('offices', () => {
    it('should drop the office type and the offices key once empty', () => {
      const offices = { registeredOffice: { deliveryAddress: {} }, recordsOffice: { deliveryAddress: {} } }
      const draft = draftFiling({ offices })
      const changes = report({ conflicts: [conflict('offices', 'registeredOffice', null, offices.registeredOffice)] })

      const first = resolveDraftConflicts(draft, FilingType.TRANSITION, changes)
      expect((first.draftFiling.filing as any).transition.offices).toEqual({ recordsOffice: { deliveryAddress: {} } })
      expect(first.staffModified.offices).toEqual(['registeredOffice'])

      changes.conflicts.push(conflict('offices', 'recordsOffice', null, offices.recordsOffice))
      const second = resolveDraftConflicts(draft, FilingType.TRANSITION, changes)
      expect((second.draftFiling.filing as any).transition).not.toHaveProperty('offices')
    })
  })

  describe('share classes', () => {
    it('should substitute the current class for the conflicted draft class', () => {
      const draft = draftFiling({ shareStructure: { shareClasses: [
        { id: 1, name: 'Common Shares', maxNumberOfShares: 5, series: [] },
        { id: 2, name: 'Preferred Shares', series: [] }
      ] } })
      const current = [currentClass(1, 'Common Shares'), currentClass(2, 'Preferred Shares')]
      const changes = report({ conflicts: [conflict('shareClasses', 'COMMON SHARES', null, { id: 1, name: 'Common Shares' })] })

      const { draftFiling: resolved, staffModified } = resolveDraftConflicts(draft, FilingType.TRANSITION, changes, { shareClasses: current })

      const classes = (resolved.filing as any).transition.shareStructure.shareClasses
      expect(classes).toHaveLength(2)
      expect(classes.find((c: any) => c.id === 1)).toEqual(current[0])
      expect(staffModified.shareClasses).toEqual(['COMMON'])
    })

    it('should substitute the current class for a draft class staff renamed, paired by id', () => {
      const draft = draftFiling({ shareStructure: { shareClasses: [
        { id: 1, name: 'Common Shares', maxNumberOfShares: 5, series: [] },
        { id: 2, name: 'Preferred Shares', series: [] }
      ] } })
      const current = [currentClass(1, 'Ordinary Shares'), currentClass(2, 'Preferred Shares')]
      const changes = report({ conflicts: [conflict('shareClasses', 'ORDINARY SHARES', 1, { id: 1, name: 'Common Shares' }, current[0])] })

      const { draftFiling: resolved, staffModified } = resolveDraftConflicts(draft, FilingType.TRANSITION, changes, { shareClasses: current })

      const classes = (resolved.filing as any).transition.shareStructure.shareClasses
      expect(classes).toEqual([{ id: 2, name: 'Preferred Shares', series: [] }, current[0]])
      expect(staffModified.shareClasses).toEqual(['ORDINARY'])
    })

    it('should drop the draft class when the current business no longer has it, removing emptied keys', () => {
      const draft = draftFiling({ shareStructure: { shareClasses: [{ id: 1, name: 'Common Shares', series: [] }] }, hasProvisions: true })
      const changes = report({ conflicts: [conflict('shareClasses', 'COMMON SHARES', null, { id: 1, name: 'Common Shares' }, null)] })

      const { draftFiling: resolved } = resolveDraftConflicts(draft, FilingType.TRANSITION, changes, { shareClasses: [] })

      expect((resolved.filing as any).transition).not.toHaveProperty('shareStructure')
      expect((resolved.filing as any).transition.hasProvisions).toBe(true)
    })

    it('should re-key draft classes and series whose ids churned onto the current rows of the same name', () => {
      const draft = draftFiling({ shareStructure: { shareClasses: [
        { id: 1, name: 'Common Shares', series: [{ id: 11, name: 'Series A Shares' }, { id: 12, name: 'Series Z Shares' }] },
        { id: undefined, name: 'Brand New Shares', series: [] }
      ] } })
      const current = [currentClass(101, 'Common Shares', [{ id: 111, name: 'Series A Shares' }])]

      const { draftFiling: resolved } = resolveDraftConflicts(draft, FilingType.TRANSITION, report(), { shareClasses: current })

      const classes = (resolved.filing as any).transition.shareStructure.shareClasses
      expect(classes[0].id).toBe(101)
      expect(classes[0].series.map((s: any) => s.id)).toEqual([111, 12])
      expect(classes[1].id).toBeUndefined()
    })

    it('should leave ids alone when the draft is up to date', () => {
      const draft = draftFiling({ shareStructure: { shareClasses: [{ id: 1, name: 'Common Shares', series: [] }] } })

      const { draftFiling: resolved } = resolveDraftConflicts(
        draft, FilingType.TRANSITION, report({ upToDate: true }), { shareClasses: [currentClass(101, 'Common Shares')] }
      )

      expect((resolved.filing as any).transition.shareStructure.shareClasses[0].id).toBe(1)
    })
  })

  describe('resolutions', () => {
    it('should substitute the current resolution by date and type', () => {
      const draft = draftFiling({ shareStructure: { resolutionDates: [{ type: 'SPECIAL', date: '2026-01-05' }, { id: 2, type: 'SPECIAL', date: '2025-06-01' }] } })
      const current = [{ id: 7, type: 'SPECIAL', date: '2026-01-05' }]
      const changes = report({ alreadyApplied: [{ section: 'resolutions', entityKey: '2026-01-05 (SPECIAL)', rowId: null, change: 'modified', draftValue: { type: 'SPECIAL', date: '2026-01-05' } }] })

      const { draftFiling: resolved, staffModified } = resolveDraftConflicts(draft, FilingType.TRANSITION, changes, { resolutions: current })

      expect((resolved.filing as any).transition.shareStructure.resolutionDates).toEqual([
        { id: 2, type: 'SPECIAL', date: '2025-06-01' },
        { id: 7, type: 'SPECIAL', date: '2026-01-05' }
      ])
      expect(staffModified.resolutions).toEqual(['2026-01-05 (SPECIAL)'])
    })
  })

  describe('name translations', () => {
    it('should substitute the current translation for a conflicting draft edit', () => {
      const draft = draftFiling({ nameTranslations: [{ id: '1', name: 'Nom Un (draft)' }, { id: '2', name: 'Nom Deux' }] })
      const changes = report({ conflicts: [conflict('nameTranslations', 'NOM UN', 1, { id: '1', name: 'Nom Un (draft)' }, { id: '1', name: 'Nom Un (staff)' })] })

      const { draftFiling: resolved, staffModified } = resolveDraftConflicts(draft, FilingType.TRANSITION, changes)

      expect((resolved.filing as any).transition.nameTranslations).toEqual([{ id: '2', name: 'Nom Deux' }, { id: '1', name: 'Nom Un (staff)' }])
      expect(staffModified.nameTranslations).toEqual(['1', 'NOM UN'])
    })

    it('should restore the current translation when the draft removed one staff edited', () => {
      const draft = draftFiling({ nameTranslations: [{ id: '2', name: 'Nom Deux' }] })
      const changes = report({ conflicts: [conflict('nameTranslations', 'NOM UN', 1, null, { id: '1', name: 'Nom Un (staff)' })] })

      const { draftFiling: resolved } = resolveDraftConflicts(draft, FilingType.TRANSITION, changes)

      expect((resolved.filing as any).transition.nameTranslations).toEqual([{ id: '2', name: 'Nom Deux' }, { id: '1', name: 'Nom Un (staff)' }])
    })

    it('should drop the draft entry when staff removed the translation, clearing an emptied section', () => {
      const draft = draftFiling({ nameTranslations: [{ id: '1', name: 'Nom Un (draft)' }] })
      const changes = report({ conflicts: [conflict('nameTranslations', 'NOM UN', 1, { id: '1', name: 'Nom Un (draft)' }, null)] })

      const { draftFiling: resolved, staffModified } = resolveDraftConflicts(draft, FilingType.TRANSITION, changes)

      expect((resolved.filing as any).transition).not.toHaveProperty('nameTranslations')
      expect(staffModified.nameTranslations).toEqual(['1', 'NOM UN'])
    })

    it('should key an added translation staff also added to the current row', () => {
      const draft = draftFiling({ nameTranslations: [{ id: '2', name: 'Nom Deux' }, { name: 'Nom Trois' }] })
      const changes = report({ alreadyApplied: [{ section: 'nameTranslations', entityKey: 'NOM TROIS', rowId: 4, change: 'modified', draftValue: { name: 'Nom Trois' } }] })

      const { draftFiling: resolved, staffModified } = resolveDraftConflicts(draft, FilingType.TRANSITION, changes)

      expect((resolved.filing as any).transition.nameTranslations).toEqual([{ id: '2', name: 'Nom Deux' }, { id: '4', name: 'Nom Trois' }])
      expect(staffModified.nameTranslations).toEqual(['4', 'NOM TROIS'])
    })
  })

  describe('absorbed (rows only staff changed - badged, nothing discarded)', () => {
    const absorbed = (section: DraftChangesSection, entityKey: string, rowId: number | null, currentValue: Record<string, unknown> | null): DraftChangeAbsorbed =>
      ({ section, entityKey, rowId, change: 'modified', currentValue })

    it('should refresh and badge a share class staff edited without recording a discarded edit', () => {
      const draft = draftFiling({ shareStructure: { shareClasses: [{ id: 1, name: 'Common Shares', maxNumberOfShares: 5, series: [] }, { id: 2, name: 'Preferred Shares', series: [] }] } })
      const current = [currentClass(1, 'Common Shares'), currentClass(2, 'Preferred Shares')]
      const changes = report({ absorbed: [absorbed('shareClasses', 'COMMON SHARES', 1, { id: 1, name: 'Common Shares' })] })

      const { draftFiling: resolved, staffModified, discardedEdits } = resolveDraftConflicts(draft, FilingType.TRANSITION, changes, { shareClasses: current })

      const classes = (resolved.filing as any).transition.shareStructure.shareClasses
      expect(classes.find((c: any) => c.id === 1)).toEqual(current[0])
      expect(classes.find((c: any) => c.id === 2)).toEqual({ id: 2, name: 'Preferred Shares', series: [] })
      expect(staffModified.shareClasses).toEqual(['COMMON'])
      expect(discardedEdits).toEqual([])
    })

    it('should add a share class staff added and drop one staff removed', () => {
      const draft = draftFiling({ shareStructure: { shareClasses: [{ id: 1, name: 'Common Shares', series: [] }, { id: 2, name: 'Preferred Shares', series: [] }] } })
      const current = [currentClass(1, 'Common Shares'), currentClass(3, 'New Shares')]
      const changes = report({ absorbed: [
        absorbed('shareClasses', 'NEW SHARES', 3, { id: 3, name: 'New Shares' }),
        absorbed('shareClasses', 'PREFERRED SHARES', 2, null)
      ] })

      const { draftFiling: resolved } = resolveDraftConflicts(draft, FilingType.TRANSITION, changes, { shareClasses: current })

      expect((resolved.filing as any).transition.shareStructure.shareClasses).toEqual([{ id: 1, name: 'Common Shares', series: [] }, current[1]])
    })

    it('should add a name translation staff added so the full list does not delete it', () => {
      const draft = draftFiling({ nameTranslations: [{ id: '2', name: 'Nom Deux' }] })
      const changes = report({ absorbed: [absorbed('nameTranslations', 'NOM TROIS', 4, { id: '4', name: 'Nom Trois' })] })

      const { draftFiling: resolved, staffModified } = resolveDraftConflicts(draft, FilingType.TRANSITION, changes)

      expect((resolved.filing as any).transition.nameTranslations).toEqual([{ id: '2', name: 'Nom Deux' }, { id: '4', name: 'Nom Trois' }])
      expect(staffModified.nameTranslations).toEqual(['4', 'NOM TROIS'])
    })

    it('should drop a court order row staff changed so the current row shows through, by id then file number', () => {
      const courtOrders = [
        { id: 7, fileNumber: '12345', orderDetails: 'Draft edit', filingId: 1 },
        { fileNumber: 'NEW-1', orderDetails: 'Added', filingId: 2 }
      ]
      const changes = report({
        conflicts: [conflict('courtOrders', '12345', 7, courtOrders[0]!, { id: 7, fileNumber: '12345', orderDetails: 'Staff edit' })],
        absorbed: [absorbed('courtOrders', 'NEW-1', null, null)]
      })

      const draft = {
        filing: {
          header: { name: FilingType.CORRECTION, filingId: 1, status: FilingStatus.DRAFT },
          business: { identifier: 'BC1234567' },
          correction: { courtOrders }
        }
      } as any
      const { draftFiling: resolved, staffModified, discardedEdits } = resolveDraftConflicts(draft, FilingType.CORRECTION, changes)

      expect((resolved.filing as any).correction).not.toHaveProperty('courtOrders')
      expect(staffModified.courtOrders).toEqual(['7'])
      expect(discardedEdits).toEqual([expect.objectContaining({ section: 'courtOrders', entityKey: '12345', alreadyApplied: false })])
    })

    it('should drop an office type staff changed so the current office shows through', () => {
      const offices = { registeredOffice: { deliveryAddress: {} }, recordsOffice: { deliveryAddress: {} } }
      const changes = report({ absorbed: [absorbed('offices', 'recordsOffice', null, { deliveryAddress: {} })] })

      const { draftFiling: resolved, staffModified } = resolveDraftConflicts(draftFiling({ offices }), FilingType.TRANSITION, changes)

      expect((resolved.filing as any).transition.offices).toEqual({ registeredOffice: { deliveryAddress: {} } })
      expect(staffModified.offices).toEqual(['recordsOffice'])
    })

    it('should keep an added draft party that shares its name with the existing party staff changed', () => {
      const draft = draftFiling({ relationships: [party(undefined, 'John', 'Smith', ['ADDED'])] })
      const changes = report({ absorbed: [absorbed('parties', 'SMITH, JOHN #101', 101, party('101', 'John', 'Smith'))] })

      const { draftFiling: resolved, staffModified } = resolveDraftConflicts(draft, FilingType.TRANSITION, changes)

      expect((resolved.filing as any).transition.relationships).toEqual([party(undefined, 'John', 'Smith', ['ADDED'])])
      expect(staffModified.parties).toEqual(['101'])
    })

    it('should drop the draft party row an absorbed entry names by id and leave tagged edits alone', () => {
      const draft = draftFiling({ relationships: [party('1', 'Jane', 'Smith', ['ADDRESS_CHANGED']), party('2', 'Bob', 'Jones', ['ROLES_CHANGED'])] })
      const changes = report({ absorbed: [absorbed('parties', 'JONES, BOB', 2, party('2', 'Bob', 'Jones'))] })

      const { draftFiling: resolved, staffModified } = resolveDraftConflicts(draft, FilingType.TRANSITION, changes)

      expect((resolved.filing as any).transition.relationships).toEqual([party('1', 'Jane', 'Smith', ['ADDRESS_CHANGED'])])
      expect(staffModified.parties).toEqual(['2'])
    })
  })

  describe('business fields', () => {
    const draftFor = (name: FilingType, body: Record<string, unknown>) => ({
      filing: { header: { name, filingId: 1, status: FilingStatus.DRAFT }, business: { identifier: 'BC1234567' }, [name]: body }
    }) as any

    it('should drop a correction name edit staff overrode and badge the name', () => {
      const draft = draftFor(FilingType.CORRECTION, { nameRequest: { legalName: 'ACME LTD.', nrNumber: '' }, comment: 'typo' })
      const changes = report({ conflicts: [conflict('business', 'legalName', null, { field: 'legalName', value: 'ACME LTD.' }, { field: 'legalName', value: 'NEWCO INC.' })] })

      const { draftFiling: resolved, staffModified, discardedEdits } = resolveDraftConflicts(draft, FilingType.CORRECTION, changes)

      expect((resolved.filing as any).correction).toEqual({ comment: 'typo' })
      expect(staffModified.business).toEqual(['legalName'])
      expect(discardedEdits).toEqual([expect.objectContaining({ section: 'business', entityKey: 'legalName' })])
    })

    it('should badge a type staff altered without touching a correction draft, which cannot retype', () => {
      const draft = draftFor(FilingType.CORRECTION, { comment: 'typo' })
      const changes = report({ absorbed: [{ section: 'business', entityKey: 'legalType', rowId: null, change: 'modified', currentValue: { field: 'legalType', value: 'BEN' } }] })

      const { draftFiling: resolved, staffModified } = resolveDraftConflicts(draft, FilingType.CORRECTION, changes)

      expect((resolved.filing as any).correction).toEqual({ comment: 'typo' })
      expect(staffModified.business).toEqual(['legalType'])
    })

    it('should drop an alteration type change staff already made and keep its name request', () => {
      const draft = draftFor(FilingType.ALTERATION, { business: { identifier: 'BC1234567', legalType: 'BEN' }, nameRequest: { legalName: 'X' } })
      const changes = report({ alreadyApplied: [{ section: 'business', entityKey: 'legalType', rowId: null, change: 'modified', draftValue: { field: 'legalType', value: 'BEN' } }] })

      const { draftFiling: resolved, staffModified } = resolveDraftConflicts(draft, FilingType.ALTERATION, changes)

      expect((resolved.filing as any).alteration).toEqual({ business: { identifier: 'BC1234567' }, nameRequest: { legalName: 'X' } })
      expect(staffModified.business).toEqual(['legalType'])
    })
  })

  it('should return the draft as is when the filing body is missing', () => {
    const draft = { filing: { header: {} } } as any

    const result = resolveDraftConflicts(draft, FilingType.TRANSITION, report({ conflicts: [conflict('offices', 'registeredOffice', null, {})] }))

    expect(result.draftFiling).toBe(draft)
    expect(result.staffModified.offices).toEqual([])
  })
})
