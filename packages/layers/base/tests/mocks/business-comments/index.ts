import fs from 'fs'
import { createResolver } from 'nuxt/kit'

const { resolve } = createResolver(import.meta.url)

type CommentOverride = { index: number, key: string, value: string | boolean | number }

export const getCommentsMock = (overrides: CommentOverride[] = []) => {
  const json: BusinessComment[] = JSON.parse(fs.readFileSync(resolve('./json/default.json'), 'utf8'))
  for (const override of overrides) {
    try {
      // @ts-expect-error assume that we are giving allowable indexes and keys in the overrides
      json[index][override.key] = override.value
    } catch (e) {
      console.error('Invalid comment override given', e)
    }
  }
  return { comments: json.map(item => ({ comment: item })) }
}
