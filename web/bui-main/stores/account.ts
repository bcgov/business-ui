export const useAccountStore = defineStore('bar-sbc-account-store', () => {
  const keycloak = useKeycloak()
  const alertStore = useAlertStore()

  // store values
  const currentAccount = ref<Org>({} as Org)
  const userAccounts = ref<Org[]>([])
  const loading = ref<boolean>(false)

  // get signed in users accounts
  async function getUserAccounts (): Promise<{ orgs: Org[] }> {
    // TODO: fix this so it only makes the post request and refreshes token if the user doesnt have the proper roles
    // only update if user doesnt have role, not currently working so need to make call in index page initPage function still
    // if (!$keycloak.tokenParsed?.roles.includes('public_user')) {
    //   await useBarApi('/users', { method: 'POST' }, 'token')
    await keycloak.getToken(true) // force refresh
    // }

    const response = await useBarApi<{ orgs: Org[] }>(
      '/user/accounts',
      {},
      'token',
      'Error retrieving user accounts.'
    )

    userAccounts.value = response.orgs

    return response
  }

  // assign existing account as users current account
  function selectUserAccount (accountId: number, callback?: Function): void {
    try {
      loading.value = true
      const account = userAccounts.value.find(account => account.id === accountId)
      if (account) {
        currentAccount.value = account
      } else {
        console.warn(`Account with ID ${accountId} not found`)
      }
      if (callback) {
        callback()
      }
    } catch (error) {
      console.error('Error selecting user account:', error)
    } finally {
      loading.value = false
    }
  }

  // create new account
  async function createNewAccount (data: NewAccount, callback?: Function): Promise<void> {
    try {
      loading.value = true
      // TODO: fix this so it only makes the post request and refreshes token if the user doesnt have the proper roles
      // only update if user doesnt have role, not currently working so need to make call in index page initPage function still
      // if (!$keycloak.tokenParsed?.roles.includes('public_user')) {
      //   await useBarApi('/users', { method: 'POST' }, 'token')
      await keycloak.getToken(true) // force refresh
      // }

      const response = await useBarApi<Org>(
        '/user/accounts',
        {
          method: 'POST',
          body: {
            name: data.accountName,
            contactPoint: {
              email: data.contact.email,
              phone: data.contact.phone,
              extension: data.contact.phoneExt
            }
          }
        },
        'token',
        'An error occurred while creating a new account.'
      )

      currentAccount.value = response
      userAccounts.value.push(response)

      if (callback) {
        callback()
      }
    } catch {
      alertStore.addAlert({
        severity: 'error',
        category: AlertCategory.CREATE_ACCOUNT
      })
    } finally {
      loading.value = false
    }
  }

  async function isAccountNameAvailable (name: string): Promise<boolean> {
    try {
      const response = await useBarApi<{ limit: number, orgs: Org[], page: number, total: number}>(
        '/accounts',
        {
          query: {
            name
          }
        },
        'token',
        'Unable to verify account name availability at this time.'
      )

      if (response && response.orgs.length > 0) {
        return false
      } else {
        return true
      }
    } catch {
      return false
    }
  }

  // create new account name based on a given string
  async function findAvailableAccountName (username: string): Promise<string> {
    let increment = 10
    while (true) {
      const accountAvailable = await isAccountNameAvailable(username + increment)
      if (accountAvailable) {
        return username + increment
      }
      increment += 10
      if (increment > 100) {
        console.error('Exceeded maximum number of attempts trying to prefill account name.')
        return ''
      }
    }
  }

  async function getAndSetAccount (id: string): Promise<void> {
    await getUserAccounts()
    selectUserAccount(parseInt(id))
  }

  function $reset () {
    currentAccount.value = {} as Org
    userAccounts.value = []
    loading.value = false
  }

  // add roles to new sign in so user has roles in sbc auth
  async function updateUserProfile ():Promise<void> {
    await useBarApi(
      '/users',
      { method: 'POST' },
      'token',
      'An error occured while trying to update the user roles.'
    )
  }

  return {
    currentAccount,
    userAccounts,
    loading,
    getUserAccounts,
    selectUserAccount,
    createNewAccount,
    isAccountNameAvailable,
    findAvailableAccountName,
    getAndSetAccount,
    updateUserProfile,
    $reset
  }
},
{ persist: true } // persist store values in session storage
)
