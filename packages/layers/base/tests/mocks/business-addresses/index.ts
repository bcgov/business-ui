import fs from 'fs'
import { createResolver } from 'nuxt/kit'

const { resolve } = createResolver(import.meta.url)

export const getBusinessAddressesMock = () => {
  const json: EntityOfficeAddress = JSON.parse(fs.readFileSync(resolve('./json/default.json'), 'utf8'))
  return json
}
