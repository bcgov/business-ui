import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { describe, expect, it, beforeEach } from 'vitest'
import { FormFolio } from '#components'

const storeFolio = { value: '' }
mockNuxtImport('useConnectAccountStore', () => () => ({ currentAccount: { id: 3602 } }))
mockNuxtImport('useBusinessStore', () => () => ({
  business: { identifier: 'BC1234567', legalType: 'BC' },
  get businessFolio() {
    return storeFolio.value
  }
}))

const defaultFolio = '777555222'

async function mountFolio(folioNumber: string, defaultFolioProp?: string) {
  const model = reactive<FolioSchema>({ folioNumber })
  const wrapper = await mountSuspended(FormFolio, {
    props: { modelValue: model, name: 'folio', defaultFolio: defaultFolioProp }
  })
  return { wrapper, model }
}

async function selectOption(wrapper: Awaited<ReturnType<typeof mountFolio>>['wrapper'], index: 0 | 1) {
  await wrapper.findAll('[role="radio"]')[index]!.trigger('click')
  await nextTick()
}

describe('FormFolio', () => {
  beforeEach(() => {
    storeFolio.value = ''
  })

  it('shows a single folio input when the business has no folio on file', async () => {
    const { wrapper } = await mountFolio('')

    expect(wrapper.find('#folio-input').exists()).toBe(true)
    expect(wrapper.find('[data-testid="folio-option"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Folio or Reference Number (Optional)')
    expect(wrapper.text()).toContain('You can use a unique reference number to help keep your transactions organized.')
    expect(wrapper.text()).toContain('This number will appear on your receipt and will be linked to this transaction.')
  })

  it('offers help with folio numbers in both states', async () => {
    const { wrapper: noDefault } = await mountFolio('')
    expect(noDefault.text()).toContain('Help with Folio or Reference Numbers')

    const { wrapper: withDefault } = await mountFolio(defaultFolio, defaultFolio)
    expect(withDefault.text()).toContain('Help with Folio or Reference Numbers')
  })

  it('explains folio numbers and links to the edit UI when the business has no folio on file', async () => {
    const { wrapper } = await mountFolio('')
    await wrapper.find('button').trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('What is a folio or reference number?')
    expect(wrapper.text()).toContain('Where does this number appear?')
    expect(wrapper.text()).toContain('Is there a way to use the same number for all transactions')
    const link = wrapper.find('[data-testid="folio-help-edit-link"]')
    expect(link.text()).toBe('View and Change Business Information')
    expect(link.attributes('href')).toBe('http://edit/BC1234567/alteration?accountid=3602&businessid=BC1234567')
    expect(link.attributes('target')).toBe('_blank')
  })

  it('explains the default folio when the business has a folio on file', async () => {
    const { wrapper } = await mountFolio(defaultFolio, defaultFolio)
    await wrapper.find('button').trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('What is a default folio or reference number?')
    expect(wrapper.text()).toContain('What if I enter a different number for this transaction only?')
    expect(wrapper.text()).toContain('How do I change my default folio or reference number?')
    expect(wrapper.find('[data-testid="folio-help-edit-link"]').exists()).toBe(true)
  })

  it('offers the default folio or a different one when the business has a folio on file', async () => {
    const { wrapper } = await mountFolio(defaultFolio, defaultFolio)

    const options = wrapper.find('[data-testid="folio-option"]')
    expect(options.text()).toContain(`Use Default Folio or Reference Number: ${defaultFolio}`)
    expect(options.text()).toContain('Enter a different number for this transaction only')
    expect(wrapper.find('#folio-input').exists()).toBe(false)
  })

  it('uses the business store folio when no default is passed', async () => {
    storeFolio.value = 'STORE-1'
    const { wrapper } = await mountFolio('')

    expect(wrapper.find('[data-testid="folio-option"]').text()).toContain('STORE-1')
    expect(wrapper.find('#folio-input').exists()).toBe(false)
  })

  it('does not change the model until an option is picked', async () => {
    const { model } = await mountFolio('', defaultFolio)

    expect(model.folioNumber).toBe('')
  })

  it('files the number entered for this transaction only', async () => {
    const { wrapper, model } = await mountFolio(defaultFolio, defaultFolio)

    await selectOption(wrapper, 1)
    expect(model.folioNumber).toBe('')

    await wrapper.find('#folio-input').setValue('TXN-1')
    expect(model.folioNumber).toBe('TXN-1')
  })

  it('returns to the default folio when the first option is selected again', async () => {
    const { wrapper, model } = await mountFolio(defaultFolio, defaultFolio)
    await selectOption(wrapper, 1)
    await wrapper.find('#folio-input').setValue('TXN-1')

    await selectOption(wrapper, 0)
    expect(model.folioNumber).toBe(defaultFolio)
    expect(wrapper.find('#folio-input').exists()).toBe(false)

    await selectOption(wrapper, 1)
    expect(model.folioNumber).toBe('')
  })

  it('marks the section optional and uses the design description when the business folio is offered', async () => {
    const { wrapper } = await mountFolio(defaultFolio, defaultFolio)

    expect(wrapper.text()).toContain('Folio or Reference Number (Optional)')
    expect(wrapper.text()).toContain('linked to this transaction. It is meant for your own tracking purposes.')
    expect(wrapper.text()).not.toContain('You can use a unique reference number')
  })

  it('shows the entered number when the model is filled after mount, e.g. a resumed draft', async () => {
    const { wrapper, model } = await mountFolio('', defaultFolio)
    expect(wrapper.find('#folio-input').exists()).toBe(false)

    model.folioNumber = 'DRAFT-1'
    await nextTick()
    await nextTick()

    expect((wrapper.find('#folio-input').element as HTMLInputElement).value).toBe('DRAFT-1')
  })

  it('stays on the transaction option while the entered number is cleared', async () => {
    const { wrapper, model } = await mountFolio('', defaultFolio)
    await selectOption(wrapper, 1)
    await wrapper.find('#folio-input').setValue('TXN-1')
    await wrapper.find('#folio-input').setValue('')
    await nextTick()

    expect(model.folioNumber).toBe('')
    expect(wrapper.find('#folio-input').exists()).toBe(true)
  })

  it('starts on the transaction option when a different folio was saved', async () => {
    const { wrapper } = await mountFolio('SAVED-9', defaultFolio)

    expect((wrapper.find('#folio-input').element as HTMLInputElement).value).toBe('SAVED-9')
  })
})
