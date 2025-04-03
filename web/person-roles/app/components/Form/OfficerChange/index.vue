<script setup lang="ts">
import type { FormErrorEvent } from '@nuxt/ui'
import { z } from 'zod'

const { t } = useI18n()

const props = withDefaults(defineProps<{
  defaultState?: Partial<Officer>
  editing?: boolean
}>(), {
  defaultState: () => ({
    firstName: '',
    middleName: '',
    lastName: '',
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
    }
  })
})

defineEmits<{
  cancel: []
}>()

const formRef = useTemplateRef('officer-form')

const sameAsMailing = ref(false)

const schema = z.object({})

const nameSchema = z.object({
  firstName: z.string().optional(),
  middleName: z.string().optional(),
  lastName: z
    .string({ required_error: t('validation.fieldRequired') })
    .min(2, { message: t('validation.minChars', { count: 2 }) })
})

const rolesSchema = z.object({
  roles: z.string().array().min(1, { message: t('validation.role.min') })
})

const mailingSchema = z.object({
  mailingAddress: getRequiredAddress(
    t('validation.address.street'),
    t('validation.address.city'),
    t('validation.address.region'),
    t('validation.address.postalCode'),
    t('validation.address.country')
  )
  // sameAsMailing: z.boolean().default(false)
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

type Schema = z.output<typeof schema>
type NameSchema = z.output<typeof nameSchema>
type MailingSchema = z.output<typeof mailingSchema>
type DeliverySchema = z.output<typeof deliverySchema>

const state = reactive<Partial<Schema & NameSchema & MailingSchema & DeliverySchema>>(props.defaultState)

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

const formErrors = computed<{ name: boolean, roles: boolean, mailing: boolean, delivery: boolean }>(() => {
  return {
    name: !!formRef.value?.errors.some(item => item.name?.includes('name')),
    roles: !!formRef.value?.errors.some(item => item.name?.includes('roles')),
    mailing: !!formRef.value?.errors.some(item => item.name?.includes('mailing')),
    delivery: sameAsMailing.value ? false : !!formRef.value?.errors.some(item => item.name?.includes('delivery'))
  }
})

async function onError(event: FormErrorEvent) {
  const elId = event?.errors?.[0]?.id ?? event?.children?.[0]?.errors?.[0]?.id
  if (elId) {
    const element = document.getElementById(elId)
    // element?.scrollIntoView({ behavior: 'smooth', block: 'center' }) // TODO: fix or remove smooth scroll
    await new Promise(resolve => setTimeout(resolve, 100))
    element?.focus()
  }
}
</script>

<template>
  <UForm
    ref="officer-form"
    :state
    :schema
    class="bg-white p-6 mx-auto"
    :class="{
      'border-l-3 border-red-600': !!formRef?.errors.length,
      'rounded-sm ring ring-gray-300': !!editing
    }"
    :validate-on="['blur']"
    @error="onError"
  >
    <div class="flex flex-col sm:flex-row gap-6">
      <h2 class="w-1/4 font-bold text-bcGovGray-900 text-base">
        {{ $t('label.addOfficer') }}
      </h2>
      <div class="flex flex-col gap-8 w-full">
        <UForm
          v-if="state.firstName !== undefined"
          :state
          :schema="nameSchema"
        >
          <FormSection
            :label="$t('label.name')"
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
          </FormSection>
        </UForm>

        <UForm
          v-if="state.roles !== undefined"
          :state
          :schema="rolesSchema"
        >
          <FormSection
            :label="$t('label.roles')"
            :invalid="formErrors.roles"
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
          v-if="state.mailingAddress"
          :state
          :schema="mailingSchema"
        >
          <FormSection
            :label="$t('label.mailingAddress')"
            :invalid="formErrors.mailing"
          >
            <FormAddress
              id="mailing-address"
              v-model="state.mailingAddress"
              schema-prefix="mailingAddress."
              :form-ref="formRef"
            />
          </FormSection>
        </UForm>

        <UForm
          v-if="state.deliveryAddress"
          :state
          :schema="deliverySchema"
        >
          <FormSection
            :label="$t('label.deliveryAddress')"
            :invalid="formErrors.delivery"
          >
            <!-- <UCheckbox
            v-model="sameAsMailing"
            :label="$t('label.sameAsMailAddress')"
          /> -->

            <FormAddress
              id="delivery-address"
              v-model="state.deliveryAddress"
              schema-prefix="deliveryAddress."
              :form-ref="formRef"
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
