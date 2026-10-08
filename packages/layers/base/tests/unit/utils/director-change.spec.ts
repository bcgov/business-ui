/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { getPartiesMock } from '#test-mocks/parties'

// real fee/business stores are used - only the pay service boundary is mocked
const mockGetFee = vi.fn()
mockNuxtImport('useConnectPayService', () => () => ({
  getFee: mockGetFee,
  getPayAccount: vi.fn()
}))
mockNuxtImport('useConnectModal', () => () => ({
  baseModal: { open: vi.fn(), close: vi.fn() }
}))

// NB: the pay api is queried with priority/futureEffective params, so `total` includes those
// fees - addReplaceFee subtracts the portions its options don't enable
function makeFeeItem(code: string): ConnectFeeItem {
  return {
    filingFees: 20,
    filingType: 'Director change',
    filingTypeCode: code,
    futureEffectiveFees: 0,
    priorityFees: 100,
    processingFees: 0,
    serviceFees: 1.5,
    tax: { gst: 0, pst: 0 },
    total: 120
  }
}

function makeRow(overrides: {
  actions?: ActionType[]
  region?: string
  country?: string
  old?: undefined
}): TableBusinessState<PartySchema> {
  const address = {
    deliveryAddress: { region: overrides.region ?? 'BC', country: overrides.country ?? 'CA' },
    mailingAddress: { region: overrides.region ?? 'BC', country: overrides.country ?? 'CA' },
    sameAs: true
  }
  const party = {
    id: '1',
    name: { firstName: 'Test', middleName: '', lastName: 'Director', businessName: '', partyType: 'person' },
    address,
    roles: [{ roleType: RoleTypeUi.DIRECTOR, appointmentDate: '2023-01-01', cessationDate: null }],
    email: '',
    actions: overrides.actions ?? [],
    isEditing: false
  } as unknown as PartySchema
  return { new: party, old: 'old' in overrides ? undefined : party }
}

describe('director-change utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDirectorChangeManagePartiesProps', () => {
    it('should exclude effective-date editing for existing directors', () => {
      const props = getDirectorChangeManagePartiesProps()
      expect(props.allowedActions).not.toContain(ManageAllowedAction.EFFECTIVE_DATE_CHANGE)
      expect(props.allowedActions).toEqual(expect.arrayContaining([
        ManageAllowedAction.ADD,
        ManageAllowedAction.REMOVE,
        ManageAllowedAction.NAME_CHANGE,
        ManageAllowedAction.ADDRESS_CHANGE
      ]))
    })

    it('should configure the party form for a single DIRECTOR role with name-change confirmation', () => {
      const props = getDirectorChangeManagePartiesProps()
      expect(props.roleType).toBe(RoleTypeUi.DIRECTOR)
      expect(props.partyFormProps.partyNameProps.allowBusinessName).toBe(false)
      expect(props.partyFormProps.partyNameProps.requireNameChangeConfirmation).toBe(true)
      expect(props.partyFormProps.partyRoleProps.allowedRoles).toEqual([RoleTypeUi.DIRECTOR])
      expect(props.partyFormProps.partyRoleProps.roleClass).toBe(RoleClass.DIRECTOR)
      expect(props.columnsToDisplay).toContain('effectiveDates')
    })
  })

  describe('buildChangeOfDirectorsRelationships', () => {
    const partiesMock = getPartiesMock()

    function tableFromMock(): TableBusinessState<PartySchema>[] {
      return partiesMock.parties.map((p: any) => ({
        new: formatPartyUi(p, RoleType.DIRECTOR),
        old: formatPartyUi(p, RoleType.DIRECTOR)
      }))
    }

    it('should only include changed rows', () => {
      const table = tableFromMock()
      table[0]!.new.actions = [ActionType.NAME_CHANGED]

      const result = buildChangeOfDirectorsRelationships(table)

      expect(result).toHaveLength(1)
      expect(result[0]!.actions).toEqual([ActionType.NAME_CHANGED])
      expect(result[0]!.entity.identifier).toBe(table[0]!.new.id)
    })

    it('should return an empty array when nothing changed', () => {
      expect(buildChangeOfDirectorsRelationships(tableFromMock())).toEqual([])
    })

    it('should stamp the provided cessation date on removed directors', () => {
      const table = tableFromMock()
      table[0]!.new.actions = [ActionType.REMOVED]
      table[1]!.new.actions = [ActionType.ADDRESS_CHANGED]

      const result = buildChangeOfDirectorsRelationships(table, { removedCessationDate: '2026-01-15' })

      const removed = result.find(r => r.actions?.includes(ActionType.REMOVED))!
      expect(removed.roles.every(r => r.cessationDate === '2026-01-15')).toBe(true)
      const edited = result.find(r => r.actions?.includes(ActionType.ADDRESS_CHANGED))!
      expect(edited.roles.every(r => r.cessationDate !== '2026-01-15')).toBe(true)
    })

    it('should default removed directors cessation date to today', () => {
      const table = tableFromMock()
      table[0]!.new.actions = [ActionType.REMOVED]

      const result = buildChangeOfDirectorsRelationships(table)

      expect(result[0]!.roles[0]!.cessationDate).toBeTruthy()
    })
  })

  describe('getDirectorWarning', () => {
    it('should warn when below the minimum director count', () => {
      const table = [makeRow({}), makeRow({})]
      const warning = getDirectorWarning(table, { minCount: 3 })
      expect(warning?.type).toBe('minCount')
    })

    it('should not count removed directors toward the minimum', () => {
      const table = [makeRow({}), makeRow({}), makeRow({ actions: [ActionType.REMOVED] })]
      const warning = getDirectorWarning(table, { minCount: 3 })
      expect(warning?.type).toBe('minCount')
    })

    it('should warn when no director is a BC resident', () => {
      const table = [makeRow({ region: 'AB' }), makeRow({ region: 'ON' })]
      const warning = getDirectorWarning(table, { minCount: 1, bcResidency: true })
      expect(warning?.type).toBe('bcResidency')
    })

    it('should not warn when at least one director is a BC resident', () => {
      const table = [makeRow({ region: 'BC' }), makeRow({ region: 'ON' })]
      const warning = getDirectorWarning(table, { minCount: 1, bcResidency: true })
      expect(warning).toBeUndefined()
    })

    it('should warn when the majority of directors are not Canadian residents', () => {
      const table = [makeRow({ country: 'US' }), makeRow({ country: 'US' }), makeRow({})]
      const warning = getDirectorWarning(table, { minCount: 1, canadianResidency: true })
      expect(warning?.type).toBe('canadianResidency')
    })

    it('should not warn on an exact half split of Canadian residents', () => {
      const table = [makeRow({ country: 'US' }), makeRow({})]
      const warning = getDirectorWarning(table, { minCount: 1, canadianResidency: true })
      expect(warning).toBeUndefined()
    })

    it('should report the minimum count warning first', () => {
      const table = [makeRow({ region: 'AB', country: 'US' })]
      const warning = getDirectorWarning(table, { minCount: 3, bcResidency: true, canadianResidency: true })
      expect(warning?.type).toBe('minCount')
    })
  })

  describe('syncDirectorChangeFee', () => {
    const codes = { paidCode: 'OTCDR', freeCode: 'OTFDR' }
    let feeStore: ReturnType<typeof useConnectFeeStore>

    // seeds the fee cache the way initFiling's i18n hook would
    async function seedFee(code: string) {
      await feeStore.initFees(
        [{ code, entityType: 'CP', label: 'Director Change' }],
        { label: 'Director Change' }
      )
    }

    beforeEach(async () => {
      setActivePinia(createPinia())
      mockGetFee.mockImplementation(async (_entityType: string, code: string) => makeFeeItem(code))
      feeStore = useConnectFeeStore()
      const businessStore = useBusinessStore()
      businessStore.business = { legalType: 'CP' } as unknown as typeof businessStore.business
      await seedFee(codes.paidCode)
      feeStore.addReplaceFee(codes.paidCode)
    })

    it('should bill the paid code when a director is added or removed', async () => {
      await seedFee(codes.freeCode)
      const table = [makeRow({ actions: [ActionType.ADDED] }), makeRow({ actions: [ActionType.NAME_CHANGED] })]

      await syncDirectorChangeFee(table, codes)

      expect(feeStore.fees[codes.paidCode]).toBeDefined()
      expect(feeStore.fees[codes.freeCode]).toBeUndefined()
    })

    it('should bill the free code when only name/address changes exist', async () => {
      await seedFee(codes.freeCode)
      const table = [makeRow({ actions: [ActionType.NAME_CHANGED] })]

      await syncDirectorChangeFee(table, codes)

      expect(feeStore.fees[codes.freeCode]).toBeDefined()
      expect(feeStore.fees[codes.paidCode]).toBeUndefined()
    })

    it('should lazily fetch an uncached fee code before adding it', async () => {
      // only the paid code is cached (initFiling seeds the page's i18n fee code)
      expect(feeStore.feesCached[codes.freeCode]).toBeUndefined()
      const table = [makeRow({ actions: [ActionType.NAME_CHANGED] })]

      await syncDirectorChangeFee(table, codes)

      expect(mockGetFee).toHaveBeenCalledWith('CP', codes.freeCode, expect.anything())
      expect(feeStore.feesCached[codes.freeCode]?.label).toBe('Director Change')
      expect(feeStore.fees[codes.freeCode]).toBeDefined()
      expect(feeStore.fees[codes.paidCode]).toBeUndefined()
    })

    it('should not refetch fee info when the code is already cached', async () => {
      await seedFee(codes.freeCode)
      const callsBeforeSync = mockGetFee.mock.calls.length
      const table = [makeRow({ actions: [ActionType.ADDED] })]

      await syncDirectorChangeFee(table, codes)

      expect(mockGetFee.mock.calls.length).toBe(callsBeforeSync)
    })

    it('should pass fee options through to addReplaceFee', async () => {
      const table = [makeRow({ actions: [ActionType.ADDED] })]

      await syncDirectorChangeFee(table, { ...codes, feeOptions: { priority: true } })

      // priority is an addReplaceFee option spread onto the fee item, not part of ConnectFeeItem
      expect((feeStore.fees[codes.paidCode] as any)?.priority).toBe(true)
      expect(feeStore.fees[codes.paidCode]?.priorityFees).toBe(100)
      expect(feeStore.fees[codes.paidCode]?.total).toBe(120)
    })
  })
})
