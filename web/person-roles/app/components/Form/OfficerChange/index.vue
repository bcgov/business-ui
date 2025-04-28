<script setup lang="ts">
import type { FormErrorEvent, Form, FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
import { UForm } from '#components'

const { t } = useI18n()

const props = withDefaults(defineProps<{
  defaultState?: Officer
  editing?: boolean
  title: string
}>(), {
  defaultState: () => ({
    firstName: '',
    middleName: '',
    lastName: '',
    preferredName: '',
    roles: [],
    mailingAddress: {
      street: '',
      streetAdditional: '',
      city: '',
      region: '',
      postalCode: '',
      country: 'CA',
      locationDescription: ''
    },
    deliveryAddress: {
      street: '',
      streetAdditional: '',
      city: '',
      region: '',
      postalCode: '',
      country: 'CA',
      locationDescription: ''
    },
    sameAsDelivery: false,
    hasPreferredName: false
  })
})

const emit = defineEmits<{
  'cancel': []
  'officer-change': [Officer]
}>()

const addressSchema = z.object({
  street: z.string().min(1, t('validation.fieldRequired')).max(50, t('validation.maxChars', { count: 50 })),
  streetAdditional: z.string().max(50, t('validation.maxChars', { count: 50 })).optional(),
  city: z.string().min(1, t('validation.fieldRequired')).max(40, t('validation.maxChars', { count: 40 })),
  region: z.string().optional(),
  postalCode: z.string().min(1, t('validation.fieldRequired')).max(15, t('validation.maxChars', { count: 15 })),
  country: z.string().min(1, t('validation.fieldRequired')),
  locationDescription: z.string().max(80, t('validation.maxChars', { count: 80 })).optional()
}).superRefine((data, ctx) => {
  // validate region based on country
  // required if country is US or CA
  // optional and max 2 characters if not US or CA
  const country = data.country
  const region = data.region

  if (country === 'US' || country === 'CA') {
    if (region.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('validation.fieldRequired'),
        path: ['region']
      })
    } else if (region.length > 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('validation.maxChars', { count: 2 }),
        path: ['region']
      })
    }
  } else if (region.length > 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: t('validation.maxChars', { count: 2 }),
      path: ['region']
    })
  }

  return z.NEVER
})

const schema = z.object({
  firstName: z.string().max(20, t('validation.maxChars', { count: 20 })).optional(),
  middleName: z.string().max(20, t('validation.maxChars', { count: 20 })).optional(),
  lastName: z.string().min(1, t('validation.fieldRequired')).max(30, t('validation.maxChars', { count: 30 })),
  preferredName: z.string().max(50, t('validation.maxChars', { count: 50 })).optional(),
  hasPreferredName: z.boolean().default(false),
  roles: z
    .enum([
      OfficerRole.ASSISTANT_SECRETARY,
      OfficerRole.CEO,
      OfficerRole.CFO,
      OfficerRole.CHAIR,
      OfficerRole.OTHER,
      OfficerRole.PRESIDENT,
      OfficerRole.SECRETARY,
      OfficerRole.TREASURER,
      OfficerRole.VP
    ])
    .array().min(1, { message: t('validation.role.min') }),
  mailingAddress: addressSchema,
  sameAsDelivery: z.boolean().default(false),
  deliveryAddress: addressSchema
})

type Schema = z.output<typeof schema>
const state = reactive<Schema>(props.defaultState)

const formRef = useTemplateRef<Form<Schema>>('officer-form')

const formErrors = computed<{ name: boolean, roles: boolean, mailing: boolean, delivery: boolean }>(() => {
  const errors = formRef.value?.getErrors()
  return {
    name: !!errors?.some(e => e.name === 'lastName'),
    roles: !!errors?.some(e => e.name === 'roles'),
    mailing: !!errors?.some(e => e.name?.startsWith('mailingAddress')),
    delivery: !!errors?.some(e => e.name?.startsWith('deliveryAddress'))
  }
})

const roles = [
  { label: t(`enum.officerRole.${OfficerRole.CEO}`), value: OfficerRole.CEO },
  { label: t(`enum.officerRole.${OfficerRole.TREASURER}`), value: OfficerRole.TREASURER },
  { label: t(`enum.officerRole.${OfficerRole.CFO}`), value: OfficerRole.CFO },
  { label: t(`enum.officerRole.${OfficerRole.SECRETARY}`), value: OfficerRole.SECRETARY },
  { label: t(`enum.officerRole.${OfficerRole.PRESIDENT}`), value: OfficerRole.PRESIDENT },
  { label: t(`enum.officerRole.${OfficerRole.ASSISTANT_SECRETARY}`), value: OfficerRole.ASSISTANT_SECRETARY },
  { label: t(`enum.officerRole.${OfficerRole.VP}`), value: OfficerRole.VP },
  { label: t(`enum.officerRole.${OfficerRole.OTHER}`), value: OfficerRole.OTHER },
  { label: t(`enum.officerRole.${OfficerRole.CHAIR}`), value: OfficerRole.CHAIR }
]

function onError(event: FormErrorEvent) {
  let element: unknown
  const firstEl = event.errors[0]

  if (firstEl?.name === 'roles') { // roles doesn't have an id, so get first button in role options container to apply focus
    element = document.getElementById('officer-role-options').querySelector('button')
  } else { // else query by input id
    element = document.getElementById(firstEl?.id)
  }
  if (element) {
    // using focus without setTimeout only works intermittently
    setTimeout(() => {
      element.focus()
    }, 0)
  }
}

function onSubmit(e: FormSubmitEvent<Schema>) {
  const data = e.data

  if (data.sameAsDelivery) {
    data.mailingAddress = data.deliveryAddress
  }

  // TODO: cleanup type
  emit('officer-change', data as Officer)
}

// if user selects 'same as delivery' checkbox
// set mailingAddress = deliveryAddress
// clear any mailing address field form errors
// else set mailing address to default state
watch(
  () => state.sameAsDelivery,
  (v) => {
    if (v) {
      state.mailingAddress = state.deliveryAddress
      const mailingFields = [
        'mailingAddress.city',
        'mailingAddress.region',
        'mailingAddress.postalCode',
        'mailingAddress.street'
      ]
      mailingFields.forEach(item => formRef.value?.clear(item))
    } else {
      state.mailingAddress = props.defaultState.mailingAddress
    }
  },
  { immediate: true }
)

// Clear roles validation error when selecting roles
// 'blur' wont clear errors for this field
watch(
  () => state.roles,
  (v) => {
    if (v && v.length) {
      formRef.value?.clear('roles')
    }
  }
)

// reset mailing address if 'sameAsDelivery' is checked and the user makes changes to delivery address
watch(
  () => state.deliveryAddress,
  () => {
    if (state.sameAsDelivery) {
      state.mailingAddress = {
        street: '',
        streetAdditional: '',
        city: '',
        region: '',
        postalCode: '',
        country: '',
        locationDescription: ''
      }
      state.sameAsDelivery = false
    }
  },
  { deep: true }
)
</script>

<template>
  <UForm
    ref="officer-form"
    :state
    :schema="schema"
    class="bg-white p-6"
    :class="{
      'border-l-3 border-red-600': Object.values(formErrors).some(v => v === true),
      'rounded-sm shadow-sm': !editing
    }"
    :validate-on="['blur']"
    @error="onError"
    @submit="onSubmit"
  >
    <div class="flex flex-col sm:flex-row gap-6">
      <h2 class="w-full sm:w-1/5 font-bold text-bcGovGray-900 text-base -mt-1.5">
        {{ title }}
      </h2>
      <div class="flex flex-col gap-8 w-full">
        <div
          class="flex flex-col gap-6 w-full"
        >
          <FormSection
            :label="$t('label.legalName')"
            :invalid="formErrors.name"
          >
            <div class="flex flex-col gap-4 sm:flex-row">
              <UFormField
                v-slot="{ error }"
                name="firstName"
                class="grow flex-1"
              >
                <ConnectInput
                  id="first-name"
                  v-model="state.firstName"
                  :invalid="!!error"
                  :label="$t('label.firstName')"
                  autofocus
                />
              </UFormField>
              <UFormField
                v-slot="{ error }"
                name="middleName"
                class="grow flex-1"
              >
                <ConnectInput
                  id="middle-name"
                  v-model="state.middleName"
                  :invalid="!!error"
                  :label="$t('label.middleNameOpt')"
                />
              </UFormField>
              <UFormField
                v-slot="{ error }"
                name="lastName"
                class="grow flex-1"
              >
                <ConnectInput
                  id="last-name"
                  v-model="state.lastName"
                  required
                  :invalid="!!error"
                  :label="$t('label.lastName')"
                />
              </UFormField>
            </div>

            <UCheckbox
              v-model="state.hasPreferredName"
              :label="$t('label.haspreferredName')"
              :ui="{ root: 'items-center' }"
            />

            <UFormField
              v-if="state.hasPreferredName"
              v-slot="{ error }"
              name="preferredName"
              class="grow flex-1"
              :label="$t('label.preferredName')"
              :ui="{ label: 'mb-3.5' }"
            >
              <ConnectInput
                id="preferred-name"
                v-model="state.preferredName"
                :invalid="!!error"
                :label="$t('label.preferredNameOpt')"
              />
            </UFormField>
          </FormSection>
        </div>

        <FormSection
          :label="$t('label.roles')"
          :invalid="formErrors.roles"
          error-id="roles-checkbox-error"
        >
          <UFormField
            v-slot="{ error }"
            name="roles"
            :ui="{
              error: 'sr-only'
            }"
          >
            <div
              v-if="error !== undefined"
              id="roles-checkbox-error"
              class="text-red-600 text-base mb-3"
            >
              {{ error }}
            </div>
            <FormCheckboxGroup
              id="officer-role-options"
              v-model="state.roles"
              :items="roles"
            />
          </UFormField>
        </FormSection>

        <FormSection
          :label="$t('label.deliveryAddress')"
          :invalid="formErrors.delivery"
        >
          <FormAddress
            id="delivery-address"
            v-model="state.deliveryAddress"
            schema-prefix="deliveryAddress."
            :form-ref="formRef"
            not-po-box
          />
        </FormSection>

        <FormSection
          :label="$t('label.mailingAddress')"
          :invalid="formErrors.mailing"
        >
          <UCheckbox
            v-model="state.sameAsDelivery"
            :label="$t('label.sameAsDeliveryAddress')"
            :ui="{ root: 'items-center' }"
          />

          <FormAddress
            v-if="!state.sameAsDelivery"
            id="mailing-address"
            v-model="state.mailingAddress"
            schema-prefix="mailingAddress."
            :form-ref="formRef"
          />
        </FormSection>

        <div class="flex gap-6 justify-end">
          <UButton
            :label="$t('btn.done')"
            type="submit"
            class="font-bold"
            size="xl"
          />
          <UButton
            :label="$t('btn.cancel')"
            variant="outline"
            size="xl"
            @click="$emit('cancel')"
          />
        </div>
      </div>
    </div>
  </UForm>
</template>
