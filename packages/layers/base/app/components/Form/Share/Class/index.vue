<script setup lang="ts">
import type { Form, FormErrorEvent } from '@nuxt/ui'

const props = defineProps<{
  variant: 'add' | 'edit'
  name?: string
  title: string
  stateKey: string
  nested?: boolean
  validationContext?: { existingNames: string[] }
}>()

const emit = defineEmits<{
  done: []
  cancel: []
}>()

const { t } = useI18n()
const { alerts, attachAlerts } = useFilingAlerts(props.stateKey)
const formTarget = 'party-details-form'
const currencyOptions = getCurrencyList()
const schema = computed(() => getActiveShareClassSchema(props.validationContext))

const model = defineModel<ShareClassSchema>({ required: true })
const formRef = useTemplateRef<Form<ShareClassSchema>>('share-class-form')

function resetFields(fields: 'parValue' | 'maxShares') {
  if (fields === 'parValue') {
    model.value.parValue = null
    model.value.currency = undefined
    formRef.value?.clear(/^(parValue|currency)$/)
  } else if (fields === 'maxShares') {
    model.value.maxNumberOfShares = null
    formRef.value?.clear(/^maxNumberOfShares$/)
  }
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

provide('UInput-slots-share-class-name-input', { trailing: h('span', { class: 'text-base font-bold' }, 'Shares') })
</script>

<template>
  <UForm
    ref="share-class-form"
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
          :label="'Class Name [Shares]'"
          input-id="share-class-name-input"
          name="name"
          help="Only enter the class name. The word “shares” will be added automatically."
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
          @update:model-value="resetFields('maxShares')"
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
        <URadioGroup
          v-model="model.hasParValue"
          size="xl"
          :items="[{ value: true }, { label: 'No Par Value', value: false }]"
          :ui="{
            fieldset: 'gap-y-6',
            item: 'items-center gap-4'
          }"
          @update:model-value="resetFields('parValue')"
        >
          <template #label="{ item }">
            <div v-if="item.value" class="flex flex-col gap-2 sm:gap-4 sm:flex-row">
              <ConnectFormInput
                v-model.number="model.parValue"
                :disabled="!model.hasParValue"
                :class="{ 'opacity-75': !model.hasParValue }"
                input-id="par-value-input"
                :label="'Par Value'"
                name="parValue"
                :required="model.hasParValue"
                help="Initial value of each share"
                class="w-full flex-1"
              />
              <UFormField
                name="currency"
                help="Initial value of each share"
                data-testid="form-field-currency"
                :class="{ 'opacity-75': !model.hasParValue }"
                class="w-full flex-1"
              >
                <ConnectInputMenu
                  id="par-value-currency-input"
                  v-model="model.currency"
                  label="Currency"
                  :items="currencyOptions"
                  class="w-full"
                  :required="model.hasParValue"
                  :disabled="!model.hasParValue"
                  open-on-focus
                />
              </UFormField>
            </div>
            <span v-else>{{ item.label }}</span>
          </template>
        </URadioGroup>
        <USeparator />
        <UFormField name="hasRightsOrRestrictions">
          <UCheckbox
            v-model="model.hasRightsOrRestrictions"
            label="This share class has special rights or restrictions"
            :ui="{ label: 'text-base' }"
          />
        </UFormField>
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
    </ConnectFieldset>
  </UForm>
</template>
