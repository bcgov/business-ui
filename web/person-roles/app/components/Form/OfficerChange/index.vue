<script setup lang="ts">
import type { FormErrorEvent, Form, FormSubmitEvent, FormError } from '@nuxt/ui'
import type { AcceptableValue } from 'reka-ui'
import { z } from 'zod'
import { isEqual } from 'lodash'
import { UForm } from '#components'

const na = useNuxtApp()
const { t } = useI18n()
const officerStore = useOfficerStore()

const props = withDefaults(defineProps<{
  defaultState?: Officer
  editing?: boolean
  title: string
}>(), {
  defaultState: () => ({
    id: undefined,
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

const roleSchema = z.object({
  roleType: z.enum(
    [
      OfficerRole.ASSISTANT_SECRETARY,
      OfficerRole.CEO,
      OfficerRole.CFO,
      OfficerRole.CHAIR,
      OfficerRole.OTHER,
      OfficerRole.PRESIDENT,
      OfficerRole.SECRETARY,
      OfficerRole.TREASURER,
      OfficerRole.VP
    ]
  ),
  roleClass: z.string().optional(),
  appointmentDate: z.string(),
  cessationDate: z.string().nullable().optional()
})

const schema = z.object({
  firstName: z.string().max(20, t('validation.maxChars', { count: 20 })).default(''),
  middleName: z.string().max(20, t('validation.maxChars', { count: 20 })).default(''),
  lastName: z.string().min(1, t('validation.fieldRequired')).max(30, t('validation.maxChars', { count: 30 })),
  preferredName: z.string().max(50, t('validation.maxChars', { count: 50 })).default(''),
  hasPreferredName: z.boolean(),
  mailingAddress: getRequiredAddressSchema(),
  sameAsDelivery: z.boolean(),
  deliveryAddress: getRequiredAddressSchema(),
  roles: z
    .array(roleSchema)
    .min(1, { message: t('validation.role.min') })
    .superRefine((data, ctx) => {
      const hasActiveRole = data.some(r => r.cessationDate === null)

      if (!hasActiveRole) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('validation.role.min')
        })
      }
      return z.NEVER
    })
})

type Schema = z.output<typeof schema>
const state = reactive<Schema>(props.defaultState)

const formRef = useTemplateRef<Form<Schema>>('officer-form')

const formErrors = computed<{
  name: FormError<string> | undefined
  roles: FormError<string> | undefined
  mailing: FormError<string> | undefined
  delivery: FormError<string> | undefined
}>(() => {
  const errors = formRef.value?.getErrors()
  return {
    name: errors?.find(e => e.name === 'lastName'),
    roles: errors?.find(e => e.name === 'roles'),
    mailing: errors?.find(e => e.name?.startsWith('mailingAddress')),
    delivery: errors?.find(e => e.name?.startsWith('deliveryAddress'))
  }
})

const roleOptions = [
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

const selectedRoles = computed<string[]>(() => {
  return state.roles
    .filter(role => role.cessationDate === null)
    .map(role => role.roleType)
})

function handleRoleChange(newRoles: AcceptableValue[]) {
  const todayUtc = getToday()
  const before = selectedRoles.value
  const after = newRoles as string[]

  const addedRoles = after.filter(role => !before.includes(role))
  const removedRoles = before.filter(role => !after.includes(role))

  const existingRoleMap = new Map(officerStore.initialOfficers
    .find(o => o.id === props.defaultState.id)?.roles
    .map(r => [r.roleType, r]))

  addedRoles.forEach((role) => {
    const existingRole = existingRoleMap.get(role as OfficerRole)

    if (existingRole !== undefined) {
      const roleObj = state.roles.find(r => r.roleType === role)
      if (roleObj) {
        roleObj.cessationDate = null
      }
    } else {
      state.roles.push({
        roleType: role as OfficerRole,
        roleClass: 'OFFICER',
        appointmentDate: todayUtc,
        cessationDate: null
      })
    }
  })

  removedRoles.forEach((role) => {
    const roleObj = state.roles.find(r => r.roleType === role)
    const existingRole = existingRoleMap.get(role as OfficerRole)

    if (existingRole !== undefined) {
      if (roleObj) {
        roleObj.cessationDate = todayUtc
      }
    } else {
      state.roles = state.roles.filter(r => r.roleType !== role)
    }
  })
}

function onError(event: FormErrorEvent) {
  let element: HTMLElement | null = null
  const firstEl = event.errors[0]

  if (firstEl?.name === 'roles') {
    element = document.getElementById('officer-role-options')?.querySelector('button') ?? null
  } else if (firstEl?.id) {
    element = document.getElementById(firstEl.id)
  }

  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => {
      element.focus({ preventScroll: true })
    }, 0)
  }
}

function onSubmit(e: FormSubmitEvent<Schema>) {
  const data = e.data

  // reset has preferred name options if left blank
  if (data.preferredName?.trim().length === 0) {
    data.preferredName = ''
    data.hasPreferredName = false
  }

  if (data.sameAsDelivery) {
    data.mailingAddress = data.deliveryAddress
  } else if (isEqual(data.mailingAddress, data.deliveryAddress)) {
    data.sameAsDelivery = true // set sameAsDelivery = true if both mailing and delivery are the same
  }

  // Officer and Schema type mismatch though the same object
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
      state.mailingAddress = { ...state.deliveryAddress }
    } else {
      state.mailingAddress = { ...props.defaultState.mailingAddress }
    }

    const mailingFields = [
      'mailingAddress.country',
      'mailingAddress.city',
      'mailingAddress.region',
      'mailingAddress.postalCode',
      'mailingAddress.street'
    ]

    mailingFields.forEach(item => formRef.value?.clear(item))
  },
  { immediate: true }
)

// Clear roles validation error when selecting roles
// 'blur' wont clear errors for this field
watch(
  () => state.roles,
  (v) => {
    if (v) {
      formRef.value?.clear('roles')
    }
  },
  { deep: true }
)

// reset mailing address if 'sameAsDelivery' is checked and the user makes changes to delivery address
watch(
  state.deliveryAddress,
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
  }
)

// reset preferred name field if user unselects checkbox
watch(
  () => state.hasPreferredName,
  (v) => {
    if (!v) {
      state.preferredName = ''
    }
  }
)

// handle unfinished task warnings
const unfinishedTaskMsg = ref('')
na.hook('app:officer-form:incomplete', async (payload) => {
  unfinishedTaskMsg.value = ''
  await nextTick()
  unfinishedTaskMsg.value = payload.message
  await nextTick()
  const el = document.getElementById('btn-officer-form-done')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.focus({ preventScroll: true })
  }
})

function clearUnfinishedTaskMsg() {
  if (unfinishedTaskMsg.value) {
    unfinishedTaskMsg.value = ''
  }
}
</script>

<template>
  <UForm
    ref="officer-form"
    :state
    :schema="schema"
    class="bg-white p-6"
    :class="{
      'border-l-3 border-red-600': Object.values(formErrors).some(v => v !== undefined) || unfinishedTaskMsg !== '',
      'rounded-sm shadow-sm': !editing
    }"
    :validate-on="['blur']"
    @error="onError"
    @submit="onSubmit"
    @click="clearUnfinishedTaskMsg"
    @keyup.tab="clearUnfinishedTaskMsg"
  >
    <div class="flex flex-col sm:flex-row gap-6">
      <h3
        class="w-full sm:w-1/5 font-bold text-bcGovGray-900 text-base -mt-1.5"
        :class="{ 'text-red-600': unfinishedTaskMsg !== '' }"
      >
        {{ title }}
      </h3>
      <div class="flex flex-col gap-9 w-full">
        <div class="flex flex-col gap-9 w-full">
          <FormSection
            :label="$t('label.legalName')"
            :error="formErrors.name"
          >
            <div class="flex flex-col gap-4 sm:flex-row">
              <FormFieldInput
                v-model="state.firstName"
                name="firstName"
                input-id="first-name"
                :label="$t('label.firstName')"
                autofocus
              />

              <FormFieldInput
                v-model="state.middleName"
                name="middleName"
                input-id="middle-name"
                :label="$t('label.middleNameOpt')"
              />

              <FormFieldInput
                v-model="state.lastName"
                name="lastName"
                input-id="last-name"
                required
                :label="$t('label.lastName')"
              />
            </div>

            <UCheckbox
              v-model="state.hasPreferredName"
              :label="$t('label.haspreferredName')"
              :ui="{ root: 'items-center' }"
              :class="state.hasPreferredName ? 'mb-6' : ''"
            />

            <UFormField
              v-if="state.hasPreferredName"
              name="preferredName"
              class="grow flex-1"
              :label="$t('label.preferredName')"
              :ui="{ label: 'mb-3.5' }"
            >
              <template #default="{ error }">
                <ConnectInput
                  id="preferred-name"
                  v-model="state.preferredName"
                  :invalid="!!error"
                  :label="$t('label.preferredNameOpt')"
                />
                <div
                  v-if="!error"
                  class="h-4 mt-1"
                />
              </template>
            </UFormField>
          </FormSection>
        </div>

        <FormSection
          :label="$t('label.roles')"
          :error="formErrors.roles"
          :show-error-msg="true"
          :class="state.hasPreferredName ? '-mt-5' : ''"
        >
          <UFormField
            name="roles"
            :ui="{ error: 'sr-only' }"
          >
            <UCheckboxGroup
              id="officer-role-options"
              :model-value="selectedRoles"
              :items="roleOptions"
              variant="card"
              size="lg"
              :ui="{
                fieldset: 'grid grid-cols-2 gap-4'
              }"
              @update:model-value="handleRoleChange"
            />
            <!-- <FormCheckboxGroup
              id="officer-role-options"
              :items="roleOptions"
              :model-value="selectedRoles"
              @update:model-value="handleRoleChange"
            /> -->
          </UFormField>
        </FormSection>

        <FormSection
          :label="$t('label.deliveryAddress')"
          :error="formErrors.delivery"
        >
          <FormAddress
            id="delivery-address"
            v-model="state.deliveryAddress"
            schema-prefix="deliveryAddress."
            :form-ref="formRef"
            not-po-box
            :excluded-fields="['streetName', 'streetNumber', 'unitNumber']"
          />
        </FormSection>

        <FormSection
          :label="$t('label.mailingAddress')"
          :error="formErrors.mailing"
        >
          <UCheckbox
            v-model="state.sameAsDelivery"
            :label="$t('label.sameAsDeliveryAddress')"
            :ui="{ root: 'items-center' }"
            :class="state.sameAsDelivery ? '' : 'mb-6'"
          />

          <FormAddress
            v-if="!state.sameAsDelivery"
            id="mailing-address"
            v-model="state.mailingAddress"
            schema-prefix="mailingAddress."
            :form-ref="formRef"
            :excluded-fields="['streetName', 'streetNumber', 'unitNumber']"
          />
        </FormSection>

        <div class="flex sm:flex-row flex-col gap-4 justify-end sm:items-center -mt-5">
          <p
            class="text-red-600 text-base"
            role="alert"
          >
            {{ unfinishedTaskMsg }}
          </p>
          <div class="flex gap-6 justify-end">
            <UButton
              :label="$t('btn.cancel')"
              variant="outline"
              size="xl"
              @click="$emit('cancel')"
            />
            <UButton
              id="btn-officer-form-done"
              :label="$t('btn.done')"
              type="submit"
              class="font-bold"
              size="xl"
            />
          </div>
        </div>
      </div>
    </div>
  </UForm>
</template>
