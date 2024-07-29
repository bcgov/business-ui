import { describe, expect, it, beforeEach, vi } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { useAccountStore } from '#imports'
import { mockedOrgs, mockNewAccount } from '~/tests/mocks/mockedData'

const fakeApiCall = vi.fn()

registerEndpoint('/user/accounts', {
  method: 'GET',
  handler: () => (
    mockedOrgs
  )
})

registerEndpoint('/accounts', {
  method: 'GET',
  handler: fakeApiCall
})

registerEndpoint('/user/accounts', {
  method: 'POST',
  handler: () => (mockNewAccount)
})

describe('Account Store Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('inits the store with empty values', () => {
    const accountStore = useAccountStore()

    expect(accountStore.currentAccount).toEqual({})
    expect(accountStore.userAccounts).toEqual([])
  })

  it('fetches and assigns userAccounts', async () => {
    const accountStore = useAccountStore()
    // get user accounts
    const accounts = await accountStore.getUserAccounts()

    // assert
    expect(accounts?.orgs.length).toEqual(3)
    // assigns user accounts in the onResponse of the getUserAccounts
    expect(accountStore.userAccounts.length).toEqual(3)
  })

  it('can set the current account value', () => {
    const accountStore = useAccountStore()
    // assign user accounts
    accountStore.userAccounts = mockedOrgs.orgs

    // set current account
    accountStore.selectUserAccount(1)
    expect(accountStore.currentAccount.name).toEqual('Name1')
    accountStore.selectUserAccount(2)
    expect(accountStore.currentAccount.name).toEqual('Name2')
  })

  it('can create and set the current account', async () => {
    const accountStore = useAccountStore()
    const newAccount = {
      accountName: 'Mock New Account',
      contact: {
        phone: '1234567890',
        email: 'test@email.com',
        phoneExt: undefined
      }
    }

    // create new account, it assigns the store current account to returned new account in the response
    await accountStore.createNewAccount(newAccount)
    expect(accountStore.currentAccount.name).toEqual(mockNewAccount.name)
  })

  describe('isAccountNameAvailable', () => {
    it('returns false if orgs is greater than 0', async () => {
      fakeApiCall.mockImplementation(() => mockedOrgs)
      const accountStore = useAccountStore()
      const accountAvailable = await accountStore.isAccountNameAvailable('some name')
      expect(accountAvailable).toBe(false)
    })

    it('returns true if orgs === 0', async () => {
      fakeApiCall.mockImplementation(() => { return { orgs: [] } })
      const accountStore = useAccountStore()
      const accountAvailable = await accountStore.isAccountNameAvailable('some name')
      expect(accountAvailable).toBe(true)
    })
  })

  describe('findAvailableAccountName', () => {
    it('should return a string with the given username and an increment of 10 when no orgs exist with that name', async () => {
      fakeApiCall.mockImplementation(() => { return { orgs: [] } })
      const accountStore = useAccountStore()
      const newName = await accountStore.findAvailableAccountName('Test Name')

      expect(newName).toBe('Test Name10')
    })
  })

  it('can reset the store back to default values', () => {
    const accountStore = useAccountStore()
    accountStore.currentAccount = mockedOrgs.orgs[0]
    accountStore.userAccounts = mockedOrgs.orgs

    // check store has values
    expect(accountStore.userAccounts.length).toEqual(3)
    expect(accountStore.currentAccount).not.toEqual({})

    // reset store
    accountStore.$reset()

    expect(accountStore.userAccounts.length).toEqual(0)
    expect(accountStore.currentAccount).toEqual({})
  })
})
