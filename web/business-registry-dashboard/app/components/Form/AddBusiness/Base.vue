<script setup lang="ts">
import { z } from 'zod'
import type { FetchError } from 'ofetch'

interface AuthOption {
  slot: string
  label: string
}

const brdModal = useBrdModals()
const accountStore = useConnectAccountStore()
const affStore = useAffiliationsStore()
const { $authApiBRD } = useNuxtApp()
const keycloak = reactive(useKeycloak())
const toast = useToast()
const { t } = useI18n()

const props = defineProps<{
  authOptions: AuthOption[]
  contactEmail: string
  identifier: string
  accounts: Array<{branchName: string, name: string, uuid: string }>
  businessDetails: {
    isFirm: boolean
    isCorporation: boolean
    isBenefit: boolean
    isCoop: boolean
    name: string
    identifier: string
  }
  isCorpOrBenOrCoop: boolean
}>()

const emit = defineEmits<{
  businessError: [{ error: FetchError, type: 'email' | 'delegation' | 'firm' | 'passcode' }]
  emailSuccess: [void]
}>()

const formRef = ref()
const noOptionAlert = ref<boolean>(false)
const loading = ref<boolean>(false)
const formState = reactive<{
  partner: { name: string | undefined, certify: boolean | undefined },
  passcode: string | undefined,
  delegation: { account: { name: string, branchName?: string, uuid: string } | undefined, message: string | undefined },
  options: number,
  selectedOption: string | undefined
}>({
  partner: {
    name: undefined,
    certify: undefined
  },
  passcode: undefined,
  delegation: {
    account: undefined,
    message: undefined
  },
  options: 0,
  selectedOption: undefined
})

const openAuthOption = computed<AuthOption | null>(() => {
  formState.options = props.authOptions.length
  if (formState.selectedOption) {
    return props.authOptions.find(option => option.slot === formState.selectedOption) ?? null
  }
  return null
})

const formSchema = computed(() => {
  const openOption = openAuthOption.value?.slot // selected auth option

  if (openOption === 'passcode-option') { // return passcode schema if passcode is the open option
    return z.object({
      passcode: props.businessDetails.isCoop
        ? z.string({ required_error: t('form.manageBusiness.authOption.passcode.fields.passcode.error.coop.required') })
          .length(9, t('form.manageBusiness.authOption.passcode.fields.passcode.error.coop.length'))
          .refine(val => /^\d+$/.test(val), t('form.manageBusiness.authOption.passcode.fields.passcode.error.coop.type'))
        : z.string({ required_error: t('form.manageBusiness.authOption.passcode.fields.passcode.error.default.required') })
          .min(8, t('form.manageBusiness.authOption.passcode.fields.passcode.error.default.length'))
          .max(15, t('form.manageBusiness.authOption.passcode.fields.passcode.error.default.length'))
    })
  }

  if (openOption === 'firm-option') {
    return z.object({
      partner: z.object({
        name: z.string({ required_error: t('form.manageBusiness.authOption.firm.fields.name.error.required') })
          .max(150, t('form.manageBusiness.authOption.firm.fields.name.error.max')),
        certify: z.boolean({ required_error: t('form.manageBusiness.authOption.firm.fields.certify.error') }).refine(val => val === true)
      })
    })
  }

  if (openOption === 'delegation-option') {
    return z.object({
      delegation: z.object({
        account: z.any().refine(
          obj => obj !== undefined,
          { message: t('form.manageBusiness.authOption.delegation.fields.account.error.required') }
        ),
        message: z.string().optional()
      })
    })
  }

  // Return an empty schema if no option is open
  return z.object({})
})

const delegationLabel = computed(() => {
  const account = formState.delegation.account

  if (account?.name !== undefined) {
    if (account.branchName) {
      return `${account.name} - ${account.branchName}`
    }
    return account.name
  } else {
    return t('form.manageBusiness.authOption.delegation.fields.account.placeholder')
  }
})

// TODO: move to store
async function handleEmailOption () {
  // Sending authorization email
  try {
    const payload: CreateAffiliationInvitation = {
      fromOrgId: Number(accountStore.currentAccount.id),
      businessIdentifier: props.identifier,
      // @ts-expect-error - toOrgId has to be null, as this is a bug on the backend
      toOrgId: null,
      type: 'EMAIL'
    }

    await $authApiBRD('/affiliationInvitations', {
      method: 'POST',
      body: payload
    })
    affStore.newlyAddedIdentifier = props.identifier
    emit('emailSuccess')
  } catch (error) {
    const e = error as FetchError
    emit('businessError', { error: e, type: 'email' })
  }
}

// TODO: move to store
async function handleDelegationOption () {
  try {
    const payload = {
      fromOrgId: Number(accountStore.currentAccount.id),
      toOrgUuid: formState.delegation.account?.uuid,
      businessIdentifier: props.identifier,
      type: 'REQUEST',
      additionalMessage: formState.delegation.message
    }

    await $authApiBRD('/affiliationInvitations', {
      method: 'POST',
      body: payload
    })

    toast.add({ title: t('form.manageBusiness.toast.emailSent') }) // add success toast
    affStore.newlyAddedIdentifier = props.identifier
    await affStore.loadAffiliations() // update table with new affilitations
    brdModal.close() // close modal
  } catch (error) {
    const e = error as FetchError
    emit('businessError', { error: e, type: 'delegation' })
  }
}

// TODO: move to store
async function submitManageRequest () {
  if (!openAuthOption.value) {
    noOptionAlert.value = true
    return
  }

  loading.value = true

  await affStore.deletePendingInvitations(props.identifier) // delete any existing pending affiliations

  if (openAuthOption.value.slot === 'email-option') { // try submitting email option
    await handleEmailOption()
  } else if (openAuthOption.value.slot === 'delegation-option') { // try submitting delegation option
    await handleDelegationOption()
  } else { // handle passcode or firm option
    try {
      const payload: LoginPayload = {
        businessIdentifier: props.identifier,
        certifiedByName: `${keycloak.kcUser.lastName}, ${keycloak.kcUser.firstName}`,
        passCode: openAuthOption.value.slot === 'firm-option' ? formState.partner.name : formState.passcode
      }

      await affStore.createAffiliation(payload)

      toast.add({ title: t('form.manageBusiness.toast.success', { identifier: props.identifier }) }) // add success toast
      await affStore.loadAffiliations() // update table with new affilitations
      brdModal.close() // close modal
    } catch (error) {
      const e = error as FetchError
      if (openAuthOption.value.slot === 'firm-option') {
        emit('businessError', { error: e, type: 'firm' })
      } else {
        emit('businessError', { error: e, type: 'passcode' })
      }
    }
  }
  loading.value = false
}

watch(() => formState.selectedOption, () => {
  noOptionAlert.value = false // reset no option alert if selected option changes
  formRef.value?.clear() // clear form errors if selected option changes

  // reset form state if selected option changes
  formState.passcode = undefined
  formState.delegation.message = undefined
  formState.delegation.account = undefined
  formState.partner.name = undefined
  formState.partner.certify = undefined
})

// Auto-select the option when there's only one
watch(() => props.authOptions, (newOptions) => {
  if (newOptions.length === 1 && !formState.selectedOption) {
    formState.selectedOption = newOptions[0]?.slot
  }
}, { immediate: true })
</script>
<template>
  <UForm
    ref="formRef"
    class="space-y-4"
    :schema="formSchema"
    :state="formState"
    @submit="submitManageRequest"
    @error="handleFormErrorEvent"
  >
    <fieldset class="space-y-4">
      <legend class="text-bcGovColor-darkGray">
        <div>{{ $t('form.manageBusiness.legend') }}</div>
        <div v-if="formState.options >= 2" class="mt-1">
          {{ $t('form.manageBusiness.chooseOption') }}
        </div>
      </legend>

      <!-- Radio button options -->
      <div
        :class="[
          'space-y-4',
          { 'border-l-4 border-red-500 pl-4': !formState.selectedOption && noOptionAlert }
        ]"
      >
        <div
          v-for="(option, index) in authOptions"
          :key="option.slot"
          :class="authOptions.length > 1 ? 'space-y-4 pl-2' : 'space-y-4'"
        >
          <label v-if="authOptions.length > 1" class="flex cursor-pointer items-start space-x-3">
            <input
              v-model="formState.selectedOption"
              :value="option.slot"
              type="radio"
              class="custom-radio mt-1 size-4"
            >
            <div class="flex flex-col">
              <span
                :class="[
                  'text-base text-bcGovColor-darkGray',
                  formState.selectedOption === option.slot ? 'font-bold' : 'font-normal'
                ]"
              >
                {{ option.label }}
              </span>
              <span
                v-if="option.slot === 'email-option' && businessDetails.isCoop"
                class="mt-1 text-sm text-bcGovColor-midGray"
              >
                {{ $t('form.manageBusiness.authOption.email.coopSubtext') }}
              </span>
            </div>
          </label>

          <!-- For single option, show just the label without radio button -->
          <div v-else class="text-base font-bold text-bcGovColor-darkGray">
            {{ option.label }}
            <div
              v-if="option.slot === 'email-option' && businessDetails.isCoop"
              class="mt-1 text-sm font-normal text-bcGovColor-midGray"
            >
              {{ $t('form.manageBusiness.authOption.email.coopSubtext') }}
            </div>
          </div>

          <!-- Show content when this option is selected -->
          <div v-if="formState.selectedOption === option.slot" :class="authOptions.length > 1 ? 'ml-7 space-y-4' : 'space-y-4'">
            <!-- passcode option content -->
            <div v-if="option.slot === 'passcode-option'">
              <UFormGroup
                :help="businessDetails.isCoop ? t('form.manageBusiness.authOption.passcode.fields.passcode.help.coop') : t('form.manageBusiness.authOption.passcode.fields.passcode.help.default')"
                name="passcode"
                data-testid="formgroup-passcode-input"
              >
                <UInput
                  v-model="formState.passcode"
                  :placeholder="businessDetails.isCoop ? t('form.manageBusiness.authOption.passcode.fields.passcode.placeholder.coop') : t('form.manageBusiness.authOption.passcode.fields.passcode.placeholder.default')"
                  :aria-label="businessDetails.isCoop ? t('form.manageBusiness.authOption.passcode.fields.passcode.arialabel.coop') : t('form.manageBusiness.authOption.passcode.fields.passcode.arialabel.default')"
                  :variant="handleFormInputVariant('passcode', formRef?.errors)"
                  :maxlength="businessDetails.isCoop ? 9 : 15"
                />
              </UFormGroup>
            </div>

            <!-- firm option content -->
            <div v-if="option.slot === 'firm-option'" class="space-y-4 pb-4">
              <UFormGroup
                data-testid="formgroup-firm-input"
                name="partner.name"
                :help="$t('form.manageBusiness.authOption.firm.fields.name.help')"
              >
                <UInput
                  v-model="formState.partner.name"
                  :placeholder="$t('form.manageBusiness.authOption.firm.fields.name.placeholder')"
                  :aria-label="$t('form.manageBusiness.authOption.firm.fields.name.arialabel')"
                  :variant="handleFormInputVariant('partner.name', formRef?.errors)"
                />
              </UFormGroup>

              <UFormGroup
                name="partner.certify"
                data-testid="formgroup-firm-checkbox"
              >
                <UCheckbox v-model="formState.partner.certify">
                  <template #label>
                    <span
                      class="text-sm"
                      :class="handleFormInputVariant('partner.certify', formRef?.errors) === 'error' ? 'text-red-500' : 'text-bcGovColor-midGray'"
                    >
                      <ConnectI18nBold translation-path="form.manageBusiness.authOption.firm.fields.certify.label" :name="`${keycloak.kcUser.lastName}, ${keycloak.kcUser.firstName}`" />
                    </span>
                  </template>
                </UCheckbox>
              </UFormGroup>
            </div>

            <!-- email option content -->
            <div v-if="option.slot === 'email-option'" data-testid="formgroup-email" class="space-y-4 text-base text-bcGovColor-midGray">
              <div>
                {{ props.isCorpOrBenOrCoop
                  ? $t('form.manageBusiness.authOption.email.sentTo.corpOrBenOrCoop')
                  : businessDetails.isFirm
                    ? $t('form.manageBusiness.authOption.email.sentTo.firm')
                    : $t('form.manageBusiness.authOption.email.sentTo.default') }}
              </div>
              <div><b>{{ contactEmail }}</b></div>
              <div class="mb-4 mr-1 mt-1">
                {{ $t('form.manageBusiness.authOption.email.instructions') }}
              </div>
              <!-- On hold for form.
              <div class="mt-3">
                {{ $t('form.manageBusiness.authOption.email.update') }}
                <a
                  href=""
                  target="_blank"
                  class="text-blue-500 underline"
                >{{ $t('form.manageBusiness.missingInfo.fragmentPrt2') }}
                </a>
                <UIcon
                  name="i-mdi-open-in-new"
                  class="ml-1 size-4 text-bcGovColor-activeBlue"
                />
              </div> -->
            </div>

            <!-- delegation option content -->
            <div v-if="option.slot === 'delegation-option'" class="text-base">
              <UFormGroup
                data-testid="formgroup-delegation-account"
                name="delegation.account"
                class="pb-6"
              >
                <USelectMenu
                  v-model="formState.delegation.account"
                  :options="accounts"
                  option-attribute="name"
                  :ui="{
                    trigger: 'flex items-center w-full'
                  }"
                >
                  <template #default="{ open }">
                    <UButton
                      data-testid="delegation-select-menu"
                      variant="select_menu_trigger"
                      class="flex-1 justify-between text-gray-700"
                      :aria-label="t('form.manageBusiness.authOption.delegation.fields.account.arialabel', { account: formState.delegation.account?.name ?? $t('words.none') })"
                    >
                      {{ delegationLabel }}

                      <UIcon name="i-mdi-caret-down" class="size-5 text-gray-700 transition-transform" :class="[open && 'rotate-180']" />
                    </UButton>
                  </template>
                  <template #option="{ option: selectOption }">
                    <span v-if="selectOption.branchName">
                      {{ selectOption.name }} - {{ selectOption.branchName }}
                    </span>
                    <span v-else>
                      {{ selectOption.name }}
                    </span>
                  </template>
                </USelectMenu>
              </UFormGroup>
              <UFormGroup
                data-testid="formgroup-delegation-message"
                name="delegation.message"
                :ui="{ label: { base: 'block py-5 font-normal text-gray-700 dark:text-gray-200' } }"
              >
                <UTextarea
                  v-model.trim="formState.delegation.message"
                  :placeholder="$t('form.manageBusiness.authOption.delegation.fields.message.placeholder')"
                  maxlength="400"
                  :ui="{
                    placeholder: 'placeholder-gray-700',
                    color: {
                      white: {
                        outline: 'shadow-sm bg-gray-100 text-gray-900 pt-3 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-500',
                      }}
                  }"
                />
              </UFormGroup>
              <span class="px-3 py-6 text-xs font-normal text-gray-700 dark:text-gray-200">{{ $t('form.manageBusiness.authOption.delegation.fields.message.label') }}</span>
            </div>
          </div>

          <!-- Add divider between options (except after the last one) -->
          <hr v-if="index < authOptions.length - 1" class="border-gray-300">
        </div>
      </div>
    </fieldset>

    <!-- TODO: make this accessible? -->
    <UAlert
      v-if="noOptionAlert"
      data-testid="no-option-alert"
      icon="i-mdi-alert"
      color="red"
      variant="error"
      :description="$t('form.manageBusiness.noOptionAlert')"
    />

    <div class="pt-6">
      <div class="place-content-start justify-start">
        <HelpBusinessContact />
      </div>
      <div class="xs:mt-6 flex max-w-xl sm:mt-6 sm:justify-center md:-mt-6 md:place-content-end md:justify-end md:place-self-end">
        <UButton
          :label="$t('btn.cancel')"
          variant="outline"
          :ui="{ base: 'h-11 rounded' }"
          @click="brdModal.close()"
        />
        <UButton
          :label="$t('form.manageBusiness.submitBtn')"
          type="submit"
          class="ml-5 flex flex-none"
          :loading
          :ui="{ base: 'h-11 rounded' }"
        />
      </div>
    </div>
  </UForm>
</template>

<style>
/*
 * Custom radio button styling - overriding default browser appearance
 * The default browser radio buttons didn't match the design needed.
 * We needed blue borders and custom checked state (blue dot)
 * Using appearance: none removes native styling so we can apply our custom design.
 */
.custom-radio {
  appearance: none;
  border: 2px solid theme('colors.bcGovColor.activeBlue');
  border-radius: 50%;
  cursor: pointer;
  position: relative;
}

.custom-radio:checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: theme('colors.bcGovColor.activeBlue');
}
</style>
