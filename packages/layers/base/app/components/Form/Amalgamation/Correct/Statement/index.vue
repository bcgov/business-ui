<script setup lang="ts">
import type { FormErrorEvent, Form } from '@nuxt/ui'

const {
  stateKey,
  nested = true
} = defineProps<{
  variant: FormVariant
  name?: string
  nested?: boolean
  stateKey: string
}>()

const emit = defineEmits<{
  done: []
  cancel: []
}>()

const { t } = useI18n()
const formTarget = 'amalgamation-correct-statement-form'
const schema = getAmalgamationCorrectStatementSchema()

const model = defineModel<AmalgamationCorrectStatementSchema>({
  default: () => ({
    courtApproval: false,
    actions: [],
    isEditing: false
  })
})

const formRef = useTemplateRef<Form<AmalgamationCorrectStatementSchema>>(formTarget)

const { alerts, attachAlerts } = useFilingAlerts(stateKey)
const { targetId, messageId } = attachAlerts(formTarget, model)

const options = [
  {
    label: t('label.withCourtApproval'),
    value: true,
    description: t('text.withCourtApprovalDescription')
  },
  {
    label: t('label.withoutCourtApproval'),
    value: false,
    description: t('text.withoutCourtApprovalDescription')
  }
]

async function onDone() {
  try {
    await formRef.value?.validate()
    emit('done')
  } catch (e) {
    onFormSubmitError(e as FormErrorEvent)
  }
}
</script>

<template>
  <UForm
    ref="amalgamation-correct-statement-form"
    :data-testid="`${variant}-amalgamation-correct-statement-form`"
    :name
    :nested
    :schema
    :state="model"
    @keydown.enter.prevent.stop="onDone"
  >
    <SubFormFieldWrapper
      orientation="vertical"
      :task-guard-config="{
        message: alerts[formTarget],
        messageId,
        targetId
      }"
      @done="onDone"
      @cancel="$emit('cancel')"
    >
      <URadioGroup
        v-model="model.courtApproval"
        :items="options"
        variant="card"
        :legend="$t('text.indicateStatementForAmalgamation')"
        :ui="{
          fieldset: 'gap-y-4',
          label: 'text-base group-has-[button[data-active]]:font-bold',
          description: 'text-base text-neutral mt-2',
          item: 'group not-has-data-active:bg-shade',
          container: 'mt-0.5',
          base: 'ring-neutral ring-2',
          legend: 'text-base mb-6'
        }"
      />
    </SubFormFieldWrapper>
  </UForm>
</template>
