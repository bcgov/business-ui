import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { LDFlag } from '#business/app/enums/ld-flag'
import { useFilingViewMode } from '#business/app/composables/useFilingViewMode'

const staff = ref(false)
const enabledFeatures = ref<unknown>([])
const staffDraftFilingBypassTypes = ref<unknown>([])
const mockGetFeatureFlag = vi.fn((flag: LDFlag) => flag === LDFlag.EnableNewFeature
  ? enabledFeatures
  : staffDraftFilingBypassTypes)
mockNuxtImport('useIsStaff', () => () => staff)
mockNuxtImport('useConnectLaunchDarkly', () => () => ({
  getFeatureFlag: mockGetFeatureFlag
}))

describe('useFilingViewMode', () => {
  beforeEach(() => {
    staff.value = false
    enabledFeatures.value = ['draft-rebase-checks']
    staffDraftFilingBypassTypes.value = [FilingType.AGM_LOCATION_CHANGE]
    mockGetFeatureFlag.mockClear()
  })

  it('enables view-only mode for staff viewing a public-user draft', () => {
    staff.value = true

    expect(useFilingViewMode(false, true, FilingType.AGM_LOCATION_CHANGE).value).toBe(true)
    mockGetFeatureFlag.mockClear()
    expect(useFilingViewMode(undefined, true, FilingType.AGM_LOCATION_CHANGE).value).toBe(false)
    expect(mockGetFeatureFlag).not.toHaveBeenCalled()
  })

  it('keeps staff-owned drafts editable', () => {
    staff.value = true

    expect(useFilingViewMode(true, true, FilingType.AGM_LOCATION_CHANGE).value).toBe(false)
  })

  it('keeps public users and non-draft pages editable', () => {
    expect(useFilingViewMode(false, true, FilingType.AGM_LOCATION_CHANGE).value).toBe(false)

    staff.value = true
    expect(useFilingViewMode(false, false, FilingType.AGM_LOCATION_CHANGE).value).toBe(false)
  })

  it('requires both the draft-rebase feature and filing-type allowlist flags', () => {
    staff.value = true
    const filedByStaff = false

    enabledFeatures.value = []
    expect(useFilingViewMode(filedByStaff, true, FilingType.AGM_LOCATION_CHANGE).value).toBe(false)

    enabledFeatures.value = ['draft-rebase-checks']
    staffDraftFilingBypassTypes.value = []
    expect(useFilingViewMode(filedByStaff, true, FilingType.AGM_LOCATION_CHANGE).value).toBe(false)

    staffDraftFilingBypassTypes.value = [FilingType.TRANSITION]
    expect(useFilingViewMode(filedByStaff, true, FilingType.AGM_LOCATION_CHANGE).value).toBe(false)
  })

  it('reacts when staff status or draft metadata changes', () => {
    const filedByStaff = ref<boolean | undefined>(undefined)
    const hasDraft = ref(true)
    const viewOnly = useFilingViewMode(filedByStaff, hasDraft, FilingType.AGM_LOCATION_CHANGE)

    expect(viewOnly.value).toBe(false)

    staff.value = true
    expect(viewOnly.value).toBe(false)

    filedByStaff.value = false
    expect(viewOnly.value).toBe(true)

    filedByStaff.value = true
    expect(viewOnly.value).toBe(false)

    hasDraft.value = false
    expect(viewOnly.value).toBe(false)
  })
})
