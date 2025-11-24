import fs from 'fs'
import { createResolver } from 'nuxt/kit'

const { resolve } = createResolver(import.meta.url)

type PartiesOverride = { index: number, key: string, value: string | boolean | number }

export const getPartiesMock = (overrides: PartiesOverride[] = []) => {
  const json: OrgPerson[] = JSON.parse(fs.readFileSync(resolve('./json/default.json'), 'utf8'))
  for (const override of overrides) {
    try {
      // @ts-expect-error assume that we are giving allowable indexes and keys in the overrides
      json[index][override.key] = override.value
    } catch (e) {
      console.error('Invalid party override given', e)
    }
  }
  return { parties: json }
}
