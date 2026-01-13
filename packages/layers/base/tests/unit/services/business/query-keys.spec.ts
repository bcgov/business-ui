/* eslint-disable @typescript-eslint/no-explicit-any, max-len */
import { describe, it, expect, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const mockCurrentAccount = ref({ id: 'ACC123' })

mockNuxtImport('useConnectAccountStore', () => {
  return () => ({
    currentAccount: mockCurrentAccount
  })
})

mockNuxtImport('storeToRefs', () => {
  return (store: any) => store
})

describe('useBusinessQueryKeys', () => {
  beforeEach(() => {
    mockCurrentAccount.value = { id: 'ACC123' }
  })

  it('should generate a correct base key using the account ID', () => {
    const { base } = useBusinessQueryKeys()
    expect(base.value).toEqual(['business', 'ACC123'])
  })

  it('should be reactive when the account ID changes', async () => {
    const { base, keys } = useBusinessQueryKeys()
    expect(base.value).toEqual(['business', 'ACC123'])
    expect(keys.addresses('BC111')).toEqual(['business', 'ACC123', 'BC111', 'addresses'])

    mockCurrentAccount.value = { id: 'ACC-NEW' }

    expect(base.value).toEqual(['business', 'ACC-NEW'])
    expect(keys.addresses('BC111')).toEqual(['business', 'ACC-NEW', 'BC111', 'addresses'])
  })

  describe('Key Structure', () => {
    const { keys } = useBusinessQueryKeys()
    const businessId = 'BC1234567'
    const accountId = 'ACC123'

    it.each([
      ['addresses', [businessId], ['business', accountId, businessId, 'addresses']],
      ['authInfo', [businessId], ['business', accountId, businessId, 'auth-info']],
      ['authorizedActions', [businessId], ['business', accountId, businessId, 'authorized-actions']],
      ['business', [businessId, true], ['business', accountId, businessId, 'information', { slim: true }]],
      ['bootstrapFiling', ['T12345'], ['business', accountId, 'T12345', 'bootstrap-filing']],
      ['document', [businessId, 'http://api/pdf', 'file.pdf'], ['business', accountId, businessId, 'document', { url: 'http://api/pdf', filename: 'file.pdf' }]],
      ['filing', [businessId, 55], ['business', accountId, businessId, 'filing', 55]],
      ['filingComments', [businessId, 55, 'http://comments'], ['business', accountId, businessId, 'filing', 55, 'comments', { url: 'http://comments' }]],
      ['filingDocumentUrls', [businessId, 55], ['business', accountId, businessId, 'filing', 55, 'document-urls']],
      ['ledger', [businessId, '2026-01-13'], ['business', accountId, businessId, 'ledger', { date: '2026-01-13' }]],
      ['linkedNameRequest', [businessId, 'NR 123'], ['business', accountId, businessId, 'linked-name-request', 'NR 123']],
      ['parties', [businessId, { role: 'director' }], ['business', accountId, businessId, 'parties', { role: 'director' }]],
      ['tasks', [businessId], ['business', accountId, businessId, 'tasks']]
    ])('keys.%s should return the correct array structure', (methodName, args, expected) => {
      // @ts-expect-error - can't index method name on keys
      const result = keys[methodName](...args)
      expect(result).toEqual(expected)
    })
  })
})
