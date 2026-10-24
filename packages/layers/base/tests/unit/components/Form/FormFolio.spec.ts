import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { FormFolio } from '#components'

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
  it('shows a single folio input when there is no default folio', async () => {
    const { wrapper } = await mountFolio('')

    expect(wrapper.find('#folio-input').exists()).toBe(true)
    expect(wrapper.find('[data-testid="folio-option"]').exists()).toBe(false)
  })

  it('offers the default folio or a different one when there is a default folio', async () => {
    const { wrapper } = await mountFolio(defaultFolio, defaultFolio)

    const options = wrapper.find('[data-testid="folio-option"]')
    expect(options.text()).toContain(`Use Default Folio or Reference Number: ${defaultFolio}`)
    expect(options.text()).toContain('Enter a different number for this transaction only')
    expect(wrapper.find('#folio-input').exists()).toBe(false)
  })

  it('files the number entered for this transaction only', async () => {
    const { wrapper, model } = await mountFolio(defaultFolio, defaultFolio)

    await selectOption(wrapper, 1)
    expect(model.folioNumber).toBe('')

    await wrapper.find('#folio-input').setValue('TXN-1')
    expect(model.folioNumber).toBe('TXN-1')
  })

  it('switches back to the default folio and keeps the entered number for later', async () => {
    const { wrapper, model } = await mountFolio(defaultFolio, defaultFolio)
    await selectOption(wrapper, 1)
    await wrapper.find('#folio-input').setValue('TXN-1')

    await selectOption(wrapper, 0)
    expect(model.folioNumber).toBe(defaultFolio)

    await selectOption(wrapper, 1)
    expect(model.folioNumber).toBe('TXN-1')
  })

  it('starts on the transaction option when a different folio was saved', async () => {
    const { wrapper } = await mountFolio('SAVED-9', defaultFolio)

    expect((wrapper.find('#folio-input').element as HTMLInputElement).value).toBe('SAVED-9')
  })
})
