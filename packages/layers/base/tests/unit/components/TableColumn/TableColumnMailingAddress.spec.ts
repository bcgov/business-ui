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
      sameAs: false
    }
  }

  it('should render ConnectAddressDisplay', async () => {
    const wrapper = await mountSuspended(TableColumnMailingAddress, {
      props: defaultProps
    })

    const addressDisplay = wrapper.findComponent({ name: 'ConnectAddressDisplay' })
    expect(addressDisplay.exists()).toBe(true)
  })

  it('should render an incomplete address as is without an invalid label', async () => {
    const wrapper = await mountSuspended(TableColumnMailingAddress, {
      props: { data: { ...defaultProps.data, mailingAddress: { ...mockAddress, postalCode: '' } } }
    })

    expect(wrapper.findComponent({ name: 'ConnectAddressDisplay' }).exists()).toBe(true)
    expect(wrapper.find('[data-testid="invalid-address-label"]').exists()).toBe(false)
  })

  it('should mark an incomplete address with the invalid label under the partial address', async () => {
    const wrapper = await mountSuspended(TableColumnMailingAddress, {
      props: {
        data: { ...defaultProps.data, mailingAddress: { ...mockAddress, postalCode: '' } },
        invalidLabel: 'Missing information'
      }
    })

    expect(wrapper.findComponent({ name: 'ConnectAddressDisplay' }).exists()).toBe(true)
    expect(wrapper.find('[data-testid="invalid-address-label"]').text()).toBe('Missing information')
  })

  it('should show only the invalid label when nothing beyond the country was entered', async () => {
    const wrapper = await mountSuspended(TableColumnMailingAddress, {
      props: {
        data: {
          ...defaultProps.data,
          mailingAddress: {
            street: '',
            streetAdditional: '',
            city: '',
            region: '',
            postalCode: '',
            country: 'CA',
            locationDescription: ''
          }
        },
        invalidLabel: 'Missing information'
      }
    })

    expect(wrapper.findComponent({ name: 'ConnectAddressDisplay' }).exists()).toBe(false)
    expect(wrapper.find('[data-testid="invalid-address-label"]').text()).toBe('Missing information')
  })

  it('should not mark a complete address', async () => {
    const wrapper = await mountSuspended(TableColumnMailingAddress, {
      props: { ...defaultProps, invalidLabel: 'Missing information' }
    })

    expect(wrapper.findComponent({ name: 'ConnectAddressDisplay' }).exists()).toBe(true)
    expect(wrapper.find('[data-testid="invalid-address-label"]').exists()).toBe(false)
  })
})
