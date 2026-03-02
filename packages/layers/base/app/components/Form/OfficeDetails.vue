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
        <FormAddress
          v-if="model"
          ref="address-form"
          v-model="model.address"
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
