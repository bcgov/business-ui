import { AccountType } from '~/app/enums/account-type'
import { AccountStatus } from '~/app/enums/account-status'
import { UserSettingsType } from '~/app/enums/user-settings-type'

export interface Account {
  id: string
  accountType: AccountType
  accountStatus: AccountStatus
  additionalLabel?: string
  label: string
  type: UserSettingsType.ACCOUNT
  urlpath: string
  urlorigin: string
}

export interface NewAccount {
  accountName: string | undefined
  contact: {
    phone: string | undefined
    email: string | undefined
    phoneExt?: string | undefined
  }
}
