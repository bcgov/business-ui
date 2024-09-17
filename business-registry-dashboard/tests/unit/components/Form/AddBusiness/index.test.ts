import { describe, it, expect, afterEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { VueWrapper } from '@vue/test-utils'
import { FormAddBusiness, FormAddBusinessBase, FormAddBusinessError, FormAddBusinessEmailAuthSent } from '#components'
import { enI18n } from '~~/tests/mocks/i18n'

const testProps: any = {
  authOptions: [],
  contactEmail: 'test@email.com',
  identifier: '1234567890',
  accounts: [],
  businessDetails: {
    isFirm: false,
    isCorporation: false,
    isBenefit: false,
    isCorpOrBenOrCoop: false,
    isCoop: false,
    name: 'Business Name',
    identifier: '1234567890'
  }
}

function mountComp (props = testProps) {
  return mountSuspended(FormAddBusiness, {
    props,
    global: {
      plugins: [enI18n]
    }
  })
}

describe('<FormAddBusiness />', () => {
  let wrapper: VueWrapper

  afterEach(() => {
    wrapper.unmount()
  })

  it('should mount', async () => {
    wrapper = await mountComp()
    expect(wrapper).toBeTruthy()
  })

  it('should render FormAddBusinessBase initially', async () => {
    wrapper = await mountComp()
    expect(wrapper.findComponent(FormAddBusinessBase).exists()).toBe(true)
  })

  it('should render FormAddBusinessError when error occurs', async () => {
    wrapper = await mountComp()

    // trigger error
    wrapper.findComponent(FormAddBusinessBase).vm.$emit('business-error', {
      error: new Error('Test error'),
      type: 'some-type'
    })

    await nextTick()

    expect(wrapper.findComponent(FormAddBusinessError).exists()).toBe(true)
  })

  it('should render FormAddBusinessEmailAuthSent on email success', async () => {
    wrapper = await mountComp()

    // trigger email success event
    wrapper.findComponent(FormAddBusinessBase).vm.$emit('email-success')

    await nextTick()

    expect(wrapper.findComponent(FormAddBusinessEmailAuthSent).exists()).toBe(true)
  })

  it('should switch back to FormAddBusinessBase on retry', async () => {
    wrapper = await mountComp()

    // Trigger error
    wrapper.findComponent(FormAddBusinessBase).vm.$emit('business-error', {
      error: new Error('Test error'),
      type: 'some-type'
    })

    await nextTick()

    // should show error state
    expect(wrapper.findComponent(FormAddBusinessError).exists()).toBe(true)

    // trigger retry
    wrapper.findComponent(FormAddBusinessError).vm.$emit('retry')
    await nextTick()

    // should be back to form state
    expect(wrapper.findComponent(FormAddBusinessBase).exists()).toBe(true)
  })
})
