import fs from 'fs'
import { createResolver } from 'nuxt/kit'

const { resolve } = createResolver(import.meta.url)

type BootstrapOverride = { key: string, value: string | boolean | number }

export const getBootstrapMock = (overrides: BootstrapOverride[] = []) => {
  const json: FilingGetByIdResponse<BootstrapFiling> = JSON.parse(
    fs.readFileSync(resolve('./json/default.json'), 'utf8')
  )
  for (const override of overrides) {
    // @ts-expect-error assume that we are giving allowable keys in the overrides
    json[override.key] = override.value
  }
  return json
}
