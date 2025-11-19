import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { TableColumnMailingAddress } from '#components'

describe('TableColumnMailingAddress', () => {
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
      sameAs: true
    }
  }

  it('should display "Same as delivery address" when sameAs is true', async () => {
    const wrapper = await mountSuspended(TableColumnMailingAddress, {
      props: defaultProps
    })

    const span = wrapper.find('span')
    expect(span.exists()).toBe(true)
    expect(span.text()).toBe('Same as Delivery Address')

    const addressDisplay = wrapper.findComponent({ name: 'ConnectAddressDisplay' })
    expect(addressDisplay.exists()).toBe(false)
  })

  it('should display "Not Entered" when mailing address is invalid', async () => {
    const wrapper = await mountSuspended(TableColumnMailingAddress, {
      props: {
        data: {
          deliveryAddress: defaultProps.data.deliveryAddress,
          mailingAddress: {
            street: '123 Main St'
            // missing required properties
          },
          sameAs: false
        }
      }
    })

    const span = wrapper.find('span')
    expect(span.exists()).toBe(true)
    expect(span.text()).toBe('Not Entered')

    const addressDisplay = wrapper.findComponent({ name: 'ConnectAddressDisplay' })
    expect(addressDisplay.exists()).toBe(false)
  })

  it('should render ConnectAddressDisplay with a valid address', async () => {
    const wrapper = await mountSuspended(TableColumnMailingAddress, {
      props: {
        data: {
          deliveryAddress: defaultProps.data.deliveryAddress,
          mailingAddress: {
            ...defaultProps.data.deliveryAddress,
            street: 'Different Main St'
          },
          sameAs: false
        }
      }
    })

    const addressDisplay = wrapper.findComponent({ name: 'ConnectAddressDisplay' })
    expect(addressDisplay.exists()).toBe(true)
  })
})
