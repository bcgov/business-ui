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
      sameAs: true
    }
  }

  it('should display "Same as mailing address" when sameAs is true', async () => {
    const wrapper = await mountSuspended(TableColumnDeliveryAddress, {
      props: defaultProps
    })

    const span = wrapper.find('span')
    expect(span.exists()).toBe(true)
    expect(span.text()).toBe('Same as Mailing Address')

    const addressDisplay = wrapper.findComponent({ name: 'ConnectAddressDisplay' })
    expect(addressDisplay.exists()).toBe(false)
  })

  it('should display "Not Entered" when delivery address is invalid', async () => {
    const wrapper = await mountSuspended(TableColumnDeliveryAddress, {
      props: {
        data: {
          mailingAddress: defaultProps.data.deliveryAddress,
          // @ts-expect-error - partial object
          deliveryAddress: {
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

  it('should mark an incomplete address with the invalid label instead of "Not Entered"', async () => {
    const wrapper = await mountSuspended(TableColumnDeliveryAddress, {
      props: {
        data: {
          mailingAddress: mockAddress,
          deliveryAddress: { ...mockAddress, postalCode: '' },
          sameAs: false
        },
        invalidLabel: 'Missing information'
      }
    })

    expect(wrapper.text()).not.toContain('Not Entered')
    expect(wrapper.findComponent({ name: 'ConnectAddressDisplay' }).exists()).toBe(true)
    expect(wrapper.find('[data-testid="invalid-address-label"]').text()).toBe('Missing information')
  })

  it('should show only the invalid label when nothing beyond the country was entered', async () => {
    const wrapper = await mountSuspended(TableColumnDeliveryAddress, {
      props: {
        data: {
          mailingAddress: mockAddress,
          deliveryAddress: { ...mockAddress, street: '', city: '', region: '', postalCode: '', streetAdditional: '' },
          sameAs: false
        },
        invalidLabel: 'Missing information'
      }
    })

    expect(wrapper.findComponent({ name: 'ConnectAddressDisplay' }).exists()).toBe(false)
    expect(wrapper.find('[data-testid="invalid-address-label"]').text()).toBe('Missing information')
  })

  it('should keep "Same as Mailing Address" over the invalid label', async () => {
    const wrapper = await mountSuspended(TableColumnDeliveryAddress, {
      props: { ...defaultProps, invalidLabel: 'Missing information' }
    })

    expect(wrapper.find('span').text()).toBe('Same as Mailing Address')
    expect(wrapper.find('[data-testid="invalid-address-label"]').exists()).toBe(false)
  })

  it('should render ConnectAddressDisplay with a valid address', async () => {
    const wrapper = await mountSuspended(TableColumnDeliveryAddress, {
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
