<script setup lang="ts">
import type { Form, FormErrorEvent } from '@nuxt/ui'

const props = defineProps<{
  // variant: FormVariant
  name?: string
  // stateKey: string
  validationContext?: {
    hasRightsOrRestrictions?: boolean
    isEditingExisting?: boolean
    existingResolutions?: { id: string, date: string, type?: string }[]
  }
}>()

const emit = defineEmits<{
  done: []
  cancel: []
}>()

// const { alerts, attachAlerts } = useFilingAlerts(props.stateKey)
const formTarget = 'resolution-date-form'
const schema = computed(() => getResolutionDateSchema(props.validationContext))

const model = defineModel<ResolutionDateSchema>({ required: true })
const formRef = useTemplateRef<Form<ResolutionDateSchema>>('resolution-date-form')

async function onDone() {
  try {
    await formRef.value?.validate()
    emit('done')
  } catch (e) {
    onFormSubmitError(e as FormErrorEvent)
  }
}

// const { targetId, messageId } = attachAlerts(formTarget, model)
</script>

<template>
  <UForm
    ref="resolution-date-form"
    :data-testid="formTarget"
    :schema
    :name
    nested
    :state="model as any"
    @keydown.enter.prevent.stop="onDone"
  >
    <SubFormFieldWrapper
      @done="onDone"
      @cancel="$emit('cancel')"
    >
      <UFormField help="Format: YYYY-MM-DD" name="date">
        <ConnectInputDate
          id="resolution-date"
          v-model="model.date"
          label="Resolution or Court Order Date"
        />
      </UFormField>
    </SubFormFieldWrapper>
    <!-- <SubFormWrapper
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
    </SubFormWrapper> -->
  </UForm>
</template>
