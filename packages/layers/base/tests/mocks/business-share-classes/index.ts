import fs from 'fs'
import { createResolver } from 'nuxt/kit'

const { resolve } = createResolver(import.meta.url)

export const getShareClassesMock = () => {
  const json: { shareClasses: ShareClassSchema[] } = JSON.parse(
    fs.readFileSync(resolve('./json/default.json'), 'utf8')
  )
  return json
}
