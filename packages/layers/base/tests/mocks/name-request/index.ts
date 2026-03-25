import fs from 'fs'
import { createResolver } from 'nuxt/kit'

const { resolve } = createResolver(import.meta.url)

export type NameRequestOverride = { key: string, value: string | boolean | number | object[] }

export const getNameRequestMock = (overrides: NameRequestOverride[] = []) => {
  const json = JSON.parse(fs.readFileSync(resolve('./json/default.json'), 'utf8'))
  for (const override of overrides) {
    try {
      json[override.key] = override.value
    } catch (e) {
      console.error('Invalid name request override given', e)
    }
  }
  return json
}
