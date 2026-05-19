<script setup lang="ts">
import type { Form, FormErrorEvent } from '@nuxt/ui'

const props = defineProps<{
  variant: FormVariant
  subject: string
  name?: string
  stateKey: string
  hideRemove?: boolean
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
      <div class="padding-xy-default">
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
    </SubFormWrapper>
  </UForm>
</template>
