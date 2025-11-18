import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { TableColumnName } from '#components'

describe('TableColumnName', () => {
  const defaultProps = {
    party: {
      partyType: PartyType.PERSON,
      firstName: 'John',
      middleName: 'Fitzgerald',
      lastName: 'Doe',
      businessName: 'Acme Corporation'
    },
    isRemoved: false,
    badges: []
  }

  it('should display first, middle and last name in uppercase for PartyType.PERSON', async () => {
    const wrapper = await mountSuspended(TableColumnName, {
      props: defaultProps
    })

    const span = wrapper.find('span')
    expect(span.text()).toBe('JOHN FITZGERALD DOE')
  })

  it('should display business name in uppercase for PartyType.ORGANIZATION', async () => {
    const wrapper = await mountSuspended(TableColumnName, {
      props: {
        ...defaultProps,
        party: {
          partyType: PartyType.ORGANIZATION,
          businessName: 'Acme Corporation',
          firstName: 'John',
          middleName: 'Fitzgerald',
          lastName: 'Doe'
        }
      }
    })

    const span = wrapper.find('span')
    expect(span.text()).toBe('ACME CORPORATION')
  })

  it('should add opacity when isRemoved is true', async () => {
    const wrapper = await mountSuspended(TableColumnName, {
      props: {
        ...defaultProps,
        isRemoved: true
      }
    })

    expect(wrapper.classes()).toContain('opacity-50')
  })

  it('should not add opacity when isRemoved is false', async () => {
    const wrapper = await mountSuspended(TableColumnName, {
      props: {
        ...defaultProps,
        isRemoved: false
      }
    })

    expect(wrapper.classes()).not.toContain('opacity-50')
  })

  it('should not render badge ul if no badges', async () => {
    const wrapper = await mountSuspended(TableColumnName, {
      props: {
        ...defaultProps,
        badges: []
      }
    })

    const badgeList = wrapper.find('ul')
    expect(badgeList.exists()).toBe(false)
  })

  it('should render correct amount of badges', async () => {
    const wrapper = await mountSuspended(TableColumnName, {
      props: {
        ...defaultProps,
        badges: [
          { label: 'Added' },
          { label: 'Edited' }
        ]
      }
    })

    const badgeList = wrapper.find('ul')
    expect(badgeList.exists()).toBe(true)

    const badges = wrapper.findAll('li')
    expect(badges.length).toBe(2)
  })
})
