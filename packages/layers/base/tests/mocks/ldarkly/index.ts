import fs from 'fs'
import { createResolver } from 'nuxt/kit'

const { resolve } = createResolver(import.meta.url)

type FlagOverride = { flag: LDFlag, value: string | boolean | number | string[] }
type Flag = { value: unknown, [key: string]: unknown }

export const getLdarklyFlagsMock = (overrides: FlagOverride[] = []) => {
  const json: Record<string, Flag> = JSON.parse(fs.readFileSync(resolve('./json/flags.json'), 'utf8'))
  for (const override of overrides) {
    const flag = json[override.flag]
    if (flag) {
      flag.value = override.value
    } else {
      console.error(
        'Attempting to override ldarkly flag mock with a flag name that is not in the mocked json:',
        override.flag
      )
    }
  }
  return json
}
