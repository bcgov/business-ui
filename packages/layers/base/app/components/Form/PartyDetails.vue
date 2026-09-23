<script setup lang="ts">
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
  }
  partyRoleProps?: {
    allowedRoles: RoleTypeUi[]
    roleClass?: RoleClass
  }
}>()

const emit = defineEmits<{
  done: []
  cancel: []
  remove: []
}>()

const { alerts, attachAlerts } = useFilingAlerts(props.stateKey)
const formTarget = 'party-details-form'

type PartyDetails = Pick<PartySchema, 'name' | 'address' | 'roles' | 'email'>

const model = defineModel<PartyDetails>({ required: true })

const partyNameFormRef = useTemplateRef<FormPartyNameRef>('party-name-form')
const partyRoleFormRef = useTemplateRef<FormPartyRoleRef>('party-role-form')
const addressFormRef = useTemplateRef<AddressFormRef>('address-form')
const partyEmailFormRef = useTemplateRef<FormPartyEmailRef>('party-email-form')
const effectiveDateFormRef = useTemplateRef<FormEffectiveDateRef>('effective-date-form')
const effectiveDateRangeFormRef = useTemplateRef<FormEffectiveDateRangeRef>('effective-date-range-form')

function rolesWithField<K extends keyof RoleFieldConfig>(field: K) {
  return model.value.roles.filter(role => ROLE_FIELD_CONFIG[role.roleType]?.[field])
}

const rolesWithEffectiveDate = computed(() => rolesWithField('effectiveDate'))
const rolesWithEmail = computed(() => rolesWithField('email'))
const rolesEligibleForCessationDate = computed(() => rolesWithField('cessationDate'))
const rolesWithCessationDate = computed(() => rolesEligibleForCessationDate.value.filter(role => !!role.cessationDate))

const effectiveDateModel = computed({
  get: (): EffectiveDateSchema => ({ dateInput: rolesWithEffectiveDate.value[0]?.appointmentDate ?? '' }),
  set: (val: EffectiveDateSchema) => {
    model.value.roles = model.value.roles.map(role =>
      ROLE_FIELD_CONFIG[role.roleType]?.effectiveDate
        ? { ...role, appointmentDate: val.dateInput }
        : role
    )
  }
})

const cessationDateModel = computed({
  get: (): EffectiveDateSchema => ({ dateInput: rolesEligibleForCessationDate.value[0]?.cessationDate ?? '' }),
  set: (val: EffectiveDateSchema) => {
    model.value.roles = model.value.roles.map(role =>
      ROLE_FIELD_CONFIG[role.roleType]?.cessationDate
        ? { ...role, cessationDate: val.dateInput || null }
        : role
    )
  }
})

async function onDone() {
  // need to validate child refs to get input IDs
  const result = await Promise.allSettled([
    partyNameFormRef.value?.formRef?.validate(),
    partyRoleFormRef.value?.formRef?.validate(),
    addressFormRef.value?.formRef?.validate(),
    partyEmailFormRef.value?.formRef?.validate(),
    useEffectiveDateRange.value
      ? effectiveDateRangeFormRef.value?.startFormRef?.validate()
      : isEffectiveDateVisibleForRole.value && isEffectiveDateChangeAllowed.value
        ? effectiveDateFormRef.value?.formRef?.validate()
        : undefined,
    useEffectiveDateRange.value
      ? effectiveDateRangeFormRef.value?.endFormRef?.validate()
      : undefined
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

function isAllowedAction(action: ManageAllowedAction) {
  return !props.allowedActions
    || props.allowedActions.includes(ManageAllowedAction.ADD) // allow any edits if newly added party
    || props.allowedActions.includes(action)
}

const isNameChangeAllowed = computed(() => isAllowedAction(ManageAllowedAction.NAME_CHANGE))
const isRoleChangeAllowed = computed(() => isAllowedAction(ManageAllowedAction.ROLE_CHANGE))
const isAddressChangeAllowed = computed(() => isAllowedAction(ManageAllowedAction.ADDRESS_CHANGE))
const isEmailChangeAllowed = computed(() => isAllowedAction(ManageAllowedAction.EMAIL_CHANGE))
const isEffectiveDateChangeAllowed = computed(() => isAllowedAction(ManageAllowedAction.EFFECTIVE_DATE_CHANGE))
const isEffectiveDateVisibleForRole = computed(() => rolesWithEffectiveDate.value.length > 0)
const isEffectiveDateRequiredForRole = computed(() =>
  rolesWithEffectiveDate.value.some(
    role => ROLE_FIELD_CONFIG[role.roleType]?.effectiveDate === RoleFieldRequirement.REQUIRED
  )
)
const isCessationDateChangeAllowed = computed(() => isAllowedAction(ManageAllowedAction.CESSATION_DATE_CHANGE))
// this form never creates a cessation date from scratch - it's set by ceasing the role
// (unchecking it) elsewhere, so the section only needs to track the role's current value
const isCessationDateVisibleForRole = computed(() => rolesWithCessationDate.value.length > 0)
const isCessationDateRequiredForRole = computed(() =>
  rolesEligibleForCessationDate.value.some(
    role => ROLE_FIELD_CONFIG[role.roleType]?.cessationDate === RoleFieldRequirement.REQUIRED
  )
)

// once a role has both an effective date and a cessation date section, show them together
// as a single Start Date/End Date range instead of two separately-labelled sections
const useEffectiveDateRange = computed(() =>
  isEffectiveDateVisibleForRole.value
  && isCessationDateVisibleForRole.value
  && isEffectiveDateChangeAllowed.value
  && isCessationDateChangeAllowed.value
)
const effectiveDateRangeDescription = computed(() => {
  const roleType = rolesEligibleForCessationDate.value[0]?.roleType
  const roleLabel = roleType ? $t(`roleType.${roleType}`).toLowerCase() : ''
  return $t('text.effectiveDateRangeDescription', { role: roleLabel, boldStart: '<strong>', boldEnd: '</strong>' })
})
const isEmailVisibleForRole = computed(() => rolesWithEmail.value.length > 0)
const isEmailRequiredForRole = computed(() =>
  rolesWithEmail.value.some(
    role => ROLE_FIELD_CONFIG[role.roleType]?.email === RoleFieldRequirement.REQUIRED
  )
)

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
        <FormPartyName
          v-if="isNameChangeAllowed"
          ref="party-name-form"
          v-model="model.name"
          v-bind="partyNameProps"
          :state="model.name"
          name="name"
        />
        <USeparator v-if="isNameChangeAllowed" class="padding-x-default" />
        <FormPartyRole
          v-if="isRoleChangeAllowed && partyRoleProps"
          id="party-role-form"
          ref="party-role-form"
          v-model="model.roles"
          v-bind="partyRoleProps"
          :state="model.roles"
          name="roles"
        />
        <USeparator v-if="isRoleChangeAllowed && partyRoleProps" class="padding-x-default" />
        <FormAddress
          v-if="isAddressChangeAllowed"
          ref="address-form"
          v-model="model.address"
          :state="model.address"
          nested
          name="address"
        />
        <template v-if="isEmailVisibleForRole && isEmailChangeAllowed">
          <USeparator class="padding-x-default" />
          <FormPartyEmail
            ref="party-email-form"
            v-model="model.email"
            :required="isEmailRequiredForRole"
          />
        </template>
        <template v-if="useEffectiveDateRange">
          <USeparator class="padding-x-default" />
          <FormEffectiveDateRange
            ref="effective-date-range-form"
            v-model:start="effectiveDateModel"
            v-model:end="cessationDateModel"
            :start-required="isEffectiveDateRequiredForRole"
            :end-required="isCessationDateRequiredForRole"
            :description="effectiveDateRangeDescription"
          />
        </template>
        <template v-else-if="isEffectiveDateVisibleForRole && isEffectiveDateChangeAllowed">
          <USeparator class="padding-x-default" />
          <FormEffectiveDate
            ref="effective-date-form"
            v-model="effectiveDateModel"
            :required="isEffectiveDateRequiredForRole"
          />
        </template>
      </template>
    </SubFormWrapper>
  </UForm>
</template>
