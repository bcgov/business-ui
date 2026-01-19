<script setup lang="ts">
const props = defineProps<{
  variant: 'add' | 'edit'
  name?: string
  title: string
  allowedActions?: ManageAllowedAction[]
}>()

const emit = defineEmits<{
  done: []
  cancel: []
}>()

const { t } = useI18n()

type PartyDetails = Pick<PartyStateBase, 'name' | 'address'>

const model = defineModel<PartyDetails>({ required: true })

const partyNameFormRef = useTemplateRef<FormPartyNameRef>('party-name-form')
const addressFormRef = useTemplateRef<AddressFormRef>('address-form')

async function onDone() {
  // need to validate child refs to get input IDs
  const result = await Promise.allSettled([
    partyNameFormRef.value?.formRef?.validate(),
    addressFormRef.value?.formRef?.validate()
  ])

  const rejections = result.filter(r => r.status === 'rejected')

  if (rejections.length > 0) {
    const errors = rejections.flatMap(r => r.reason.errors)
    const firstId = errors[0]?.id
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
const isAddressChangeAllowed = computed(() => isAllowedAction(ManageAllowedAction.ADDRESS_CHANGE))
</script>

<template>
  <UForm
    :name
    nested
    class="bg-white"
    :class="{
      'p-6 rounded shadow': variant === 'add',
      'pl-2 py-2 pr-6': variant === 'edit'
    }"
    @keydown.enter.prevent.stop="onDone"
  >
    <ConnectFieldset
      data-testid="party-details-form"
      :label="title"
      orientation="horizontal"
    >
      <div class="space-y-4">
        <FormPartyName
          v-if="isNameChangeAllowed"
          ref="party-name-form"
          v-model="model.name"
          :state="model.name"
          name="name"
        />
        <FormAddress
          v-if="isAddressChangeAllowed"
          ref="address-form"
          v-model="model.address"
          :state="model.address"
          nested
          name="address"
        />
        <div class="flex gap-6 justify-end">
          <UButton
            :label="t('label.done')"
            @click="onDone"
          />
          <UButton
            variant="outline"
            :label="t('label.cancel')"
            @click="$emit('cancel')"
          />
        </div>
      </div>
    </ConnectFieldset>
  </UForm>
</template>
