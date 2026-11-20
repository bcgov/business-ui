import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { describe, it, expect, vi } from 'vitest'
import { FormLiquidatorDetails } from '#components'

mockNuxtImport('useFilingAlerts', () => () => ({
  alerts: reactive<Record<string, string>>({}),
  setAlert: vi.fn(),
  clearAlert: vi.fn(),
  attachAlerts: vi.fn(() => ({ targetId: 'target-id', messageId: 'message-id' }))
}))

const LiquidatorAppointmentStub = defineComponent({
  name: 'FormLiquidatorAppointment',
  props: { modelValue: Object },
  emits: ['update:modelValue'],
  template: '<div data-testid="appointment-stub" />'
})
const EffectiveDateStub = defineComponent({
  name: 'FormEffectiveDate',
  props: { modelValue: Object, bounds: Object, required: Boolean },
  emits: ['update:modelValue'],
  template: '<div data-testid="effective-date-stub" />'
})

const stubs = {
  FormPartyName: defineComponent({ name: 'FormPartyName', template: '<div data-testid="name-stub" />' }),
  FormAddress: defineComponent({ name: 'FormAddress', template: '<div data-testid="address-stub" />' }),
  FormLiquidatorAppointment: LiquidatorAppointmentStub,
  FormEffectiveDate: EffectiveDateStub
}

const newModel = () => getPartySchema(RoleTypeUi.LIQUIDATOR).parse({})

async function mountComponent(props: Record<string, unknown> = {}, model = newModel()) {
  const state = { value: model }
  const wrapper = await mountSuspended(FormLiquidatorDetails, {
    props: {
      'variant': 'add',
      'subject': 'Liquidator',
      'stateKey': 'manage-parties',
      'modelValue': state.value,
      'onUpdate:modelValue': (val: Pick<PartySchema, 'name' | 'address' | 'roles' | 'email'>) => {
        state.value = { ...state.value, ...val }
      },
      ...props
    },
    global: { stubs }
  })
  return { wrapper, state }
}

describe('FormLiquidatorDetails', () => {
  it('renders name, appointment, address and effective date sections for a new liquidator', async () => {
    const { wrapper } = await mountComponent()
    const order = wrapper.findAll('[data-testid$="-stub"]').map(el => el.attributes('data-testid'))
    expect(order).toEqual(['name-stub', 'appointment-stub', 'address-stub', 'effective-date-stub'])
  })

  it('requires the effective date and passes the bounds through', async () => {
    const bounds = { max: { date: '2026-11-17' } }
    const { wrapper } = await mountComponent({ effectiveDateBounds: bounds })
    const effectiveDate = wrapper.findComponent(EffectiveDateStub)
    expect(effectiveDate.props('required')).toBe(true)
    expect(effectiveDate.props('bounds')).toEqual(bounds)
  })

  it('only shows the address for an existing liquidator in an address change', async () => {
    const { wrapper } = await mountComponent({
      variant: 'change',
      allowedActions: [ManageAllowedAction.ADDRESS_CHANGE]
    })
    const sections = wrapper.findAll('[data-testid$="-stub"]').map(el => el.attributes('data-testid'))
    expect(sections).toEqual(['address-stub'])
  })

  it('stores the appointment method and effective date on the liquidator role', async () => {
    const { wrapper, state } = await mountComponent()

    const meta = { appointmentMethod: LiquidatorAppointmentMethod.COURT, courtOrderNumber: 'S-12345' }
    wrapper.findComponent(LiquidatorAppointmentStub).vm.$emit('update:modelValue', meta)
    wrapper.findComponent(EffectiveDateStub).vm.$emit('update:modelValue', { dateInput: '2026-11-01' })
    await nextTick()

    expect(state.value.roles).toEqual([
      { roleType: RoleTypeUi.LIQUIDATOR, meta, appointmentDate: '2026-11-01' }
    ])
  })
})
