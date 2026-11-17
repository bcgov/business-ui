/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { FormCourtOrderPoaFields } from '#components'
import type { CourtOrderPoaFullSchema, CourtOrderFileUi } from '#business/app/utils/schemas/court-order-poa'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick, reactive } from 'vue'

const SUPPORTING_DOCS_CHECKBOX = '[data-testid="court-order-add-supporting-docs-checkbox"]'
const SUPPORTING_DOCS_FIELDSET = 'fieldset[aria-label="Supporting Documents Upload"]'
const SUPPORTING_DOCS_ALERT = '#add-supporting-docs-alert'

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

const getSupportingDoc = (overrides: Partial<CourtOrderFileUi> = {}): CourtOrderFileUi => ({
  id: 'supporting-1',
  fileKey: 'CORP-DS0100001004',
  name: 'Affidavit.pdf',
  type: DocumentTypeClient.SUPPORTING_DOCUMENT,
  action: CourtOrderFileAction.NONE,
  status: CourtOrderFileStatus.IDLE,
  ...overrides
})

// the model is reactive as in the app (store / table state) so v-model writes re-render the fields;
// file rows are stubbed - their tooltip needs the UApp provider the unit environment doesn't mount
const mountFields = (props: Record<string, unknown> = {}, modelValue = getModel()) => {
  return mountSuspended(FormCourtOrderPoaFields, {
    props: {
      modelValue: reactive(modelValue),
      isCourtOrder: true,
      entityType: CorpTypeCd.BC_COMPANY,
      filingId: 123,
      identifier: 'BC1234567',
      ...props
    },
    global: { stubs: { FormCourtOrderPoaFullFileUploadItem: true } }
  })
}

describe('FormCourtOrderPoaFields', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should always render the plan of arrangement checkbox and the court order number', async () => {
    const wrapper = await mountFields({ isCourtOrder: false })

    expect(wrapper.find('[data-testid="court-order-poa-checkbox"]').exists()).toBe(true)
    expect(wrapper.find('#court-order-number-input').exists()).toBe(true)
  })

  it('should render the court order number above the plan of arrangement checkbox', async () => {
    const wrapper = await mountFields({ isCourtOrder: false })

    const number = wrapper.find('#court-order-number-input').element
    const poa = wrapper.find('[data-testid="court-order-poa-checkbox"]').element

    expect(number.compareDocumentPosition(poa) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('should render both fields in a single Court Order row', async () => {
    const wrapper = await mountFields({ isCourtOrder: false })

    expect(wrapper.findAll('label').map(label => label.text())).toEqual([
      'Court Order Number',
      'This filing is pursuant to a Plan of Arrangement'
    ])
  })

  it('should not render the order details or the file upload when isCourtOrder is false', async () => {
    const wrapper = await mountFields({ isCourtOrder: false })

    expect(wrapper.find('#court-order-text-input').exists()).toBe(false)
    expect(wrapper.find('[data-testid="court-order-file-upload"]').exists()).toBe(false)
  })

  it('should render the order details textarea and the file upload when isCourtOrder is true', async () => {
    const wrapper = await mountFields()

    expect(wrapper.find('textarea#court-order-text-input').exists()).toBe(true)
    expect(wrapper.find('#court-order-text-input').attributes('maxlength')).toBe('2000')
    // stays user resizable
    expect(wrapper.find('#court-order-text-input').classes()).toContain('resize-y')
    expect(wrapper.find('#court-order-text-input').classes()).not.toContain('resize-none')
    expect(wrapper.find('[data-testid="court-order-file-upload"]').exists()).toBe(true)
  })

  it('should grow the order details textarea to fit its content and never shrink it', async () => {
    const wrapper = await mountFields()
    const textarea = wrapper.find('#court-order-text-input')
    const element = textarea.element as HTMLTextAreaElement
    // jsdom has no layout: fake a 100px tall box (2px of border) whose content needs 300px
    let scrollHeight = 300
    Object.defineProperty(element, 'clientHeight', { configurable: true, get: () => 98 })
    Object.defineProperty(element, 'offsetHeight', { configurable: true, get: () => 100 })
    Object.defineProperty(element, 'scrollHeight', { configurable: true, get: () => scrollHeight })

    await textarea.setValue('pasted text spanning many lines')
    await nextTick()
    expect(element.style.height).toBe('302px')

    // content that fits again leaves the height alone
    scrollHeight = 98
    await textarea.setValue('short')
    await nextTick()
    expect(element.style.height).toBe('302px')
  })

  it('should keep Enter in the order details textarea from reaching the sub-form (Enter = Done there)', async () => {
    const wrapper = await mountFields()
    let reachedParent = false
    wrapper.element.addEventListener('keydown', () => {
      reachedParent = true
    })

    await wrapper.find('#court-order-text-input').trigger('keydown', { key: 'Enter' })

    expect(reachedParent).toBe(false)
  })

  it('should update the model from the court order number input', async () => {
    const model = getModel()
    const wrapper = await mountFields({}, model)

    await wrapper.find('#court-order-number-input').setValue('12345-6789')

    expect(model.fileNumber).toBe('12345-6789')
  })

  it('should store blank order details as null', async () => {
    const model = getModel({ orderDetails: 'Ordered by the court' })
    const wrapper = await mountFields({}, model)

    await wrapper.find('#court-order-text-input').setValue('')

    expect(model.orderDetails).toBeNull()
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

  it('should label the order details input and the document upload as optional by default', async () => {
    const wrapper = await mountFields()

    expect(wrapper.html()).toContain('Court Order Details (Optional)')
    expect(wrapper.html()).toContain('Document Upload (Optional)')
  })

  it('should drop the optional wording from both labels when isFileOrDetailsRequired is true', async () => {
    const wrapper = await mountFields({ isFileOrDetailsRequired: true })

    expect(wrapper.html()).toContain('Court Order Details')
    expect(wrapper.html()).not.toContain('Court Order Details (Optional)')
    expect(wrapper.html()).toContain('Document Upload')
    expect(wrapper.html()).not.toContain('Document Upload (Optional)')
  })

  describe('supporting documents upload (default)', () => {
    it('should always show the supporting documents upload with no checkbox', async () => {
      const wrapper = await mountFields()

      expect(wrapper.find(SUPPORTING_DOCS_CHECKBOX).exists()).toBe(false)
      expect(wrapper.find(SUPPORTING_DOCS_FIELDSET).exists()).toBe(true)
    })
  })

  describe('add supporting documents checkbox (supportingDocsCheckbox variant)', () => {
    const variant = { supportingDocsCheckbox: true }

    it('should hide the supporting documents upload until the checkbox is checked', async () => {
      const model = getModel()
      const wrapper = await mountFields(variant, model)

      expect(wrapper.find(SUPPORTING_DOCS_CHECKBOX).exists()).toBe(true)
      expect(wrapper.find(SUPPORTING_DOCS_FIELDSET).exists()).toBe(false)

      await wrapper.find(SUPPORTING_DOCS_CHECKBOX).trigger('click')
      await nextTick()

      expect(model.hasSupportingDocs).toBe(true)
      expect(wrapper.find(SUPPORTING_DOCS_FIELDSET).exists()).toBe(true)
    })

    it('should render the supporting documents upload checked when the model has the flag set', async () => {
      const wrapper = await mountFields(variant, getModel({ hasSupportingDocs: true }))

      expect(wrapper.find(SUPPORTING_DOCS_CHECKBOX).attributes('aria-checked')).toBe('true')
      expect(wrapper.find(SUPPORTING_DOCS_FIELDSET).exists()).toBe(true)
    })

    it('should disable the checkbox while an active supporting document exists', async () => {
      const wrapper = await mountFields(variant, getModel({ hasSupportingDocs: true, files: [getSupportingDoc()] }))

      expect(wrapper.find(SUPPORTING_DOCS_CHECKBOX).attributes('disabled')).toBeDefined()
    })

    it('should keep the checkbox enabled when the only supporting document is deleted', async () => {
      const wrapper = await mountFields(variant, getModel({
        hasSupportingDocs: true,
        files: [getSupportingDoc({ action: CourtOrderFileAction.DELETED })]
      }))

      expect(wrapper.find(SUPPORTING_DOCS_CHECKBOX).attributes('disabled')).toBeUndefined()
    })

    it('should not share an id between the checkbox and the supporting documents file input', async () => {
      const wrapper = await mountFields(variant, getModel({ hasSupportingDocs: true }))

      const checkboxId = wrapper.find(SUPPORTING_DOCS_CHECKBOX).attributes('id')
      const fileInputIds = wrapper.findAll('input[type="file"]').map(input => input.attributes('id'))

      expect(checkboxId).toBeTruthy()
      expect(fileInputIds).not.toContain(checkboxId)
    })

    it('should show the error under the upload button and link it to the checkbox', async () => {
      const wrapper = await mountFields(
        { ...variant, supportingDocsError: 'Add Supporting Documents or uncheck the box above' },
        getModel({ hasSupportingDocs: true })
      )

      const alert = wrapper.find(SUPPORTING_DOCS_ALERT)
      expect(alert.attributes('role')).toBe('alert')
      expect(alert.text()).toBe('Add Supporting Documents or uncheck the box above')
      // the box and its label stay neutral, the message alone marks the error
      expect(wrapper.find(SUPPORTING_DOCS_CHECKBOX).attributes('aria-invalid')).toBeUndefined()
      expect(wrapper.find(SUPPORTING_DOCS_CHECKBOX).attributes('aria-describedby')).toBe('add-supporting-docs-alert')
    })

    it('should not show an error when none is passed', async () => {
      const wrapper = await mountFields(variant, getModel({ hasSupportingDocs: true }))

      expect(wrapper.find(SUPPORTING_DOCS_ALERT).exists()).toBe(false)
      expect(wrapper.find(SUPPORTING_DOCS_CHECKBOX).attributes('aria-describedby')).toBeUndefined()
    })
  })

  it('should use the sub-form row spacing for the subform variant', async () => {
    const wrapper = await mountFields({ variant: 'subform' })

    expect(wrapper.html()).toContain('py-6 sm:py-10')
    expect(wrapper.find('div').classes()).not.toContain('flex')
  })

  it('should use the page section layout for the section variant (default)', async () => {
    const wrapper = await mountFields()

    expect(wrapper.find('div').classes()).toEqual(['flex', 'flex-col'])
    expect(wrapper.html()).not.toContain('py-6 sm:py-10')
  })
})
