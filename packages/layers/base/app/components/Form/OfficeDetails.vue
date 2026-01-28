<script setup lang="ts">
import type { FormErrorEvent } from '@nuxt/ui'

const props = defineProps<{
  variant: 'add' | 'edit'
  name?: string
  title: string
  stateKey: string
}>()

const emit = defineEmits<{
  done: []
  cancel: []
}>()

const { t } = useI18n()
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
    class="bg-white"
    :class="{
      'p-6 rounded shadow': variant === 'add',
      'px-6 py-4': variant === 'edit',
      'border-l-3 border-error': alerts[formTarget]
    }"
    @keydown.enter.prevent.stop="onDone"
  >
    <ConnectFieldset
      :data-testid="formTarget"
      :label="title"
      orientation="horizontal"
      :error="alerts[formTarget] ? { message: alerts[formTarget]! } : undefined"
    >
      <FormAddress
        v-if="model"
        ref="address-form"
        v-model="model.address"
        nested
        name="address"
      />
      <div class="flex flex-col sm:flex-row gap-2 sm:gap-6 justify-end items-center">
        <FormAlertMessage
          :id="messageId"
          :message="alerts[formTarget]"
        />
        <UButton
          :data-alert-focus-target="targetId"
          :aria-describedby="messageId"
          :label="t('label.done')"
          class="w-full sm:w-min justify-center"
          @click="onDone"
        />
        <UButton
          variant="outline"
          :label="t('label.cancel')"
          class="w-full sm:w-min justify-center"
          @click="$emit('cancel')"
        />
      </div>
    </ConnectFieldset>
  </UForm>
</template>
