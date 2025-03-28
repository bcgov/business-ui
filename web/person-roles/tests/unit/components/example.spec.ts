import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, test, expect, beforeAll } from 'vitest'
import type { VueWrapper } from '@vue/test-utils'
import { HelloWorld } from '#components'

describe('Example Test', () => {
  let wrapper: VueWrapper

  beforeAll(async () => {
    wrapper = await mountSuspended(HelloWorld)
  })

  test('Renders', () => {
    expect(wrapper).toBeTruthy()
    expect(wrapper.html()).toMatchInlineSnapshot(`
      "<span>Hello World</span>
      <span>Go Home</span>"  
    `)
  })
})
