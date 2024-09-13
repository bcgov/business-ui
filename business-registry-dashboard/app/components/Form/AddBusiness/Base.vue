<script setup lang="ts">
import type { AccordionItem } from '#ui/types'
import { z } from 'zod'
const brdModal = useBrdModals()
const accountStore = useConnectAccountStore()
const affStore = useAffiliationsStore()
const { $authApi } = useNuxtApp()
const keycloak = reactive(useKeycloak())
const toast = useToast()
const { t } = useI18n()

const props = defineProps<{
  authOptions: AccordionItem[]
  contactEmail: string
  identifier: string
  accounts: Array<{branchName: string, name: string, uuid: string }>
  businessDetails: {
    isFirm: boolean
    isCorporation: boolean
    isBenefit: boolean
    isCorpOrBenOrCoop: boolean
    isCoop: boolean
    name: string
    identifier: string
  }
}>()

const emit = defineEmits<{
  businessError: [{ error: FetchError, type: string }]
  emailSuccess: [void]
}>()

const formRef = ref()
const accordianRef = ref()
const noOptionAlert = ref<boolean>(false)
const loading = ref<boolean>(false)
const formState = reactive<{
  partner: { name: string | undefined, certify: boolean | undefined },
  passcode: string | undefined,
  delegation: { account: { name: string, branchName?: string, uuid: string } | undefined, message: string | undefined }
}>({
  partner: {
    name: undefined,
    certify: undefined
  },
  passcode: undefined,
  delegation: {
    account: undefined,
    message: undefined
  }
})

const openAuthOption = computed<AccordionItem | null>(() => {
  const buttonRefs = accordianRef.value?.buttonRefs
  if (buttonRefs && buttonRefs.length > 0) {
    const openIndex = buttonRefs.findIndex((item: { open: boolean, close: any }) => item.open === true)
    return props.authOptions[openIndex] ?? null
  } else {
    return null
  }
})

const formSchema = computed(() => {
  const openOption = openAuthOption.value?.slot // open accordian

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
      toOrgId: null
    }

    await $authApi('/affiliationInvitations', {
      method: 'POST',
      body: payload
    })

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

    await $authApi('/affiliationInvitations', {
      method: 'POST',
      body: payload
    })

    toast.add({ title: t('form.manageBusiness.toast.emailSent') }) // add success toast
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
  console.log('submitting form')
  loading.value = true
  // await handleRemoveExistingAffiliationInvitation() // TODO: figure out if this is necessary, I do not think it is
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
      emit('businessError', { error: e, type: 'other' })
    }
  }
  loading.value = false
}

watch(openAuthOption, () => {
  noOptionAlert.value = false // reset no option alert if open option changes
  formRef.value?.clear() // clear form errors if open option changes

  // reset form state if open option changes
  formState.passcode = undefined
  formState.delegation.message = undefined
  formState.delegation.account = undefined
  formState.partner.name = undefined
  formState.partner.certify = undefined
})
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
      <legend>{{ $t('form.manageBusiness.legend') }}</legend>

      <UAccordion
        ref="accordianRef"
        :items="authOptions"
        :ui="{
          wrapper: 'w-full flex flex-col divide-y divide-gray-300 border-y border-gray-300',
          default: {
            variant: 'accordian_trigger',
          }
        }"
      >
        <!-- accordian button -->
        <!-- TODO: add aria-describedby property to give instructions on using the given option??? -->
        <template #default="{ item, open }">
          <UButton
            variant="accordian_trigger"
            data-testid="auth-option-button"
          >
            <span
              class="text-left"
              :class="{ 'font-semibold text-bcGovColor-darkGray': open, 'font-normal text-blue-500': !open }"
            >
              {{ item.label }}
            </span>

            <template #trailing>
              <UIcon
                name="i-heroicons-chevron-down-20-solid"
                class="ms-auto size-5 shrink-0 transition-transform duration-200"
                :class="[open && 'rotate-180', open ? 'text-bcGovColor-darkGray' : 'text-blue-500']"
              />
            </template>
          </UButton>
        </template>

        <!-- passcode option slot -->
        <template #passcode-option>
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
        </template>

        <!-- firm option slot -->
        <template #firm-option>
          <div class="space-y-4 pb-4">
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
                    :class="handleFormInputVariant('partner.certify', formRef?.errors) === 'error' ? 'text-red-500' : 'text-bcGovColor-darkGray'"
                  >
                    <SbcI18nBold translation-path="form.manageBusiness.authOption.firm.fields.certify.label" :name="`${keycloak.kcUser.lastName}, ${keycloak.kcUser.firstName}`" />
                  </span>
                </template>
              </UCheckbox>
            </UFormGroup>
          </div>
        </template>

        <!-- email option slot -->
        <template #email-option>
          <div data-testid="formgroup-email">
            <div>
              {{ businessDetails.isCorpOrBenOrCoop
                ? $t('form.manageBusiness.authOption.email.sentTo.corpOrBenOrCoop')
                : businessDetails.isFirm
                  ? $t('form.manageBusiness.authOption.email.sentTo.firm')
                  : $t('form.manageBusiness.authOption.email.sentTo.default') }}
            </div>
            <div><b>{{ contactEmail }}</b></div>
            <div class="mb-4 mr-1 mt-1">
              {{ $t('form.manageBusiness.authOption.email.instructions') }}
            </div>
          </div>
        </template>

        <!-- delegation option slot -->
        <template #delegation-option>
          <div class="-mt-4 space-y-4 pb-6">
            <UFormGroup
              data-testid="formgroup-delegation-account"
              name="delegation.account"
              :label="t('form.manageBusiness.authOption.delegation.fields.account.label')"
              :ui="{ label: { base: 'block pt-3 pb-1 font-normal text-gray-700 dark:text-gray-200' } }"
            >
              <USelectMenu
                v-model="formState.delegation.account"
                :options="accounts"
                option-attribute="name"
                :ui="{
                  trigger: 'flex items-center w-full h-[42px]'
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
                <template #option="{ option }">
                  <span v-if="option.branchName">
                    {{ option.name }} - {{ option.branchName }}
                  </span>
                  <span v-else>
                    {{ option.name }}
                  </span>
                </template>
              </USelectMenu>
            </UFormGroup>

            <UFormGroup
              data-testid="formgroup-delegation-message"
              name="delegation.message"
              :label="$t('form.manageBusiness.authOption.delegation.fields.message.label')"
              :ui="{ label: { base: 'block pt-3 pb-1 font-normal text-gray-700 dark:text-gray-200' } }"
            >
              <UTextarea
                v-model.trim="formState.delegation.message"
                :placeholder="$t('form.manageBusiness.authOption.delegation.fields.message.placeholder')"
                maxlength="400"
                :ui="{
                  placeholder: 'placeholder-gray-700',
                  color: {
                    white: {
                      outline: 'shadow-sm bg-gray-100 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-500',
                    }}
                }"
              />
            </UFormGroup>
          </div>
        </template>
      </UAccordion>
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

    <div class="ml-auto mt-auto flex justify-end gap-2">
      <UButton
        :label="$t('btn.cancel')"
        variant="outline"
        @click="brdModal.close()"
      />
      <UButton
        :label="$t('form.manageBusiness.submitBtn')"
        type="submit"
        :loading
      />
    </div>
  </UForm>
</template>
