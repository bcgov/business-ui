<script setup lang="ts">
const props = defineProps<{
  variant: 'add' | 'edit'
  name?: string
  title: string
  allowedActions?: ManageAllowedAction[]
  stateKey: string
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
}>()

const { t } = useI18n()
const { alerts, attachAlerts } = useFilingAlerts(props.stateKey)
const formTarget = 'party-details-form'

type PartyDetails = Pick<PartySchema, 'name' | 'address' | 'roles'>

const model = defineModel<PartyDetails>({ required: true })

const partyNameFormRef = useTemplateRef<FormPartyNameRef>('party-name-form')
const partyRoleFormRef = useTemplateRef<FormPartyRoleRef>('party-role-form')
const addressFormRef = useTemplateRef<AddressFormRef>('address-form')

async function onDone() {
  // need to validate child refs to get input IDs
  const result = await Promise.allSettled([
    partyNameFormRef.value?.formRef?.validate(),
    partyRoleFormRef.value?.formRef?.validate(),
    addressFormRef.value?.formRef?.validate()
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

const { targetId, messageId } = attachAlerts(formTarget, model)
</script>

<template>
  <UForm
    :name
    nested
    :data-testid="formTarget"
    @keydown.enter.prevent.stop="onDone"
  >
    <fieldset>
      <legend class="py-4 px-4 sm:px-8 bg-shade-secondary flex items-center gap-2.5 w-full">
        <UIcon
          name="i-mdi-account-supervisor"
          class="size-6 shrink-0 text-primary"
        />
        <span class="font-semibold text-neutral-highlighted text-base">
          {{ title }}
        </span>
      </legend>
      <div
        class="divide-y divide-shade bg-white"
        :class="{
          'rounded shadow': variant === 'add',
          'border-l-3 border-error': alerts[formTarget]
        }"
      >
        <FormPartyName
          v-if="isNameChangeAllowed"
          ref="party-name-form"
          v-model="model.name"
          v-bind="partyNameProps"
          :state="model.name"
          name="name"
        />
        <FormPartyRole
          v-if="isRoleChangeAllowed && partyRoleProps"
          id="party-role-form"
          ref="party-role-form"
          v-model="model.roles"
          v-bind="partyRoleProps"
          :state="model.roles"
          name="roles"
        />
        <FormAddress
          v-if="isAddressChangeAllowed"
          ref="address-form"
          v-model="model.address"
          :state="model.address"
          nested
          name="address"
        />
      </div>
      <div class="flex flex-col sm:flex-row gap-2 sm:gap-6 justify-end items-center mt-6">
        <FormAlertMessage
          :id="messageId"
          :message="alerts[formTarget]"
        />
        <UButton
          variant="outline"
          :label="t('label.cancel')"
          class="w-full sm:w-min justify-center"
          @click="$emit('cancel')"
        />
        <UButton
          :data-alert-focus-target="targetId"
          :aria-describedby="messageId"
          :label="t('label.done')"
          class="w-full sm:w-min justify-center"
          @click="onDone"
        />
      </div>
    </fieldset>
  </UForm>
</template>
