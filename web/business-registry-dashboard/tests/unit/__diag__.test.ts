import { describe, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { AsyncComboBox, UInput } from '#components'
import { enI18n } from '~~/tests/mocks/i18n'

describe('diagnostic', () => {
  it('dumps hang state for AsyncComboBox mount', async () => {
    const origFetch = globalThis.fetch
    globalThis.fetch = ((...args: Parameters<typeof fetch>) => {
      console.log('[DIAG] fetch called with', args[0]?.toString())
      return origFetch(...args).catch((e) => {
        console.log('[DIAG] fetch rejected:', e?.message)
        throw e
      })
    }) as typeof fetch

    process.on('unhandledRejection', (reason) => {
      console.log('[DIAG] unhandledRejection:', reason)
    })

    console.log('[DIAG] starting mountSuspended at', Date.now())

    const mountPromise = mountSuspended(AsyncComboBox, {
      props: {
        searchFn: async () => [],
        idAttr: 'id',
        valueAttr: 'name',
        text: { placeholder: 'x', arialabel: 'x' }
      },
      global: {
        plugins: [enI18n],
        components: { UInput }
      }
    }).then((w) => {
      console.log('[DIAG] mountSuspended RESOLVED at', Date.now())
      return w
    }).catch((e) => {
      console.log('[DIAG] mountSuspended REJECTED at', Date.now(), e?.message, e?.stack)
      throw e
    })

    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => {
        console.log('[DIAG] 8s mark reached, dumping process state at', Date.now())
        const handles = (process as any)._getActiveHandles?.() ?? []
        const requests = (process as any)._getActiveRequests?.() ?? []
        console.log('[DIAG] active handles count:', handles.length)
        handles.forEach((h: any, i: number) => {
          console.log(`[DIAG] handle[${i}] constructor:`, h?.constructor?.name)
        })
        console.log('[DIAG] active requests count:', requests.length)
        requests.forEach((r: any, i: number) => {
          console.log(`[DIAG] request[${i}] constructor:`, r?.constructor?.name)
        })
        resolve('timeout-marker')
      }, 8000)
    })

    await Promise.race([mountPromise, timeoutPromise])
    console.log('[DIAG] race settled at', Date.now())

    globalThis.fetch = origFetch
  }, 15000)
})
