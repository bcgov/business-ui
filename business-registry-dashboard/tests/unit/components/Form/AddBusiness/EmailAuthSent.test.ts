import { describe, it, expect, afterEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { VueWrapper } from '@vue/test-utils'
import { FormAddBusinessEmailAuthSent } from '#components'
import { enI18n } from '~~/tests/mocks/i18n'

function mountComp () {
  return mountSuspended(FormAddBusinessEmailAuthSent, {
    props: {
      contactEmail: 'text@example.com'
    },
    global: {
      plugins: [enI18n]
    }
  })
}

describe('<FormAddBusinessEmailAuthSent />', () => {
  let wrapper: VueWrapper

  afterEach(() => {
    wrapper.unmount()
  })

  it('should mount', async () => {
    wrapper = await mountComp()
    expect(wrapper).toBeTruthy()
    expect(wrapper.text()).toContain(enI18n.global.t('form.manageBusiness.emailSent.heading'))
    expect(wrapper.text()).toContain(enI18n.global.t('form.manageBusiness.emailSent.p1'))
    expect(wrapper.text()).toContain(enI18n.global.t('form.manageBusiness.emailSent.p2'))
  })

  it('handles the close button click', async () => {
    const wrapper = await mountSuspended(FormAddBusinessEmailAuthSent, {
      props: {
        contactEmail: 'test@example.com'
      },
      global: {
        plugins: [enI18n]
      }
    })

    // click close button
    wrapper.find('button').trigger('click')

    expect(wrapper.findComponent(FormAddBusinessEmailAuthSent).exists()).toBe(false) // should close modal
  })
})
