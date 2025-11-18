import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { TableColumnDeliveryAddress } from '#components'

describe('TableColumnDeliveryAddress', () => {
  const mockAddress: ConnectAddress = {
    street: '123 Main St',
    city: 'Victoria',
    country: 'CA',
    region: 'BC',
    postalCode: 'V1X 1X1',
    streetAdditional: '',
    locationDescription: ''
  }

  const defaultProps = {
    data: {
      deliveryAddress: mockAddress,
      mailingAddress: mockAddress,
      sameAs: false
    },
    isRemoved: false
  }

  it('should add opacity when isRemoved is true', async () => {
    const wrapper = await mountSuspended(TableColumnDeliveryAddress, {
      props: {
        ...defaultProps,
        isRemoved: true
      }
    })

    expect(wrapper.classes()).toContain('opacity-50')
  })

  it('should not add opacity when isRemoved is false', async () => {
    const wrapper = await mountSuspended(TableColumnDeliveryAddress, {
      props: defaultProps
    })

    expect(wrapper.classes()).not.toContain('opacity-50')
  })

  it('should render ConnectAddressDisplay', async () => {
    const wrapper = await mountSuspended(TableColumnDeliveryAddress, {
      props: defaultProps
    })

    const addressDisplay = wrapper.findComponent({ name: 'ConnectAddressDisplay' })
    expect(addressDisplay.exists()).toBe(true)
  })
})
