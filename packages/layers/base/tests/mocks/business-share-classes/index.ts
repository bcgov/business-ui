import fs from 'fs'
import { createResolver } from 'nuxt/kit'

const { resolve } = createResolver(import.meta.url)

export const getShareClassesMock = (file: 'default' | 'currency-other' = 'default') => {
  const json: { shareClasses: ShareClassSchema[] } = JSON.parse(
    fs.readFileSync(resolve(`./json/${file}.json`), 'utf8')
  )
  return json
}
