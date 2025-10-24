import fs from 'fs'
import { createResolver } from 'nuxt/kit'

const { resolve } = createResolver(import.meta.url)

type FlagOverride = { flag: LDFlag, value: string | boolean | number }
type Flag = { [x: string]: string | boolean | number }

export const getLdarklyFlagsMock = (overrides: FlagOverride[] = []) => {
  const json: Flag = JSON.parse(fs.readFileSync(resolve('./json/flags.json'), 'utf8'))
  for (const override of overrides) {
    if (Object.keys(json).includes(override.flag)) {
      json[override.flag] = override.value
    } else {
      console.error(
        'Attempting to override ldarkly flag mock with a flag name that is not in the mocked json:',
        override.flag
      )
    }
  }
  return json
}
