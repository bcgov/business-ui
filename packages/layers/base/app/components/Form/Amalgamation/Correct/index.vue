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
    name: !!errors?.find(e => e.name?.includes('name')),
    number: !!errors?.find(e => e.name?.includes('number')),
    jurisdiction: !!errors?.find(e => e.name?.includes('country'))
  }
})

const caOpts: InputMenuItem[] = [
  { type: 'label', label: t('label.canadian') },
  ...countrySubdivisions.ca
    .filter(p => p.code !== 'BC')
    .map(p => ({
      label: p.name,
      region: p.code,
      country: 'CA'
    })),
    { type: 'separator' },
    { region: 'FEDERAL', country: "CA", label: t('label.federal') }
]

const internationalOpts = [
  { type: 'label', label: t('label.international') },
  ...isoCountriesListSortedByName
    .filter(c => c.alpha_2 !== 'CA')
    .sort((a, b) => {
      if (a.alpha_2 === 'US') return -1
      if (b.alpha_2 === 'US') return 1
      return 0
    })
    .map(c => ({
      label: c.name,
      region: null,
      country: c.alpha_2
    }))
]

const jurisdictionOpts: InputMenuItem = [
  caOpts,
  internationalOpts
]

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
            :error="formErrors.name"
          >
           <ConnectFormInput
              v-model="model.name"
              input-id="business-name-home-jurisdiction"
              :label="$t('label.businessFullNameInHomeJurisdiction')"
              name="name"
              required
            />
          </ConnectFormFieldWrapper>
          <ConnectFormFieldWrapper
            :label="$t('label.corpNum')"
            orientation="horizontal"
            details-aria-hidden
            class="padding-x-default pb-6 sm:pb-10 pt-3 sm:pt-5"
            :error="formErrors.number"
          >
            <ConnectFormInput
              v-model="model.number"
              input-id="corp-num-home-jurisdiction"
              :label="$t('label.corpNumHomeJurisdiction')"
              name="number"
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
            :error="formErrors.jurisdiction"
          >
            <UFormField name="jurisdiction.country">
              <ConnectInputMenu
                v-model="model.jurisdiction"
                id="foreign-jurisdiction-menu"
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
