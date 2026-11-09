import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import { LDFlag } from '#business/app/enums/ld-flag'
import { useFilingPageWatcher } from '#business/app/composables/useFilingPageWatcher'

const { mockSetButtonControl, mockSetSessionExpired, mockSetBreadcrumbs } = vi.hoisted(() => ({
  mockSetButtonControl: vi.fn(),
  mockSetSessionExpired: vi.fn(),
  mockSetBreadcrumbs: vi.fn()
}))
const staff = ref(false)

mockNuxtImport('useNuxtApp', async (original) => {
  const { createI18n } = await import('vue-i18n')
  const i18n = createI18n({
    legacy: false,
    locale: 'en-CA',
    messages: { 'en-CA': {}, 'fr-CA': {} },
    missing: (_, key) => key
  })

  return () => ({
    ...(typeof original === 'function' ? original() : {}),
    $i18n: i18n.global
  })
})
mockNuxtImport('useConnectAccountStore', () => () => ({ currentAccount: { id: 'account-1' } }))
mockNuxtImport('useConnectButtonControl', () => () => ({ setButtonControl: mockSetButtonControl }))
mockNuxtImport('useIsStaff', () => () => staff)
mockNuxtImport('useConnectLaunchDarkly', () => () => ({
  getFeatureFlag: (flag: LDFlag) => ({
    value: flag === LDFlag.EnableNewFeature
      ? ['draft-rebase-checks']
      : flag === LDFlag.EnableStaffDraftFilingBypass
        ? [FilingType.TRANSITION, FilingType.AGM_LOCATION_CHANGE]
        : []
  })
}))
mockNuxtImport('setOnBeforeSessionExpired', () => mockSetSessionExpired)
mockNuxtImport('setBreadcrumbs', () => mockSetBreadcrumbs)

const store = {
  init: vi.fn().mockResolvedValue(undefined)
}

function waitForWatcher() {
  return new Promise(resolve => setTimeout(resolve, 10))
}

describe('useFilingPageWatcher view-only mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    store.init.mockResolvedValue(undefined)
    staff.value = false
  })

  it('detects staff reviewing a public-user draft, opens the last step, and blocks navigation', async () => {
    staff.value = true
    let result!: ReturnType<typeof useFilingPageWatcher>
    const scope = effectScope()
    scope.run(() => {
      result = useFilingPageWatcher({
        store,
        businessId: 'BC1234567',
        filingType: FilingType.TRANSITION,
        draftId: '123',
        filedByStaff: false,
        saveFiling: { onClick: () => {} },
        cancelFiling: { onClick: () => {} },
        submitFiling: { onClick: () => {} },
        viewOnlyBackButton: { onClick: () => {} },
        steps: [{}, {}],
        breadcrumbs: ref([]),
        setOnBeforeSessionExpired: vi.fn()
      })
    })

    await waitForWatcher()
    await nextTick()

    expect(result.currentStep.value).toBe(2)
    expect(result.viewOnly.value).toBe(true)
    expect(mockSetButtonControl).toHaveBeenLastCalledWith({
      leftGroup: {
        stacked: false,
        buttons: [{
          label: 'label.back',
          variant: 'outline',
          icon: 'i-mdi-chevron-left',
          onClick: expect.any(Function)
        }]
      },
      rightGroup: { stacked: false, buttons: [] }
    })

    result.previousStep()
    result.nextStep()
    expect(result.currentStep.value).toBe(2)
    expect(store.init).toHaveBeenCalledWith('BC1234567', '123')

    scope.stop()
  })

  it('restores normal filing actions when the draft is identified as staff-filed', async () => {
    staff.value = true
    const filedByStaff = ref(false)
    let result!: ReturnType<typeof useFilingPageWatcher>
    const scope = effectScope()
    scope.run(() => {
      result = useFilingPageWatcher({
        store,
        businessId: 'BC1234567',
        filingType: FilingType.AGM_LOCATION_CHANGE,
        draftId: '123',
        filedByStaff,
        saveFiling: { onClick: () => {} },
        cancelFiling: { onClick: () => {} },
        submitFiling: { onClick: () => {} },
        viewOnlyBackButton: { onClick: () => {} },
        steps: [{}, {}],
        breadcrumbs: ref([]),
        setOnBeforeSessionExpired: vi.fn()
      })
    })

    await waitForWatcher()
    filedByStaff.value = true
    await nextTick()
    await waitForWatcher()

    expect(result.currentStep.value).toBe(1)
    expect(result.viewOnly.value).toBe(false)
    expect(mockSetButtonControl).toHaveBeenLastCalledWith(expect.objectContaining({
      rightGroup: expect.objectContaining({
        buttons: expect.arrayContaining([
          expect.objectContaining({ onClick: expect.any(Function) }),
          expect.objectContaining({ onClick: expect.any(Function) })
        ])
      })
    }))

    scope.stop()
  })
})
