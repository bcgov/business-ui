import { describe, it, expect, afterEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { VueWrapper } from '@vue/test-utils'
import { TableAuthorizedAccounts } from '#components'
import { enI18n } from '~~/tests/mocks/i18n'

const accounts = [
  { name: 'ABC LLP', uuid: 'uuid-1', dateAdded: '2026-01-22T18:30:00+00:00' },
  { name: 'James Smith', uuid: 'uuid-2', dateAdded: '2024-01-02T18:30:00+00:00' }
]

function mountComp (props: any = { accounts, loading: false, error: false }) {
  return mountSuspended(TableAuthorizedAccounts, { props, global: { plugins: [enI18n] } })
}

function getT (key: string, named?: Record<string, unknown>) {
  return enI18n.global.t(key, named ?? {})
}

describe('<TableAuthorizedAccounts />', () => {
  let wrapper: VueWrapper

  afterEach(() => {
    wrapper?.unmount()
  })

  it('renders the headers, the account count and a row per account', async () => {
    wrapper = await mountComp()
    const text = wrapper.text()

    expect(text).toContain(getT('table.authorizedAccounts.columns.accountName'))
    expect(text).toContain(getT('table.authorizedAccounts.columns.dateAdded'))
    expect(text).toContain(getT('table.authorizedAccounts.title', { count: 2 }))
    expect(text).toContain('ABC LLP')
    expect(text).toContain('James Smith')
  })

  it('formats dateAdded as a plain date', async () => {
    wrapper = await mountComp()

    expect(wrapper.text()).toContain('2026-01-22')
    expect(wrapper.text()).toContain('2024-01-02')
  })

  it('labels an account without a branch by name alone', async () => {
    wrapper = await mountComp({
      accounts: [{ name: 'ABC LLP', uuid: 'uuid-1', dateAdded: '2026-01-22T18:30:00+00:00', branchName: '' }],
      loading: false,
      error: false
    })

    // toContain('ABC LLP') would also pass on a dangling 'ABC LLP - ', so assert the separator is absent.
    expect(wrapper.text()).not.toContain('ABC LLP -')
  })

  it('appends the branch name when the account has one', async () => {
    wrapper = await mountComp({
      accounts: [{ name: 'ABC LLP', uuid: 'uuid-1', dateAdded: '2026-01-22T18:30:00+00:00', branchName: 'Victoria Branch' }],
      loading: false,
      error: false
    })

    expect(wrapper.text()).toContain('ABC LLP - Victoria Branch')
  })

  it('uses a building icon for a business account and a person icon otherwise', async () => {
    wrapper = await mountComp({
      accounts: [
        { name: 'ABC LLP', uuid: 'uuid-1', dateAdded: '2026-01-22T18:30:00+00:00', isBusinessAccount: true },
        { name: 'James Smith', uuid: 'uuid-2', dateAdded: '2024-01-02T18:30:00+00:00', isBusinessAccount: false }
      ],
      loading: false,
      error: false
    })

    // UIcon renders the name with a colon, e.g. class="iconify i-mdi:domain".
    const icons = wrapper.findAll('span.iconify')
    expect(icons[0]?.classes()).toContain('i-mdi:domain')
    expect(icons[1]?.classes()).toContain('i-mdi:account-outline')
  })

  it('falls back to the person icon when isBusinessAccount is missing', async () => {
    wrapper = await mountComp({
      accounts: [{ name: 'James Smith', uuid: 'uuid-1', dateAdded: '2024-01-02T18:30:00+00:00' }],
      loading: false,
      error: false
    })

    expect(wrapper.findAll('span.iconify')[0]?.classes()).toContain('i-mdi:account-outline')
  })

  it('shows the empty message when there are no accounts', async () => {
    wrapper = await mountComp({ accounts: [], loading: false, error: false })

    expect(wrapper.text()).toContain(getT('table.authorizedAccounts.empty'))
  })

  it('shows the error message instead of the empty message when loading failed', async () => {
    wrapper = await mountComp({ accounts: [], loading: false, error: true })

    expect(wrapper.text()).toContain(getT('table.authorizedAccounts.error'))
    expect(wrapper.text()).not.toContain(getT('table.authorizedAccounts.empty'))
  })
})
