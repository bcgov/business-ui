<script setup lang="ts">
import type { FormErrorEvent } from '@nuxt/ui'

const props = defineProps<{
  variant: FormVariant
  subject: string
  stateKey: string
  hideRemove?: boolean
  name?: string
}>()

const emit = defineEmits<{
  done: []
  cancel: []
  remove: []
}>()

const { alerts, attachAlerts } = useFilingAlerts(props.stateKey)
const formTarget = 'office-address-form'

const model = defineModel<ActiveOfficesSchema>({ required: true })

const addressFormRef = useTemplateRef<AddressFormRef>('address-form')

async function onDone() {
  try {
    // need to validate child ref to get input IDs
    await addressFormRef.value?.formRef?.validate()
    emit('done')
  } catch (e) {
    onFormSubmitError(e as FormErrorEvent)
  }
}

const { targetId, messageId } = attachAlerts(formTarget, model)
</script>

<template>
  <UForm
    :data-testid="formTarget"
    :name
    nested
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
      <FormAddress
        v-if="model"
        ref="address-form"
        v-model="model.address"
        nested
        name="address"
      />
    </SubFormWrapper>
  </UForm>
</template>
