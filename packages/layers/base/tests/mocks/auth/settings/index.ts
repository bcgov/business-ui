import fs from 'fs'
import { createResolver } from 'nuxt/kit'

import type { ConnectAccount } from '#auth/app/interfaces/connect-account'

const { resolve } = createResolver(import.meta.url)

export const getUserSettingsMock = (accountType: string) => {
  const json: ConnectAccount[] = JSON.parse(fs.readFileSync(resolve(`./json/${accountType}.json`), 'utf8'))
  return json
}
