import fs from 'fs'
import { createResolver } from 'nuxt/kit'

const { resolve } = createResolver(import.meta.url)

export const getCourtOrdersMock = (file: 'default' = 'default') => {
  const json: { shareClasses: ShareClassSchema[] } = JSON.parse(
    fs.readFileSync(resolve(`./json/${file}.json`), 'utf8')
  )
  return json
}
