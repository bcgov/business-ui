import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AlertDraftRebase } from '#components'

const report = ref<DraftChangesReport | undefined>(undefined)
mockNuxtImport('useDraftRebase', () => () => ({ report }))

function getReport(overrides: Partial<DraftChangesReport> = {}): DraftChangesReport {
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

const mount = () => mountSuspended(AlertDraftRebase, { global: { stubs: { UIcon: true } } })

describe('AlertDraftRebase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    report.value = undefined
  })

  it('renders nothing without a report or when the draft is up to date', async () => {
    let wrapper = await mount()
    expect(wrapper.find('[data-testid="draft-rebase-alert"]').exists()).toBe(false)

    report.value = getReport({ upToDate: true })
    wrapper = await mount()
    expect(wrapper.find('[data-testid="draft-rebase-alert"]').exists()).toBe(false)
  })

  it('lists what staff changed, grouped by section, with the review warning', async () => {
    report.value = getReport({
      conflicts: [{
        section: 'shareClasses', entityKey: 'A SHARES', rowId: 1, change: 'modified', paths: ['/maxNumberOfShares'],
        baseValue: {}, currentValue: {}, draftValue: {}
      }, {
        section: 'parties', entityKey: 'SMITH, JANE #4', rowId: 4, change: 'added', paths: [],
        baseValue: null, currentValue: {}, draftValue: {}
      }],
      alreadyApplied: [
        { section: 'offices', entityKey: 'registeredOffice', rowId: null, change: 'modified', draftValue: {} },
        { section: 'parties', entityKey: 'LEE, BOB', rowId: 5, change: 'removed', draftValue: {} }
      ],
      absorbed: [
        { section: 'shareClasses', entityKey: 'C SHARES', rowId: 3, change: 'removed', currentValue: null },
        { section: 'parties', entityKey: 'NG, DAN', rowId: 6, change: 'added', currentValue: {} },
        {
          section: 'business',
          entityKey: 'legalName',
          rowId: null,
          change: 'modified',
          currentValue: { field: 'legalName' }
        }
      ]
    })
    const wrapper = await mount()

    const alert = wrapper.find('[data-testid="draft-rebase-alert"]')
    expect(alert.text()).toContain('BC Registries staff have made the following modifications')
    expect(alert.text()).toContain('Carefully review the information before submitting.')
    const sectionTitles = wrapper.findAll('[data-testid^="draft-rebase-alert-"] p.font-bold').map(p => p.text())
    expect(sectionTitles).toEqual(['Business Information', 'People and Roles', 'Offices', 'Share Structure'])
    const items = (section: string) =>
      wrapper.findAll(`[data-testid="draft-rebase-alert-${section}"] li`).map(li => li.text())
    expect(items('business')).toEqual(['Legal Name modified'])
    expect(items('parties')).toEqual(['SMITH, JANE added', 'LEE, BOB deleted', 'NG, DAN added'])
    expect(items('offices')).toEqual(['Registered Office modified'])
    expect(items('shareClasses')).toEqual(['A SHARES modified', 'C SHARES deleted'])
  })

  it('shows only the warning when the draft base is unknown', async () => {
    report.value = getReport({
      upToDate: null,
      absorbed: [{ section: 'offices', entityKey: 'x', rowId: null, change: 'modified', currentValue: {} }]
    })
    const wrapper = await mount()

    const alert = wrapper.find('[data-testid="draft-rebase-alert"]')
    expect(alert.text()).toContain('could not determine')
    expect(wrapper.findAll('li')).toHaveLength(0)
  })
})
