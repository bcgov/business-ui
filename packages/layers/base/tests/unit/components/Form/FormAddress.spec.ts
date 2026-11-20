import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { FormAddress } from '#components'

const bcAddress = {
  street: '123 Main St',
  streetAdditional: '',
  city: 'Victoria',
  region: 'BC',
  postalCode: 'V8V 1V1',
  country: 'CA',
  locationDescription: ''
}

// 'same as' checked - the delivery address mirrors the mailing address
async function mountAddress(mailing: Partial<typeof bcAddress>, props: AddressFormProps, sameAs = true) {
  const model = reactive<AddressWithIdSchema>({
    mailingAddress: { ...bcAddress, ...mailing, id: 'm1' },
    deliveryAddress: sameAs ? { ...bcAddress, ...mailing, id: 'd1' } : { ...bcAddress, id: 'd1' },
    sameAs
  })
  const wrapper = await mountSuspended(FormAddress, {
    props: { 'modelValue': model, 'onUpdate:modelValue': () => {}, ...props }
  })
  return { wrapper, model }
}

async function submit(wrapper: Awaited<ReturnType<typeof mountAddress>>['wrapper']) {
  await wrapper.find('form').trigger('submit')
  await flushPromises()
  // the errors land, then the watcher unchecks 'same as', then the delivery inputs render
  await nextTick()
  await nextTick()
}

describe('FormAddress', () => {
  it('unchecks "same as" and shows the delivery address when the mailing address is a PO Box', async () => {
    const { wrapper, model } = await mountAddress({ street: 'PO Box 234' }, { bcCanadaOnly: true, noPoBox: true })
    expect(wrapper.find('#delivery-address-input-street').exists()).toBe(false)

    await submit(wrapper)

    expect(model.sameAs).toBe(false)
    expect(model.deliveryAddress).toEqual({ ...model.mailingAddress, id: 'd1' })
    expect(wrapper.find('#delivery-address-input-street').exists()).toBe(true)
    expect(wrapper.text()).toContain('Address cannot be a PO Box')
  })

  it('unchecks "same as" when only the delivery address must be in BC and it is outside BC', async () => {
    const { wrapper, model } = await mountAddress({ region: 'AB', city: 'Calgary', postalCode: 'T2P 1J9' }, {
      bcCanadaOnly: 'delivery',
      noPoBox: true
    })

    await submit(wrapper)

    expect(model.sameAs).toBe(false)
    expect(wrapper.find('#delivery-address-input-street').exists()).toBe(true)
    expect(wrapper.text()).toContain('Address must be in British Columbia')
  })

  it('keeps "same as" checked when both addresses have the same BC error', async () => {
    const { wrapper, model } = await mountAddress({ region: 'AB', city: 'Calgary', postalCode: 'T2P 1J9' }, {
      bcCanadaOnly: true,
      noPoBox: true
    })

    await submit(wrapper)

    expect(model.sameAs).toBe(true)
    expect(wrapper.find('#delivery-address-input-street').exists()).toBe(false)
    expect(wrapper.text()).toContain('Address must be in British Columbia')
  })

  it('keeps "same as" checked when both addresses miss the same field', async () => {
    const { wrapper, model } = await mountAddress({ postalCode: '' }, { bcCanadaOnly: true, noPoBox: true })

    await submit(wrapper)

    expect(model.sameAs).toBe(true)
    expect(wrapper.find('#delivery-address-input-street').exists()).toBe(false)
  })

  it('unchecks "same as" when the delivery address has an extra error on top of the shared ones', async () => {
    const { wrapper, model } = await mountAddress({ street: 'PO Box 234', region: 'AB', city: 'Calgary' }, {
      bcCanadaOnly: true,
      noPoBox: true
    })

    await submit(wrapper)

    expect(model.sameAs).toBe(false)
    expect(wrapper.find('#delivery-address-input-street').exists()).toBe(true)
    expect(wrapper.text()).toContain('Address cannot be a PO Box')
  })

  it('keeps the delivery address in sync when the mailing address changes while "same as" is checked', async () => {
    const { wrapper, model } = await mountAddress({}, { bcCanadaOnly: true, noPoBox: true })

    model.mailingAddress.region = 'AB'
    model.mailingAddress.city = 'Calgary'
    await nextTick()

    expect(model.sameAs).toBe(true)
    expect(model.deliveryAddress).toEqual({ ...model.mailingAddress, id: 'd1' })

    await submit(wrapper)

    // the shared BC error stays on the mailing inputs with 'same as' left checked
    expect(model.sameAs).toBe(true)
    expect(wrapper.find('#delivery-address-input-street').exists()).toBe(false)
    expect(wrapper.text()).toContain('Address must be in British Columbia')
  })

  describe('editing the mailing address while "same as" is checked', () => {
    const settle = async () => {
      // the copy and errors land, then the watcher unchecks 'same as', then the delivery inputs render
      await nextTick()
      await nextTick()
      await nextTick()
    }

    it('delivery-only BC rule: unchecks and shows the BC error on the delivery address only', async () => {
      const { wrapper, model } = await mountAddress({}, { bcCanadaOnly: 'delivery', noPoBox: true })

      model.mailingAddress.region = 'AB'
      await settle()

      expect(model.sameAs).toBe(false)
      expect(model.deliveryAddress).toEqual({ ...model.mailingAddress, id: 'd1' })
      expect(wrapper.find('#delivery-address-input-street').exists()).toBe(true)
      const errors = wrapper.vm.formRef?.getErrors() ?? []
      expect(errors.map(e => [e.name, e.message]))
        .toEqual([['deliveryAddress.region', 'Address must be in British Columbia']])
    })

    it('both-in-BC rule: keeps "same as" checked with the shared error on the mailing address', async () => {
      const { wrapper, model } = await mountAddress({}, { bcCanadaOnly: true, noPoBox: true })

      model.mailingAddress.region = 'AB'
      await settle()

      expect(model.sameAs).toBe(true)
      expect(wrapper.find('#delivery-address-input-street').exists()).toBe(false)
      expect(wrapper.vm.formRef?.getErrors().map(e => e.name)).toContain('mailingAddress.region')
    })

    it('both-in-BC rule: stays checked and clears the shared error once the province is back in BC', async () => {
      const { wrapper, model } = await mountAddress({}, { bcCanadaOnly: true, noPoBox: true })

      model.mailingAddress.region = 'AB'
      await settle()
      model.mailingAddress.region = 'BC'
      await settle()

      // the hidden delivery address's BC error must not linger and look like a delivery-only error
      // (the mailing select clears its own error in the app - here the model is set directly)
      expect(model.sameAs).toBe(true)
      expect(wrapper.find('#delivery-address-input-street').exists()).toBe(false)
      expect(wrapper.vm.formRef?.getErrors().filter(e => e.name?.startsWith('deliveryAddress'))).toEqual([])
    })

    it('waits for the mailing inputs to lose focus before flagging a PO Box street', async () => {
      const { wrapper, model } = await mountAddress({}, { bcCanadaOnly: 'delivery', noPoBox: true })

      model.mailingAddress.street = 'PO Box 234'
      await settle()
      // still typing - no error yet, 'same as' stays checked
      expect(model.sameAs).toBe(true)

      await wrapper.find('#mailing-address-input-street').trigger('focusout')
      await settle()

      expect(model.sameAs).toBe(false)
      expect(model.deliveryAddress.street).toBe('PO Box 234')
      expect(wrapper.vm.formRef?.getErrors().map(e => [e.name, e.message]))
        .toEqual([['deliveryAddress.street', 'Address cannot be a PO Box']])
    })
  })

  describe('checking "same as"', () => {
    const props = { bcCanadaOnly: true, noPoBox: true } as const

    async function checkSameAs(model: AddressWithIdSchema) {
      model.sameAs = true
      // the copy and errors land, then the watcher may uncheck 'same as', then the delivery inputs render
      await nextTick()
      await nextTick()
      await nextTick()
    }

    it('shows the BC error on the mailing address right away and stays checked', async () => {
      const alberta = { region: 'AB', city: 'Calgary', postalCode: 'T2P 1J9' }
      const { wrapper, model } = await mountAddress(alberta, props, false)

      await checkSameAs(model)

      expect(model.sameAs).toBe(true)
      expect(model.deliveryAddress).toEqual({ ...model.mailingAddress, id: 'd1' })
      expect(wrapper.find('#delivery-address-input-street').exists()).toBe(false)
      expect(wrapper.text()).toContain('Address must be in British Columbia')
    })

    it('unchecks again and shows the delivery error when the mailing address is a BC PO Box', async () => {
      const { wrapper, model } = await mountAddress({ street: 'PO Box 234' }, props, false)

      await checkSameAs(model)

      expect(model.sameAs).toBe(false)
      expect(model.deliveryAddress).toEqual({ ...model.mailingAddress, id: 'd1' })
      expect(wrapper.find('#delivery-address-input-street').exists()).toBe(true)
      expect(wrapper.find('[id$="mailing-address-input-street-error"]').exists()).toBe(false)
      expect(wrapper.text()).toContain('Address cannot be a PO Box')
    })

    it('does not flag empty required fields', async () => {
      const { wrapper, model } = await mountAddress({ street: '', city: '', postalCode: '' }, props, false)

      await checkSameAs(model)

      expect(model.sameAs).toBe(true)
      expect(wrapper.vm.formRef?.getErrors()).toEqual([])
    })

    it('stays checked with no errors for a valid BC address', async () => {
      const { wrapper, model } = await mountAddress({}, props, false)

      await checkSameAs(model)

      expect(model.sameAs).toBe(true)
      expect(wrapper.vm.formRef?.getErrors()).toEqual([])
    })

    // the current delivery address does not matter - checking 'same as' replaces it with the mailing address
    it.each([
      ['both addresses in BC', props],
      ['delivery address in BC', { bcCanadaOnly: 'delivery', noPoBox: true } as const]
    ])('%s: stays checked and clears the delivery errors when the mailing address is valid', async (_, rule) => {
      const { wrapper, model } = await mountAddress({}, rule, false)
      model.deliveryAddress = { ...model.deliveryAddress, street: 'PO Box 99', region: 'AB', city: 'Calgary' }
      await submit(wrapper)
      expect(wrapper.vm.formRef?.getErrors().map(e => e.name)).toEqual(
        expect.arrayContaining(['deliveryAddress.street', 'deliveryAddress.region'])
      )

      await checkSameAs(model)

      expect(model.sameAs).toBe(true)
      expect(model.deliveryAddress).toEqual({ ...model.mailingAddress, id: 'd1' })
      expect(wrapper.find('#delivery-address-input-street').exists()).toBe(false)
      expect(wrapper.vm.formRef?.getErrors()).toEqual([])
    })
  })

  it('keeps "same as" checked for a valid BC address', async () => {
    const { wrapper, model } = await mountAddress({}, { bcCanadaOnly: true, noPoBox: true })

    await submit(wrapper)

    expect(model.sameAs).toBe(true)
    expect(wrapper.find('#delivery-address-input-street').exists()).toBe(false)
  })

  describe('taking the user to the delivery error when "same as" unchecks', () => {
    const props = { bcCanadaOnly: true, noPoBox: true } as const
    let scrolled: HTMLElement[]
    let focused: HTMLElement[]

    beforeEach(() => {
      scrolled = []
      focused = []
      // jsdom has no scrollIntoView
      HTMLElement.prototype.scrollIntoView = function (this: HTMLElement) {
        scrolled.push(this)
      }
      vi.spyOn(HTMLElement.prototype, 'focus').mockImplementation(function (this: HTMLElement) {
        focused.push(this)
      })
    })

    afterEach(() => {
      vi.restoreAllMocks()
      // @ts-expect-error - remove the jsdom stub
      delete HTMLElement.prototype.scrollIntoView
    })

    it('scrolls to and focuses the delivery street on submit with a PO Box mailing address', async () => {
      const { wrapper } = await mountAddress({ street: 'PO Box 234' }, props)

      await submit(wrapper)
      await nextTick()

      const street = wrapper.find('#delivery-address-input-street').element
      expect(scrolled).toEqual([street])
      expect(focused).toEqual([street])
    })

    it('scrolls to and focuses the delivery street when checking "same as" with a PO Box mailing address', async () => {
      const { wrapper, model } = await mountAddress({ street: 'PO Box 234' }, props, false)

      model.sameAs = true
      await nextTick()
      await nextTick()
      await nextTick()
      await nextTick()

      const street = wrapper.find('#delivery-address-input-street').element
      expect(scrolled).toEqual([street])
      expect(focused).toEqual([street])
    })

    it('does not move the user when "same as" stays checked', async () => {
      const alberta = { region: 'AB', city: 'Calgary', postalCode: 'T2P 1J9' }
      const { wrapper, model } = await mountAddress(alberta, props)

      await submit(wrapper)
      await nextTick()

      expect(model.sameAs).toBe(true)
      expect(scrolled).toEqual([])
      expect(focused).toEqual([])
    })
  })

  describe('greying out "same as" when the mailing address cannot be the delivery address', () => {
    const sameAsBox = (wrapper: Awaited<ReturnType<typeof mountAddress>>['wrapper']) =>
      wrapper.find('[role="checkbox"]')
    const alberta = { region: 'AB', city: 'Calgary', postalCode: 'T2P 1J9' }

    it('greys it out for a PO Box mailing address', async () => {
      const { wrapper } = await mountAddress({ street: 'PO Box 234' }, { bcCanadaOnly: true, noPoBox: true }, false)

      expect(sameAsBox(wrapper).attributes('disabled')).toBeDefined()
    })

    it('greys it out for a mailing address outside BC when only the delivery address must be in BC', async () => {
      const { wrapper } = await mountAddress(alberta, { bcCanadaOnly: 'delivery', noPoBox: true }, false)

      expect(sameAsBox(wrapper).attributes('disabled')).toBeDefined()
    })

    it('keeps it available when both addresses must be in BC - the mailing error is shared', async () => {
      const { wrapper } = await mountAddress(alberta, { bcCanadaOnly: true, noPoBox: true }, false)

      expect(sameAsBox(wrapper).attributes('disabled')).toBeUndefined()
    })

    it('keeps it available while the mailing province is still empty', async () => {
      const { wrapper } = await mountAddress({ region: '' }, { bcCanadaOnly: 'delivery', noPoBox: true }, false)

      expect(sameAsBox(wrapper).attributes('disabled')).toBeUndefined()
    })

    it('keeps it available while checked, so it can be unchecked', async () => {
      const { wrapper } = await mountAddress({ street: 'PO Box 234' }, { bcCanadaOnly: true, noPoBox: true })

      expect(sameAsBox(wrapper).attributes('disabled')).toBeUndefined()
    })

    it('becomes available again once the mailing address is fixed', async () => {
      const props = { bcCanadaOnly: true, noPoBox: true } as const
      const { wrapper, model } = await mountAddress({ street: 'PO Box 234' }, props, false)
      expect(sameAsBox(wrapper).attributes('disabled')).toBeDefined()

      model.mailingAddress.street = '123 Main St'
      await nextTick()

      expect(sameAsBox(wrapper).attributes('disabled')).toBeUndefined()
    })
  })
})
