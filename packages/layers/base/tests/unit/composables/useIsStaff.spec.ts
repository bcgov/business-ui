import { describe, it, expect, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

let mockCurrentAccount: undefined | { accountType: AccountType } = undefined
mockNuxtImport('useConnectAccountStore', () => () => ({ currentAccount: mockCurrentAccount }))

describe('useIsStaff', () => {
  beforeEach(async () => {
    mockCurrentAccount = undefined
  })

  it.each([
    { accountType: AccountType.BASIC, expected: false },
    { accountType: AccountType.PREMIUM, expected: false },
    { accountType: AccountType.SBC_STAFF, expected: false },
    { accountType: AccountType.STAFF, expected: true },
    { accountType: undefined, expected: false }
  ])('should return $expected when account type is $accountType', ({ accountType, expected }) => {
    if (accountType === undefined) {
      mockCurrentAccount = undefined
    } else {
      mockCurrentAccount = { accountType }
    }

    const isStaff = useIsStaff()

    expect(isStaff.value).toBe(expected)
  })
})
