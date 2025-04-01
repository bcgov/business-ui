<script setup lang="ts">
import type { FormErrorEvent } from '@nuxt/ui'
import { z } from 'zod'

const { t } = useI18n()
const formRef = useTemplateRef('officer-form')

const sameAsMailing = ref(false)

const schema = computed(() => z.object({
  name: z.object({
    first: z.string().optional(),
    middle: z.string().optional(),
    last: z
      .string({ required_error: t('validation.fieldRequired') })
      .min(2, { message: t('validation.minChars', { count: 2 }) })
  }),
  roles: z.string().array().min(1, { message: t('validation.role.min') }),
  mailingAddress: getRequiredAddress(
    t('validation.address.street'),
    t('validation.address.city'),
    t('validation.address.region'),
    t('validation.address.postalCode'),
    t('validation.address.country')
  ),
  deliveryAddress: sameAsMailing.value
    ? z.object({})
    : getRequiredAddress(
      t('validation.address.street'),
      t('validation.address.city'),
      t('validation.address.region'),
      t('validation.address.postalCode'),
      t('validation.address.country')
    )
}))

type Schema = z.output<typeof schema.value>

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
  if (event?.errors?.[0]?.id) {
    console.info(event.errors)
    const element = document.getElementById(event.errors[0].id)

    // element?.scrollIntoView({ behavior: 'smooth', block: 'center' }) // TODO: fix or remove smooth scroll
    await new Promise(resolve => setTimeout(resolve, 100))
    element?.focus()
  }
}

watchDebounced(
  [sameAsMailing, () => state.value.mailingAddress],
  ([same, address]) => {
    if (same) {
      state.value.deliveryAddress = { ...address }
    }
  },
  { debounce: 100, deep: true }
)
</script>

<template>
  <UForm
    ref="officer-form"
    :state
    :schema
    class="bg-white rounded-sm p-6 max-w-4xl mx-auto ring ring-gray-300"
    :class="{ 'border-l-3 border-red-600': !!formRef?.errors.length }"
    :validate-on="['blur']"
    @submit="(e) => console.log(e.data)"
    @error="onError"
  >
    <div class="flex flex-col sm:flex-row gap-6">
      <h2 class="w-1/4 font-bold text-bcGovGray-900 text-base">
        {{ $t('label.addOfficer') }}
      </h2>
      <div class="flex flex-col gap-8">
        <FormSection
          :label="$t('label.name')"
          :invalid="formErrors.name"
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
                :invalid="!!error"
                :label="$t('label.firstName')"
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
                :label="$t('label.middleNameOpt')"
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
                :label="$t('label.lastName')"
              />
            </UFormField>
          </div>
        </FormSection>

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

        <FormSection
          :label="$t('label.deliveryAddress')"
          :invalid="formErrors.delivery"
        >
          <UCheckbox
            v-model="sameAsMailing"
            :label="$t('label.sameAsMailAddress')"
          />

          <FormAddress
            v-if="!sameAsMailing"
            id="delivery-address"
            v-model="state.deliveryAddress"
            schema-prefix="deliveryAddress."
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
          />
        </div>
      </div>
    </div>
  </UForm>
</template>
