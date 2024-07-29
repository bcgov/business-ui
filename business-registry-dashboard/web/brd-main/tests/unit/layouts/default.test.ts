import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import defaultLayout from '~/layouts/default.vue'

describe('Default Layout', () => {
  it('mounts', async () => {
    const component = await mountSuspended(defaultLayout)

    expect(component).toBeTruthy()
    expect(component.html()).toMatchInlineSnapshot('"<main class="flex grow justify-center px-4 py-8"></main>"')
  })
})
