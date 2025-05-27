import { describe, it, expect } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

mockNuxtImport('useConnectAccountStore', () => {
  return () => (
    {
      currentAccount: {
        id: 1
      }
    }
  )
})

describe('account utils', () => {
  describe('isCurrentOrganization', () => {
    it('should return true if the current account id in the store matches the given account id', () => {
      expect(isCurrentOrganization(1)).toBe(true)
    })

    it('should return true if the current account id in the store matches the given account id', () => {
      expect(isCurrentOrganization(2)).toBe(false)
    })
  })
})
