<script setup lang="ts">
import type { Form, FormErrorEvent } from '@nuxt/ui'

const props = defineProps<{
  variant: FormVariant
  subject: string
  hideRemove?: boolean
  name?: string
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
const currencyOptions = getCurrencyList().map(c => ({
  code: c.code,
  label: `${c.name}, ${c.code}`
}))
const schema = computed(() => getActiveShareClassSchema(props.validationContext))
const isInvalidCurrency = ref(false)

const model = defineModel<ShareClassSchema>({ required: true })
const formRef = useTemplateRef<Form<ShareClassSchema>>('share-class-form')

const formErrors = computed(() => {
  const errors = formRef.value?.getErrors()

  return {
    name: !!errors?.find(e => e.name?.includes('name')),
    maxShares: !!errors?.find(e => e.name?.includes('maxNumberOfShares')),
    parValue: !!errors?.find(e => e.name?.includes('parValue'))
  }
})

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

function isSupportedCurrency(code: string | undefined) {
  return !!code && code !== 'OTHER'
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

const nameInputSlots = computed(() => ({
  trailing: h('span', { class: ['text-base font-bold', formErrors.value.name ? 'text-error' : ''] }, t('label.shares'))
}))
provide('UInput-slots-share-class-name-input', nameInputSlots)
provide('UInput-props-max-number-shares-input', { maxlength: '17' })
provide('UInput-props-par-value-input', { maxlength: '17' })

onMounted(async () => {
  if (model.value.currency === 'OTHER') {
    isInvalidCurrency.value = true
    model.value.currency = ''
    model.value.currencyAdditional = undefined
    // @ts-expect-error - name: 'currency' not being inferred correctly
    await formRef.value?.validate({ name: 'currency', silent: true })
  }
})

watch(() => model.value.currency, (v) => {
  if (isSupportedCurrency(v)) {
    isInvalidCurrency.value = false
  } else if (v === 'OTHER') {
    isInvalidCurrency.value = true
  }
})

defineExpose({
  formRef
})
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
      <template #default>
        <ConnectFormFieldWrapper
          :label="$t('label.className')"
          :error="formErrors.name"
          padding-class="xy-default"
        >
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
        <ConnectFormFieldWrapper
          :label="$t('label.maxNumberOfShares')"
          :error="formErrors.maxShares"
          padding-class="xy-default"
        >
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
        <ConnectFormFieldWrapper
          :label="$t('label.parValue')"
          :error="formErrors.parValue"
          padding-class="xy-default"
          data-testid="par-value-section"
        >
          <div class="space-y-4">
            <UAlert
              v-if="isInvalidCurrency"
              data-testid="currency-update-alert"
              color="warning"
              variant="subtle"
              icon="i-mdi-alert"
            >
              <template #title>
                <ConnectI18nHelper
                  translation-path="text.currencyOtherNotSupported"
                  class="font-normal"
                />
              </template>
            </UAlert>
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
                      value-key="code"
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
          </div>
        </ConnectFormFieldWrapper>
        <USeparator />
        <ConnectFormFieldWrapper :label="$t('label.specialRightsOrRestrictions')" padding-class="xy-default">
          <UFormField name="hasRightsOrRestrictions">
            <UCheckbox
              v-model="model.hasRightsOrRestrictions"
              :label="$t('label.shareClassHasRightsOrRestrictions')"
              :ui="{ label: 'text-base' }"
            />
          </UFormField>
        </ConnectFormFieldWrapper>
      </template>
    </SubFormWrapper>
  </UForm>
</template>
