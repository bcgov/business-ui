import fs from 'fs'
import { createResolver } from 'nuxt/kit'

const { resolve } = createResolver(import.meta.url)

type BusinessOverride = { key: string, value: string | boolean | number }

export const getBusinessMock = (overrides: BusinessOverride[] = [], slim = false) => {
  const json: BusinessDataSlim = JSON.parse(fs.readFileSync(
    slim ? resolve('./json/slim.json') : resolve('./json/full.json'), 'utf8'))
  for (const override of overrides) {
    // @ts-expect-error assume that we are giving allowable keys in the overrides
    json[override.key] = override.value
  }
  return { business: json }
}
