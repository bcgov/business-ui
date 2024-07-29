import type { DropdownItem } from '#ui/types'

// handle navigation items and functionality
export function useSbcNav () {
  const localePath = useLocalePath()
  const { t } = useI18n()
  const keycloak = useKeycloak()
  const accountStore = useAccountStore()
  const arStore = useAnnualReportStore()

  const mainLinks = computed<DropdownItem[]>(() => {
    return [
      {
        icon: 'i-mdi-home',
        label: t('btn.sbcConnect'),
        to: localePath('/')
      }
    ]
  })

  const loggedInUserOptions = computed<DropdownItem[][]>(() => {
    const fullOptions: DropdownItem[][] = [
      [
        {
          label: 'Account',
          slot: 'account',
          disabled: true
        }
      ]
    ]

    const accountOptions = accountStore.userAccounts
      .filter(account => accountStore.currentAccount.id !== account.id)
      .map(account => ({
        label: account.name,
        click: () => accountStore.selectUserAccount(account.id)
      }))

    // only allow switching account if theres no filing
    if (accountOptions.length > 0 && (Object.keys(arStore.arFiling).length === 0)) {
      fullOptions.push([
        {
          label: 'Switch Accounts',
          disabled: true
        }
      ])
      fullOptions.push([
        ...accountOptions
      ])
    }

    fullOptions.push([
      {
        label: t('btn.logout'),
        icon: 'i-mdi-logout',
        click: () => keycloak.logout()
      }
    ])
    return fullOptions
  })

  // const loggedOutUserOptions = computed<DropdownItem[][]>(() => {
  //   return [
  //     [
  //       {
  //         label: 'Log in',
  //         to: localePath('/sbc/auth/login'),
  //         icon: 'i-mdi-login'
  //       },
  //       {
  //         label: 'Create Account',
  //         icon: 'i-mdi-account-plus'
  //       }
  //     ]
  //   ]
  // })

  return {
    mainLinks,
    loggedInUserOptions
    // loggedOutUserOptions,
  }
}
