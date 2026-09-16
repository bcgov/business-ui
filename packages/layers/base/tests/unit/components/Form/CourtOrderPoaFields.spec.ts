/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { FormCourtOrderPoaFields } from '#components'
import type { CourtOrderPoaFullSchema } from '#business/app/utils/schemas/court-order-poa'

const getModel = (overrides: Partial<CourtOrderPoaFullSchema> = {}): CourtOrderPoaFullSchema => ({
  isEditing: false,
  actions: [],
  id: 'court-order-1',
  fileNumber: '',
  effectOfOrder: false,
  orderDetails: null,
  filingId: 123,
  files: [],
  ...overrides
})

const mountFields = (props: Record<string, unknown> = {}, modelValue = getModel()) => {
  return mountSuspended(FormCourtOrderPoaFields, {
    props: {
      modelValue,
      isCourtOrder: true,
      entityType: CorpTypeCd.BC_COMPANY,
      filingId: 123,
      identifier: 'BC1234567',
      ...props
    }
  })
}

describe('FormCourtOrderPoaFields', () => {
  it('should always render the plan of arrangement checkbox and the court order number', async () => {
    const wrapper = await mountFields({ isCourtOrder: false })

    expect(wrapper.find('[data-testid="court-order-poa-checkbox"]').exists()).toBe(true)
    expect(wrapper.find('#court-order-number-input').exists()).toBe(true)
  })

  it('should not render the order details or the file upload when isCourtOrder is false', async () => {
    const wrapper = await mountFields({ isCourtOrder: false })

    expect(wrapper.find('#court-order-text-input').exists()).toBe(false)
    expect(wrapper.find('[data-testid="court-order-file-upload"]').exists()).toBe(false)
  })

  it('should render the order details and the file upload when isCourtOrder is true', async () => {
    const wrapper = await mountFields()

    expect(wrapper.find('#court-order-text-input').exists()).toBe(true)
    expect(wrapper.find('[data-testid="court-order-file-upload"]').exists()).toBe(true)
  })

  it('should update the model from the court order number input', async () => {
    const model = getModel()
    const wrapper = await mountFields({}, model)

    await wrapper.find('#court-order-number-input').setValue('12345-6789')

    expect(model.fileNumber).toBe('12345-6789')
  })

  it('should emit poa-change when the plan of arrangement checkbox is toggled', async () => {
    const wrapper = await mountFields()

    await wrapper.find('[data-testid="court-order-poa-checkbox"]').trigger('click')

    expect(wrapper.emitted('poa-change')).toHaveLength(1)
  })

  it('should expose the file upload ref so the sub-form can clean up files on cancel', async () => {
    const wrapper = await mountFields()

    expect((wrapper.vm as any).fileUploadRef?.cleanupFilesOnSessionCancel).toBeTypeOf('function')
  })

  it('should use the sub-form field spacing for the subform variant', async () => {
    const wrapper = await mountFields({ variant: 'subform' })

    expect(wrapper.html()).toContain('pt-6 sm:pt-10 pb-3 sm:pb-5')
    expect(wrapper.html()).not.toContain('flex flex-col gap-6 py-6')
  })

  it('should use the page section layout for the section variant (default)', async () => {
    const wrapper = await mountFields()

    expect(wrapper.html()).toContain('flex flex-col gap-6 py-6')
    expect(wrapper.html()).not.toContain('pt-6 sm:pt-10 pb-3 sm:pb-5')
  })
})
