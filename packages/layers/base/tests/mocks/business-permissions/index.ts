import fs from 'fs'
import { createResolver } from 'nuxt/kit'

const { resolve } = createResolver(import.meta.url)

// FUTURE: add other groups (i.e. regular user)
export const getPermissionsMock = (group: 'staff' = 'staff') => {
  const json: {
    authorizedPermissions: AuthorizedAction[]
  } = JSON.parse(fs.readFileSync(resolve(`./json/${group}.json`), 'utf8'))
  return json
}
