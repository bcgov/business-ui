<script setup lang="ts">
import type { Form, FormErrorEvent } from '@nuxt/ui'

const props = defineProps<{
  variant: 'add' | 'edit'
  name?: string
  title: string
  stateKey: string
  nested?: boolean
  validationContext?: { existingNames: string[], maxAllowedShares: number }
}>()

const emit = defineEmits<{
  done: []
  cancel: []
  remove: []
}>()

const { t } = useI18n()
const { alerts, attachAlerts } = useFilingAlerts(props.stateKey)
const formTarget = 'share-series-form'
const schema = computed(() => getActiveShareSeriesSchema(props.validationContext))

const model = defineModel<ShareSeriesSchema>({ required: true })
const formRef = useTemplateRef<Form<ShareSeriesSchema>>('share-series-form')

function resetFields() {
  model.value.maxNumberOfShares = null
  formRef.value?.clear(/^maxNumberOfShares$/)
}

async function onDone() {
  try {
    await formRef.value?.validate()
    emit('done')
  } catch (e) {
    onFormSubmitError(e as FormErrorEvent)
  }
}

const { targetId, messageId } = attachAlerts(formTarget, model)

const hasNameError = computed(() => !!formRef.value?.getErrors().find(e => e.name?.includes('name')))
const nameInputSlots = computed(() => ({
  trailing: h('span', { class: ['text-base font-bold', hasNameError.value ? 'text-error' : ''] }, 'Shares')
}))
provide('UInput-slots-share-series-name-input', nameInputSlots)
</script>

<template>
  <UForm
    ref="share-series-form"
    :schema
    :name
    :nested
    :state="model"
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
      <div class="space-y-6">
        <ConnectFormInput
          v-model="model.name"
          required
          :label="'Series Name [Shares]'"
          input-id="share-series-name-input"
          name="name"
          help="Only enter the series name. The word “Shares” will be added automatically."
        />
        <USeparator />
        <URadioGroup
          v-model="model.hasMaximumShares"
          size="xl"
          :items="[{ value: true }, { label: 'No Maximum', value: false }]"
          :ui="{
            fieldset: 'gap-y-6',
            item: 'items-center gap-4'
          }"
          @update:model-value="resetFields"
        >
          <template #label="{ item }">
            <ConnectFormInput
              v-if="item.value"
              v-model.number="model.maxNumberOfShares"
              :disabled="!model.hasMaximumShares"
              :class="{ 'opacity-75': !model.hasMaximumShares }"
              input-id="max-number-shares-input"
              :label="'Maximum Number of Shares'"
              name="maxNumberOfShares"
              :required="model.hasMaximumShares"
              help="Maximum number of shares in this class"
            />
            <span v-else>{{ item.label }}</span>
          </template>
        </URadioGroup>
        <USeparator />
        <p class="text-base">
          No Par Value
        </p>
        <USeparator />
        <UFormField name="hasRightsOrRestrictions">
          <UCheckbox
            v-model="model.hasRightsOrRestrictions"
            label="This share class has special rights or restrictions"
            :ui="{ label: 'text-base' }"
          />
        </UFormField>
        <div class="flex flex-col sm:flex-row gap-2 sm:gap-6 items-center justify-between">
          <UButton
            :label="$t('label.remove')"
            variant="outline"
            color="error"
            @click="$emit('remove')"
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
        </div>
      </div>
    </ConnectFieldset>
  </UForm>
</template>
