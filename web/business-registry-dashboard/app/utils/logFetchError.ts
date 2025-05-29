import type { FetchError } from 'ofetch'
export function logFetchError (error: unknown, contextMessage: string) {
  const e = error as FetchError
  const status = e.response?.status
  const statusText = e.response?.statusText
  const hasMessage = e.data?.message !== undefined

  console.error(`${contextMessage}: ${status} - ${statusText} ${hasMessage ? `--- ${JSON.stringify(e.data)}` : ''}`)
}
