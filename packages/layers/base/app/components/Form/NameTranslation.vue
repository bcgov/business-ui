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
  remove: []
}>()

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
        v-if="variant === 'edit'"
        class="py-4 px-4 sm:px-8 flex justify-between items-center gap-2.5 w-full bg-primary text-white"
      >
        <div class="flex items-center gap-2.5">
          <span :id="labelId" class="font-semibold text-base">
            {{ title }}
          </span>
        </div>
      </legend>
      <span
        v-else
        :id="labelId"
        class="sr-only"
      >{{ title }}</span>
      <div
        class="mt-4"
      >
        <ConnectFormInput
          v-if="model"
          v-model="model.name"
          required
          autofocus
          :label="$t('label.nameTranslation')"
          input-id="name-translation-input"
          name="name"
          :help="$t('text.latinAlphabetOnly')"
        />
      </div>
      <div
        class="flex flex-col sm:flex-row gap-2 sm:gap-6 items-center mt-6"
        :class="variant === 'edit' ? 'justify-between' : 'justify-end'"
      >
        <UButton
          v-if="variant === 'edit'"
          variant="outline"
          color="error"
          :label="$t('label.remove')"
          class="w-full sm:w-min justify-center"
          @mousedown.prevent
          @click="$emit('remove')"
        />
        <div
          class="flex flex-col sm:flex-row gap-2 sm:gap-6 items-center"
        >
          <FormAlertMessage
            :id="messageId"
            :message="alerts[formTarget]"
          />
          <UButton
            variant="outline"
            :label="$t('label.cancel')"
            class="w-full sm:w-min justify-center"
            @mousedown.prevent
            @click="$emit('cancel')"
          />
          <UButton
            :data-alert-focus-target="targetId"
            :aria-describedby="messageId"
            :label="$t('label.done')"
            class="w-full sm:w-min justify-center"
            @click="onDone"
          />
        </div>
      </div>
    </fieldset>
  </UForm>
</template>
