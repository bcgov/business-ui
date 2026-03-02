<script setup lang="ts">
import type { Form, FormErrorEvent } from '@nuxt/ui'

const props = defineProps<{
  variant: 'add' | 'edit'
  name?: string
  title: string
  stateKey: string
  nested?: boolean
  row?: TableBusinessRow<ShareClassSchema>
  existingNames: string[]
}>()

const emit = defineEmits<{
  done: []
  cancel: []
  remove: []
}>()

const { t } = useI18n()
const { alerts, attachAlerts } = useFilingAlerts(props.stateKey)
const formTarget = 'share-series-form'

const model = defineModel<ShareSeriesSchema>({ required: true })
const formRef = useTemplateRef<Form<ShareSeriesSchema>>('share-series-form')

const { targetId, messageId } = attachAlerts(formTarget, model)

const formErrors = computed(() => {
  const errors = formRef.value?.getErrors()

  return {
    name: !!errors?.find(e => e.name?.includes('name')),
    maxShares: !!errors?.find(e => e.name?.includes('maxNumberOfShares'))
  }
})

const shareClassData = computed(() =>
  props.row?.depth === 0 ? props.row.original.new : props.row?.getParentRow()?.original.new
)
const schema = computed(() => {
  const classData = shareClassData.value

  if (!classData) {
    return getActiveShareSeriesSchema({
      existingNames: props.existingNames,
      maxAllowedShares: 0
    })
  }

  const currentId = model.value.id
  const otherSeries = classData.series.filter(s => s.id !== currentId && !s.actions?.includes(ActionType.REMOVED))

  const classMaxShares = classData.maxNumberOfShares || 0
  const otherSeriesTotalShares = otherSeries.reduce((acc, s) => acc + (s.maxNumberOfShares ?? 0), 0)

  const maxAllowedShares = classData.hasMaximumShares
    ? classMaxShares - otherSeriesTotalShares
    : Infinity

  return getActiveShareSeriesSchema({
    existingNames: props.existingNames,
    maxAllowedShares
  })
})

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

const hasNameError = computed(() => !!formRef.value?.getErrors().find(e => e.name?.includes('name')))
const nameInputSlots = computed(() => ({
  trailing: h('span', { class: ['text-base font-bold', hasNameError.value ? 'text-error' : ''] }, t('label.shares'))
}))
provide('UInput-slots-share-series-name-input', nameInputSlots)
provide('UInput-props-max-number-shares-input', { maxlength: '17' })
</script>

<template>
  <UForm
    ref="share-series-form"
    :data-testid="`${variant}-share-series-form`"
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
        class="bg-white"
        :class="{
          'rounded shadow': variant === 'add',
          'border-l-3 border-error': alerts[formTarget]
        }"
      >
        <ConnectFormFieldWrapper
          :label="$t('label.seriesName')"
          nested
          :error="formErrors.name"
        >
          <ConnectFormInput
            v-model="model.name"
            required
            :label="$t('label.seriesNameShares')"
            input-id="share-series-name-input"
            name="name"
            :help="$t('text.seriesNameHelp')"
          />
        </ConnectFormFieldWrapper>
        <USeparator />
        <ConnectFormFieldWrapper
          :label="$t('label.maxNumberOfShares')"
          nested
          :error="formErrors.maxShares"
        >
          <URadioGroup
            v-if="!shareClassData?.hasMaximumShares"
            v-model="model.hasMaximumShares"
            size="xl"
            :items="[{ value: true }, { label: $t('label.noMaximum'), value: false }]"
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
                :label="$t('label.maxNumberOfShares')"
                name="maxNumberOfShares"
                :required="model.hasMaximumShares"
                :help="$t('text.maxNumberOfSharesHelp')"
              />
              <span v-else>{{ item.label }}</span>
            </template>
          </URadioGroup>
          <ConnectFormInput
            v-else
            v-model.number="model.maxNumberOfShares"
            maxlength="17"
            :disabled="!model.hasMaximumShares"
            :class="{ 'opacity-75': !model.hasMaximumShares }"
            input-id="max-number-shares-input"
            :label="$t('label.maxNumberOfShares')"
            name="maxNumberOfShares"
            :required="model.hasMaximumShares"
            :help="$t('text.maxNumberOfSharesHelp')"
          />
        </ConnectFormFieldWrapper>
        <USeparator />
        <ConnectFormFieldWrapper :label="$t('label.parValue')" nested>
          <div
            v-if="shareClassData?.hasParValue && shareClassData.parValue && shareClassData.currency"
            class="flex flex-col gap-2 sm:gap-4 sm:flex-row"
          >
            <ConnectInput
              id="par-value-display-input"
              v-model="shareClassData.parValue"
              readonly
              :label="$t('label.parValue')"
              class="w-full flex-1"
            />
            <ConnectInput
              id="currency-display-input"
              v-model="shareClassData.currency"
              readonly
              :label="$t('label.currency')"
              class="w-full flex-1"
            />
          </div>
          <p v-else class="text-base">
            {{ $t('label.noParValue') }}
          </p>
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
      </div>
    </fieldset>
  </UForm>
</template>

<style scoped>
@reference "#connect-theme";

:deep(#par-value-display-input) {
  @apply bg-white shadow-none border-b border-dashed;
}

:deep(#currency-display-input) {
  @apply bg-white shadow-none border-b border-dashed;
}
</style>
