import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'
import { FormPartyDetails } from '#components'

mockNuxtImport('useFilingAlerts', () => () => ({
  alerts: reactive<Record<string, string>>({}),
  setAlert: vi.fn(),
  clearAlert: vi.fn(),
  attachAlerts: vi.fn(() => ({ targetId: 'target-id', messageId: 'message-id' }))
}))

const stubs = {
  FormPartyName: true,
  FormPartyRole: true,
  FormAddress: true,
  FormPartyEmail: true,
  FormEffectiveDate: true,
  FormEffectiveDateRange: true,
  USeparator: true
}

const address = { street: '123 Main St', city: 'Victoria', country: 'CA', region: 'BC', postalCode: 'V1X 1X1' }

function mountForm(props: Record<string, unknown> = {}) {
  return mountSuspended(FormPartyDetails, {
    props: {
      modelValue: {
        name: {
          partyType: PartyType.PERSON,
          firstName: 'ADA',
          middleName: '',
          lastName: 'LOVELACE',
          hasPreferredName: false,
          businessName: ''
        },
        address: { deliveryAddress: address, mailingAddress: address, sameAs: true },
        roles: [{ roleType: RoleTypeUi.DIRECTOR }],
        email: ''
      },
      variant: 'add',
      subject: 'Director',
      stateKey: 'test-state',
      ...props
    },
    global: { stubs }
  })
}

describe('FormPartyDetails', () => {
  it('should render the sub form header with its Cancel button by default', async () => {
    const wrapper = await mountForm()

    const legend = wrapper.find('legend')
    expect(legend.classes()).not.toContain('sr-only')
    expect(legend.text()).toContain('Adding Director')
    expect(legend.findAll('button').some(b => b.text().includes('Cancel'))).toBe(true)
  })

  it('should keep the header for screen readers only when container is false', async () => {
    const wrapper = await mountForm({ container: false })

    expect(wrapper.find('legend').classes()).toContain('sr-only')
  })

  it('should pass showReset, resetDisabled and doneFirst through to the wrapper', async () => {
    const wrapper = await mountForm({ showReset: true, resetDisabled: true, doneFirst: true })

    const reset = wrapper.find('[data-testid="subform-reset-btn"]')
    expect(reset.exists()).toBe(true)
    expect(reset.attributes('disabled')).toBeDefined()
    const cancel = wrapper.findAll('button').filter(b => b.text() === 'Cancel').at(-1)
    expect(cancel?.classes()).toContain('order-last')
  })
})
