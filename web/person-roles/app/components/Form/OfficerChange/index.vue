<script setup lang="ts">
import type { FormErrorEvent, Form, FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
import { UForm } from '#components'

const { t } = useI18n()

const props = withDefaults(defineProps<{
  defaultState?: Partial<Officer>
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
  'officer-change': [Partial<Officer>]
}>()

const defaultMailingAddress = { ...props.defaultState.mailingAddress } as ConnectAddress // TODO: confirm default defined correctly

const emptySchema = z.object({})

const nameSchema = z.object({
  firstName: z.string().optional(),
  middleName: z.string().optional(),
  lastName: z
    .string({ required_error: t('validation.fieldRequired') })
    .min(2, { message: t('validation.minChars', { count: 2 }) }),
  preferredName: z.string().optional(),
  hasPreferredName: z.boolean().default(false)
})

const rolesSchema = z.object({
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
    .array().min(1, { message: t('validation.role.min') })
})

const mailingSchema = z.object({
  mailingAddress: getRequiredAddress(
    t('validation.address.street'),
    t('validation.address.city'),
    t('validation.address.region'),
    t('validation.address.postalCode'),
    t('validation.address.country')
  ),
  sameAsDelivery: z.boolean().default(false)
})

const deliverySchema = z.object({
  deliveryAddress: getRequiredAddress(
    t('validation.address.street'),
    t('validation.address.city'),
    t('validation.address.region'),
    t('validation.address.postalCode'),
    t('validation.address.country')
  )
})

type NameSchema = z.output<typeof nameSchema>
type RolesSchema = z.output<typeof rolesSchema>
type MailingSchema = z.output<typeof mailingSchema>
type DeliverySchema = z.output<typeof deliverySchema>

const state = reactive<Partial<NameSchema & RolesSchema & MailingSchema & DeliverySchema>>(props.defaultState)

const nameFormRef = useTemplateRef<Form<NameSchema>>('name-form')
const rolesFormRef = useTemplateRef<Form<RolesSchema>>('roles-form')
const mailingAddressFormRef = useTemplateRef<Form<MailingSchema>>('mailing-address-form')
const deliveryAddressFormRef = useTemplateRef<Form<DeliverySchema>>('delivery-address-form')

const formErrors = computed<{ name: boolean, roles: boolean, mailing: boolean, delivery: boolean }>(() => {
  return {
    name: !!nameFormRef.value?.getErrors().length,
    roles: !!rolesFormRef.value?.getErrors().length,
    mailing: !!mailingAddressFormRef.value?.getErrors().length,
    delivery: !!deliveryAddressFormRef.value?.getErrors().length
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

async function onError(event: FormErrorEvent) {
  const elId = event?.errors?.[0]?.id ?? event?.children?.[0]?.errors?.[0]?.id
  if (elId) {
    const element = document.getElementById(elId)
    // element?.scrollIntoView({ behavior: 'smooth', block: 'center' }) // TODO: fix or remove smooth scroll
    await new Promise(resolve => setTimeout(resolve, 100))
    element?.focus()
  }
}

function onSubmit(e: FormSubmitEvent<typeof state>) {
  const data = e.data

  if (data.sameAsDelivery) {
    data.mailingAddress = data.deliveryAddress
  }

  // TODO: cleanup type
  emit('officer-change', data as Partial<Officer>)
}

watch(
  () => state.sameAsDelivery,
  (v) => {
    if (v) {
      delete state.mailingAddress
      mailingAddressFormRef.value?.clear()
    } else {
      state.mailingAddress = defaultMailingAddress
    }
  },
  { immediate: true }
)

watch(
  () => state.roles,
  (v) => {
    if (v && v.length) {
      rolesFormRef.value?.validate({ silent: true })
    }
  }
)
</script>

<template>
  <UForm
    ref="officer-form"
    :state
    :schema="emptySchema"
    class="bg-white p-6"
    :class="{
      'border-l-3 border-red-600': Object.values(formErrors).some(v => v === true),
      'rounded-sm ring ring-gray-300': !editing
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
        <UForm
          v-if="state.firstName !== undefined"
          ref="name-form"
          :state
          :schema="nameSchema"
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
              :help="$t('help.preferredName')"
              :description="$t('text.preferredNameDescription')"
              :label="$t('label.preferredName')"
            >
              <ConnectInput
                id="preferred-name"
                v-model="state.preferredName"
                :invalid="!!error"
                :label="$t('label.preferredNameOpt')"
              />
            </UFormField>
          </FormSection>
        </UForm>

        <UForm
          v-if="state.roles !== undefined"
          ref="roles-form"
          :state
          :schema="rolesSchema"
        >
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
                v-model="state.roles"
                :items="roles"
              />
            </UFormField>
          </FormSection>
        </UForm>

        <UForm
          v-if="state.deliveryAddress"
          ref="delivery-address-form"
          :state
          :schema="deliverySchema"
        >
          <FormSection
            :label="$t('label.deliveryAddress')"
            :invalid="formErrors.delivery"
          >
            <FormAddress
              id="delivery-address"
              v-model="state.deliveryAddress"
              schema-prefix="deliveryAddress."
              :form-ref="deliveryAddressFormRef"
            />
          </FormSection>
        </UForm>

        <UForm
          v-if="state.deliveryAddress"
          ref="mailing-address-form"
          :state
          :schema="state.sameAsDelivery ? emptySchema : mailingSchema"
        >
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
              v-if="state.mailingAddress"
              id="mailing-address"
              v-model="state.mailingAddress"
              schema-prefix="mailingAddress."
              :form-ref="mailingAddressFormRef"
            />
          </FormSection>
        </UForm>

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
