/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { TableColumnOfficeType } from '#components'

describe('TableColumnOfficeType', () => {
  const defaultProps = {
    type: 'registeredOffice' as OfficeType,
    badges: []
  }

  it('should render the correct office type name', async () => {
    const wrapper = await mountSuspended(TableColumnOfficeType, {
      props: defaultProps
    })

    const span = wrapper.find('span')
    expect(span.text()).toBe('Registered Office')
  })

  it('should render correct amount of badges', async () => {
    const badges = [
      { label: 'Added' },
      { label: 'Removed', color: 'neutral' }
    ] as any

    const wrapper = await mountSuspended(TableColumnOfficeType, {
      props: {
        ...defaultProps,
        badges
      }
    })

    const ul = wrapper.find('ul')
    expect(ul.exists()).toBe(true)

    const listItems = wrapper.findAll('li')
    expect(listItems.length).toBe(2)
    expect(listItems[0]!.text()).toBe('Added')
    expect(listItems[1]!.text()).toBe('Removed')
  })

  it('should not render badge list if no badges', async () => {
    const wrapper = await mountSuspended(TableColumnOfficeType, {
      props: {
        ...defaultProps,
        badges: []
      }
    })

    expect(wrapper.find('ul').exists()).toBe(false)
  })
})
