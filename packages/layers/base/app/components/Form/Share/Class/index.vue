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
  remove: []
}>()

const { t } = useI18n()
const { alerts, attachAlerts } = useFilingAlerts(props.stateKey)
const formTarget = 'share-class-form'
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

const hasNameError = computed(() => !!formRef.value?.getErrors().find(e => e.name?.includes('name')))
const nameInputSlots = computed(() => ({
  trailing: h('span', { class: ['text-base font-bold', hasNameError.value ? 'text-error' : ''] }, t('label.shares'))
}))
provide('UInput-slots-share-class-name-input', nameInputSlots)
provide('UInput-props-max-number-shares-input', { maxlength: '17' })
provide('UInput-props-par-value-input', { maxlength: '17' })
</script>

<template>
  <UForm
    ref="share-class-form"
    :data-testid="`${variant}-share-class-form`"
    :schema
    :name
    :nested
    :state="model"
    @keydown.enter.prevent.stop="onDone"
  >
    <fieldset :data-testid="formTarget">
      <legend class="py-4 px-4 sm:px-8 bg-shade-secondary flex items-center gap-2.5 w-full">
        <UIcon
          name="i-mdi-sitemap"
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
        <ConnectFormFieldWrapper :label="$t('label.className')" nested>
          <ConnectFormInput
            v-model="model.name"
            required
            :label="$t('label.classNameShares')"
            input-id="share-class-name-input"
            name="name"
            :help="$t('text.shareNameHelp')"
          />
        </ConnectFormFieldWrapper>
        <USeparator />
        <ConnectFormFieldWrapper :label="$t('label.maxNumberOfShares')" nested>
          <URadioGroup
            v-model="model.hasMaximumShares"
            size="xl"
            :items="[{ value: true }, { label: $t('label.noMaximum'), value: false }]"
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
                :label="$t('label.maxNumberOfShares')"
                name="maxNumberOfShares"
                :required="model.hasMaximumShares"
                :help="$t('text.maxNumberOfSharesHelp')"
              />
              <span v-else>{{ item.label }}</span>
            </template>
          </URadioGroup>
        </ConnectFormFieldWrapper>
        <USeparator />
        <ConnectFormFieldWrapper :label="$t('label.parValue')" nested>
          <URadioGroup
            v-model="model.hasParValue"
            size="xl"
            :items="[{ value: true }, { label: $t('label.noParValue'), value: false }]"
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
                  :label="$t('label.parValue')"
                  name="parValue"
                  :required="model.hasParValue"
                  :help="$t('text.parValueHelp')"
                  class="w-full flex-1"
                />
                <UFormField
                  name="currency"
                  data-testid="form-field-currency"
                  :class="{ 'opacity-75': !model.hasParValue }"
                  class="w-full flex-1"
                >
                  <ConnectInputMenu
                    id="par-value-currency-input"
                    v-model="model.currency"
                    data-testid="par-value-currency-input"
                    :label="$t('label.currency')"
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
        </ConnectFormFieldWrapper>
        <USeparator />
        <ConnectFormFieldWrapper :label="$t('label.specialRightsOrRestrictions')" nested>
          <UFormField name="hasRightsOrRestrictions">
            <UCheckbox
              v-model="model.hasRightsOrRestrictions"
              :label="$t('label.shareClassHasRightsOrRestrictions')"
              :ui="{ label: 'text-base' }"
            />
          </UFormField>
        </ConnectFormFieldWrapper>
      </div>
      <div
        class="flex flex-col sm:flex-row gap-2 sm:gap-6 items-center mt-6"
        :class="variant === 'edit' ? 'justify-between' : 'justify-end'"
      >
        <UButton
          v-if="variant === 'edit'"
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
            variant="outline"
            :label="$t('label.cancel')"
            class="w-full sm:w-min justify-center"
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
