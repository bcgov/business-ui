import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const { authApiMock } = vi.hoisted(() => ({ authApiMock: vi.fn() }))

mockNuxtImport('useNuxtApp', () => {
  return () => ({ $authApi: authApiMock })
})

const account = { name: 'ABC LLP', uuid: 'uuid-1', dateAdded: '2026-01-22T00:00:00+00:00' }

describe('useAuthorizedAccounts', () => {
  beforeEach(() => {
    authApiMock.mockReset()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('requests the accounts for the business and exposes them', async () => {
    authApiMock.mockResolvedValue({ authorizedAccounts: [account] })
    const { accounts, loading, error, load } = useAuthorizedAccounts('BC1234567')

    expect(loading.value).toBe(true)
    await load()

    expect(authApiMock).toHaveBeenCalledWith('/entities/BC1234567/authorized-accounts')
    expect(accounts.value).toEqual([account])
    expect(loading.value).toBe(false)
    expect(error.value).toBe(false)
  })

  it('resolves a ref identifier at load time, not at creation time', async () => {
    const identifier = ref('BC1111111')
    authApiMock.mockResolvedValue({ authorizedAccounts: [] })
    const { load } = useAuthorizedAccounts(identifier)

    identifier.value = 'BC2222222'
    await load()

    expect(authApiMock).toHaveBeenCalledWith('/entities/BC2222222/authorized-accounts')
  })

  it('does not call the api when there is no identifier', async () => {
    const { load } = useAuthorizedAccounts('')

    await load()

    expect(authApiMock).not.toHaveBeenCalled()
  })

  it('treats a response without the authorizedAccounts key as empty rather than an error', async () => {
    authApiMock.mockResolvedValue({})
    const { accounts, error, load } = useAuthorizedAccounts('BC1234567')

    await load()

    expect(accounts.value).toEqual([])
    expect(error.value).toBe(false)
  })

  it('flags an error and clears accounts when the request fails, then clears it on a later success', async () => {
    const { accounts, loading, error, load } = useAuthorizedAccounts('BC1234567')

    authApiMock.mockRejectedValueOnce(new Error('403'))
    await load()

    expect(accounts.value).toEqual([])
    expect(loading.value).toBe(false)
    expect(error.value).toBe(true)

    authApiMock.mockResolvedValue({ authorizedAccounts: [account] })
    await load()

    expect(error.value).toBe(false)
    expect(accounts.value).toHaveLength(1)
  })
})
