<script setup lang="ts">
import * as z from 'zod'
import type { Form } from '@nuxt/ui'

const { t } = useI18n()

const schema = z.object({
  name: z.object({
    first: z.string().optional(),
    middle: z.string().optional(),
    last: z.string().min(2)
  }),
  roles: z.string().array().min(1),
  mailingAddress: getRequiredAddress(
    t('validation.address.street'),
    t('validation.address.city'),
    t('validation.address.region'),
    t('validation.address.postalCode'),
    t('validation.address.country')
  ),
  deliveryAddress: getRequiredAddress(
    t('validation.address.street'),
    t('validation.address.city'),
    t('validation.address.region'),
    t('validation.address.postalCode'),
    t('validation.address.country')
  )
})

type Schema = z.output<typeof schema>

const state = ref<Schema>({
  name: {
    first: '',
    middle: '',
    last: ''
  },
  roles: [],
  mailingAddress: {
    street: '',
    streetAdditional: '',
    city: '',
    region: '',
    postalCode: '',
    country: '',
    locationDescription: ''
  },
  deliveryAddress: {
    street: '',
    streetAdditional: '',
    city: '',
    region: '',
    postalCode: '',
    country: '',
    locationDescription: ''
  }
})

const formRef = useTemplateRef('officer-form')

const items = [
  { label: 'Chief Executive Officer', value: 'ceo' },
  { label: 'Treasurer', value: 'treasurer' },
  { label: 'Chief Financial Officer', value: 'cfo' },
  { label: 'Secretary', value: 'secretary' },
  { label: 'President', value: 'president' },
  { label: 'Assistant Secretary', value: 'assistant-secretary' },
  { label: 'Vice President', value: 'vp' },
  { label: 'Other Office(s)', value: 'other' },
  { label: 'Chair', value: 'chair' }
]

const roles = ref([])

watchEffect(() => console.log(roles.value))
</script>

<template>
  <div class="py-10 space-y-10">
    <h1>Officer Change</h1>

    <UForm
      ref="officer-form"
      :state
      :schema
      class="bg-white rounded-sm p-6 max-w-4xl mx-auto"
      :validate-on="['blur']"
    >
      <div class="flex flex-col sm:flex-row gap-6">
        <h2 class="w-1/4 font-bold text-bcGovGray-900 text-base">
          Add Officer
        </h2>
        <div class="flex flex-col gap-8">
          <FormSection
            label="Name"
            :invalid="false"
          >
            <div class="flex flex-col gap-4 sm:flex-row">
              <UFormField
                v-slot="{ error }"
                name="name.first"
                class="grow flex-1"
              >
                <ConnectInput
                  id="first-name"
                  v-model="state.name.first"
                  required
                  :invalid="!!error"
                  label="First Name"
                />
              </UFormField>
              <UFormField
                v-slot="{ error }"
                name="name.middle"
                class="grow flex-1"
              >
                <ConnectInput
                  id="middle-name"
                  v-model="state.name.middle"
                  :invalid="!!error"
                  label="Middle Name (Optional)"
                />
              </UFormField>
              <UFormField
                v-slot="{ error }"
                name="name.last"
                class="grow flex-1"
              >
                <ConnectInput
                  id="last-name"
                  v-model="state.name.last"
                  required
                  :invalid="!!error"
                  label="Last Name"
                />
              </UFormField>
            </div>
          </FormSection>

          <FormSection
            label="Roles"
            :invalid="false"
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
                Choose at least one role
              </div>
              <FormCheckboxGroup
                v-model="roles"
                :items
              />
            </UFormField>
          <!-- <div class="flex flex-col gap-4 sm:flex-row">
            <UFormField
              v-slot="{ error }"
              name="name.first"
              class="grow flex-1"
            >
              <ConnectInput
                id="first-name"
                v-model="state.name.first"
                required
                :invalid="!!error"
                label="First Name"
              />
            </UFormField>
            <UFormField
              v-slot="{ error }"
              name="name.middle"
              class="grow flex-1"
            >
              <ConnectInput
                id="middle-name"
                v-model="state.name.middle"
                :invalid="!!error"
                label="Middle Name (Optional)"
              />
            </UFormField>
            <UFormField
              v-slot="{ error }"
              name="name.last"
              class="grow flex-1"
            >
              <ConnectInput
                id="last-name"
                v-model="state.name.last"
                required
                :invalid="!!error"
                label="Last Name"
              />
            </UFormField>
          </div> -->
          </FormSection>

          <FormSection
            label="Mailing Address"
            :invalid="false"
          >
            <FormAddress
              id="mailing-address"
              v-model="state.mailingAddress"
              schema-prefix="mailingAddress."
              :form-ref="formRef"
            />
          </FormSection>

          <div class="flex gap-6 justify-end">
            <UButton
              label="Done"
              type="submit"
              class="font-bold"
              size="xl"
            />
            <UButton
              label="Cancel"
              variant="outline"
              size="xl"
            />
          </div>
        </div>
      </div>
    </UForm>
  </div>
</template>
