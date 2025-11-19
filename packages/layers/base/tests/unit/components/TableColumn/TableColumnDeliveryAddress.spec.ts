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
    }
  }

  it('should render ConnectAddressDisplay', async () => {
    const wrapper = await mountSuspended(TableColumnDeliveryAddress, {
      props: defaultProps
    })

    const addressDisplay = wrapper.findComponent({ name: 'ConnectAddressDisplay' })
    expect(addressDisplay.exists()).toBe(true)
  })
})
