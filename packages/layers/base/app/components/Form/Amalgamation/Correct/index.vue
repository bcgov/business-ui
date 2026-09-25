<script setup lang="ts">
import type { Form, FormErrorEvent, InputMenuItem } from '@nuxt/ui'

const {
  stateKey,
  nested = true
} = defineProps<{
  variant: FormVariant
  subject: string
  hideRemove?: boolean
  name?: string
  nested?: boolean
  stateKey: string
}>()

const emit = defineEmits<{
  done: []
  cancel: []
  remove: []
}>()

const { t } = useI18n()
const formTarget = 'amalgamation-correct-form'

const model = defineModel<AmalgamationCorrectSchema>({ required: true })
const formRef = useTemplateRef<Form<AmalgamationCorrectSchema>>(formTarget)

const { alerts, attachAlerts } = useFilingAlerts(stateKey)
const { targetId, messageId } = attachAlerts(formTarget, model)

const schema = computed(() => getAmalgamationCorrectSchema())

const formErrors = computed(() => {
  const errors = formRef.value?.getErrors()

  return {
    legalName: !!errors?.find(e => e.name?.includes('legalName')),
    identifier: !!errors?.find(e => e.name?.includes('identifier')),
    foreignJurisdiction: !!errors?.find(e => e.name?.includes('country'))
  }
})

const jurisdictionOpts = getJurisdictionMenuItems()

// normalize InputMenuItem to match form schema - no label in form schema
const selectedJurisdiction = computed({
  get() {
    if (!model.value.foreignJurisdiction?.country) {
      return undefined
    }

    const { country, region } = model.value.foreignJurisdiction

    return {
      label: getJurisdictionLabel(country, region),
      country,
      region
    }
  },
  set(val: { label?: string, country: string, region: string | null } | undefined) {
    if (!val) {
      model.value.foreignJurisdiction = { country: '', region: null }
      return
    }

    model.value.foreignJurisdiction = {
      country: val.country,
      region: val.region ?? null
    }
  }
})

async function onDone() {
  try {
    await formRef.value?.validate()
    emit('done')
  } catch (e) {
    onFormSubmitError(e as FormErrorEvent)
  }
}

defineExpose({
  formRef
})
</script>

<template>
  <UForm
    ref="amalgamation-correct-form"
    :data-testid="`${variant}-amalgamation-correct-form`"
    :name
    :nested
    :schema
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
      @cancel="$emit('cancel')"
      @remove="$emit('remove')"
      @done="onDone"
    >
      <template #default>
        <div>
          <ConnectFormFieldWrapper
            :label="$t('label.businessName')"
            orientation="horizontal"
            details-aria-hidden
            class="padding-x-default pt-6 sm:pt-10 pb-3 sm:pb-5"
            :error="formErrors.legalName"
          >
            <ConnectFormInput
              v-model="model.legalName"
              input-id="business-name-home-jurisdiction"
              :label="$t('label.businessFullNameInHomeJurisdiction')"
              name="legalName"
              required
            />
          </ConnectFormFieldWrapper>
          <ConnectFormFieldWrapper
            :label="$t('label.corpNum')"
            orientation="horizontal"
            details-aria-hidden
            class="padding-x-default pb-6 sm:pb-10 pt-3 sm:pt-5"
            :error="formErrors.identifier"
          >
            <ConnectFormInput
              v-model="model.identifier"
              input-id="corp-identifier-home-jurisdiction"
              :label="$t('label.corpNumHomeJurisdiction')"
              name="identifier"
              required
            />
          </ConnectFormFieldWrapper>
        </div>
        <USeparator class="padding-x-default" />
        <ConnectFormFieldWrapper
          :label="$t('label.homeJurisdiction')"
          orientation="horizontal"
          details-aria-hidden
          class="padding-xy-default"
          :error="formErrors.foreignJurisdiction"
        >
          <UFormField name="foreignJurisdiction.country">
            <ConnectInputMenu
              id="foreign-jurisdiction-menu"
              v-model="selectedJurisdiction"
              :label="$t('label.selectHomeJurisdiction')"
              :items="jurisdictionOpts"
              open-on-focus
              class="w-full"
              :ui="{
                label: 'font-bold px-4 pb-2 pt-3',
                separator: 'mx-0'
              }"
            />
          </UFormField>
        </ConnectFormFieldWrapper>
      </template>
    </SubFormWrapper>
  </UForm>
</template>
