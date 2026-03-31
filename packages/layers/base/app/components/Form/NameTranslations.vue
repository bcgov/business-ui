<script setup lang="ts">
import type { Form, FormErrorEvent } from '@nuxt/ui'

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
const formTarget = 'name-translation-form'
const schema = getNameTranslationSchema()

const model = defineModel<NameTranslationSchema>({ required: true })
const formRef = useTemplateRef<Form<NameTranslationSchema>>('name-translation-form')

async function onDone() {
  try {
    await formRef.value?.validate()
    emit('done')
  } catch (e) {
    onFormSubmitError(e as FormErrorEvent)
  }
}

const { targetId, messageId } = attachAlerts(formTarget, model)
const labelId = useId()
</script>

<template>
  <UForm
    ref="name-translation-form"
    :data-testid="formTarget"
    :schema
    :name
    nested
    :state="model as any"
    @keydown.enter.prevent.stop="onDone"
  >
    <fieldset :aria-labelledby="labelId">
      <legend
        class="py-4 px-4 sm:px-8 flex justify-between items-center gap-2.5 w-full"
        :class="{
          'bg-shade-secondary text-neutral-highlighted': variant === 'add',
          'bg-primary text-white': variant === 'edit'
        }"
      >
        <div class="flex items-center gap-2.5">
          <UIcon
            :name="variant === 'add' ? 'i-mdi-domain' : 'i-mdi-edit'"
            class="size-6 shrink-0"
            :class="variant === 'add' ? 'text-primary' : 'text-white'"
          />
          <span :id="labelId" class="font-semibold text-base">
            {{ title }}
          </span>
        </div>
        <UButton
          v-if="variant === 'edit'"
          :label="$t('label.cancel')"
          class="font-normal p-0"
          trailing-icon="i-mdi-close"
          @mousedown.prevent
          @click="$emit('cancel')"
        />
      </legend>
      <div
        :class="{
          'border border-gray-200': variant === 'edit',
          'rounded shadow': variant === 'add',
          'border-l-3 border-error': alerts[formTarget]
        }"
      >
        <ConnectFormFieldWrapper
          :label="t('label.translationName')"
          padding-class="xy-default"
        >
          <ConnectFormInput
            v-if="model"
            v-model="model.name"
            required
            :label="t('label.translationName')"
            input-id="name-translation-input"
            name="name"
          />
        </ConnectFormFieldWrapper>
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
          @mousedown.prevent
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
