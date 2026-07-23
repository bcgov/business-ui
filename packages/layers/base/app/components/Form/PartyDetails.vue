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

type PartyDetails = Pick<PartySchema, 'name' | 'address' | 'roles'>

const model = defineModel<PartyDetails>({ required: true })

const partyNameFormRef = useTemplateRef<FormPartyNameRef>('party-name-form')
const partyRoleFormRef = useTemplateRef<FormPartyRoleRef>('party-role-form')
const addressFormRef = useTemplateRef<AddressFormRef>('address-form')
const effectiveDateFormRef = useTemplateRef<FormEffectiveDateRef>('effective-date-form')

const directorRole = computed(() => model.value.roles.find(role => role.roleType === RoleTypeUi.DIRECTOR))

const effectiveDateModel = computed({
  get: (): EffectiveDateSchema => ({ effectiveDate: directorRole.value?.appointmentDate ?? '' }),
  set: (val: EffectiveDateSchema) => {
    if (directorRole.value) {
      directorRole.value.appointmentDate = val.effectiveDate
    }
  }
})

async function onDone() {
  // need to validate child refs to get input IDs
  const result = await Promise.allSettled([
    partyNameFormRef.value?.formRef?.validate(),
    partyRoleFormRef.value?.formRef?.validate(),
    addressFormRef.value?.formRef?.validate(),
    isDirectorRole.value ? effectiveDateFormRef.value?.formRef?.validate() : undefined
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
const isDirectorRole = computed(() => !!directorRole.value)

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
        <template v-if="isDirectorRole">
          <USeparator class="padding-x-default" />
          <FormEffectiveDate
            ref="effective-date-form"
            v-model="effectiveDateModel"
            name="effectiveDate"
          />
          <USeparator class="padding-x-default mb-8" />
        </template>
      </template>
    </SubFormWrapper>
  </UForm>
</template>
