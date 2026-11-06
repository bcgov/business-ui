import { beforeEach, describe, expect, it } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { useFilingViewMode } from '#business/app/composables/useFilingViewMode'

const staff = ref(false)
mockNuxtImport('useIsStaff', () => () => staff)

describe('useFilingViewMode', () => {
  beforeEach(() => {
    staff.value = false
  })

  it('enables view-only mode for staff viewing a public-user draft', () => {
    staff.value = true

    expect(useFilingViewMode(false, true).value).toBe(true)
    expect(useFilingViewMode(undefined, true).value).toBe(true)
  })

  it('keeps staff-owned drafts editable', () => {
    staff.value = true

    expect(useFilingViewMode(true, true).value).toBe(false)
  })

  it('keeps public users and non-draft pages editable', () => {
    expect(useFilingViewMode(false, true).value).toBe(false)

    staff.value = true
    expect(useFilingViewMode(false, false).value).toBe(false)
  })

  it('reacts when staff status or draft metadata changes', () => {
    const filedByStaff = ref<boolean | undefined>(undefined)
    const hasDraft = ref(true)
    const viewOnly = useFilingViewMode(filedByStaff, hasDraft)

    expect(viewOnly.value).toBe(false)

    staff.value = true
    expect(viewOnly.value).toBe(true)

    filedByStaff.value = true
    expect(viewOnly.value).toBe(false)

    filedByStaff.value = false
    hasDraft.value = false
    expect(viewOnly.value).toBe(false)
  })
})
