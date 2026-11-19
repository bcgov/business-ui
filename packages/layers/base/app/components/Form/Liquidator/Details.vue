<script setup lang="ts">
/**
 * Liquidator specific party sub form, rendered by `ManageParties` in place of `FormPartyDetails`
 * when its role type is Liquidator. Captures how the liquidator was appointed (stored on the role's `meta`)
 * and the effective date (the role's `appointmentDate`) alongside the name and addresses.
 */
const props = defineProps<{
  variant: FormVariant
  name?: string
  subject: string
  allowedActions?: ManageAllowedAction[]
  stateKey: string
  hideRemove?: boolean
  partyNameProps?: {
    allowBusinessName?: boolean
    allowPreferredName?: boolean
    requireNameChangeConfirmation?: boolean
    requireFirstName?: boolean
  }
  effectiveDateBounds?: DateBounds
  originalName?: PartyNameSchema
  addressFormProps?: AddressFormProps
}>()

const emit = defineEmits<{
  done: []
  cancel: []
  remove: []
}>()

const { alerts, attachAlerts } = useFilingAlerts(props.stateKey)
const formTarget = 'party-details-form'

type LiquidatorDetails = Pick<PartySchema, 'name' | 'address' | 'roles' | 'email'>

const model = defineModel<LiquidatorDetails>({ required: true })

const partyNameFormRef = useTemplateRef<FormPartyNameRef>('party-name-form')
const appointmentFormRef = useTemplateRef<FormLiquidatorAppointmentRef>('liquidator-appointment-form')
const addressFormRef = useTemplateRef<AddressFormRef>('address-form')
const effectiveDateFormRef = useTemplateRef<FormEffectiveDateRef>('effective-date-form')

const isLiquidatorRole = (role: PartyRoleSchema[number]) => role.roleType === RoleTypeUi.LIQUIDATOR

function updateLiquidatorRole(update: Partial<PartyRoleSchema[number]>) {
  model.value.roles = model.value.roles.map(role => isLiquidatorRole(role) ? { ...role, ...update } : role)
}

const liquidatorRole = computed(() => model.value.roles.find(isLiquidatorRole))

const appointmentModel = computed({
  get: (): LiquidatorRoleMeta => liquidatorRole.value?.meta ?? {},
  set: (meta: LiquidatorRoleMeta) => updateLiquidatorRole({ meta })
})

const effectiveDateModel = computed({
  get: (): EffectiveDateSchema => ({ dateInput: liquidatorRole.value?.appointmentDate ?? '' }),
  set: (val: EffectiveDateSchema) => updateLiquidatorRole({ appointmentDate: val.dateInput })
})

function isAllowedAction(action: ManageAllowedAction) {
  // newly added liquidators allow any edits - existing ones are restricted to the listed actions
  return !props.allowedActions
    || props.variant === 'add'
    || props.variant === 'edit'
    || props.allowedActions.includes(action)
}

const isNameChangeAllowed = computed(() => isAllowedAction(ManageAllowedAction.NAME_CHANGE))
// the appointment method is part of the liquidator role
const isAppointmentChangeAllowed = computed(() =>
  !!liquidatorRole.value && isAllowedAction(ManageAllowedAction.ROLE_CHANGE)
)
const isAddressChangeAllowed = computed(() => isAllowedAction(ManageAllowedAction.ADDRESS_CHANGE))
const isEffectiveDateChangeAllowed = computed(() =>
  !!liquidatorRole.value && isAllowedAction(ManageAllowedAction.EFFECTIVE_DATE_CHANGE)
)

async function onDone() {
  // need to validate child refs to get input IDs
  const result = await Promise.allSettled([
    partyNameFormRef.value?.formRef?.validate(),
    appointmentFormRef.value?.formRef?.validate(),
    addressFormRef.value?.formRef?.validate(),
    effectiveDateFormRef.value?.formRef?.validate()
  ])

  const rejections = result.filter(r => r.status === 'rejected')

  if (rejections.length > 0) {
    const errors = rejections.flatMap(r => r.reason.errors)
    const firstId = errors[0]?.id || rejections[0]!.reason.formId
    if (firstId) {
      const element = document.getElementById(firstId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setTimeout(() => {
          element.focus({ preventScroll: true })
        }, 0)
      }
    }
  } else {
    emit('done')
  }
}

const { targetId, messageId } = attachAlerts(formTarget, model)
</script>

<template>
  <UForm
    :name
    nested
    :data-testid="formTarget"
    @keydown.enter.prevent.stop="onDone"
  >
    <SubFormWrapper
      :subject
      :variant
      :task-guard-config="{
        message: alerts[formTarget],
        messageId,
        targetId
      }"
      :hide-remove
      @done="onDone"
      @cancel="$emit('cancel')"
      @remove="$emit('remove')"
    >
      <template #default>
        <template v-if="isNameChangeAllowed">
          <FormPartyName
            ref="party-name-form"
            v-model="model.name"
            v-bind="partyNameProps"
            :original-name
            :state="model.name"
            name="name"
          />
          <USeparator class="padding-x-default" />
        </template>
        <template v-if="isAppointmentChangeAllowed">
          <FormLiquidatorAppointment
            ref="liquidator-appointment-form"
            v-model="appointmentModel"
          />
          <USeparator class="padding-x-default" />
        </template>
        <FormAddress
          v-if="isAddressChangeAllowed"
          ref="address-form"
          v-model="model.address"
          :state="model.address"
          nested
          name="address"
          v-bind="addressFormProps"
        />
        <template v-if="isEffectiveDateChangeAllowed">
          <USeparator class="padding-x-default" />
          <FormEffectiveDate
            ref="effective-date-form"
            v-model="effectiveDateModel"
            required
            :input-label="$t('label.enterOrSelectDate')"
            :bounds="effectiveDateBounds"
          />
        </template>
      </template>
    </SubFormWrapper>
  </UForm>
</template>
