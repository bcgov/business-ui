<script setup lang="ts">
import type { AccordionItem } from '#ui/types'
import { z } from 'zod'
const brdModal = useBrdModals()
const accountStore = useConnectAccountStore()
const affStore = useAffiliationsStore()
const { $authApi } = useNuxtApp()
const keycloak = reactive(useKeycloak())
const toast = useToast()

const props = defineProps<{
  authOptions: AccordionItem[]
  addressType: string
  contactEmail: string
  identifier: string
  accounts: Array<{branchName: string, name: string, uuid: string }>
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

async function handleEmailOption () {
  // Sending authorization email
  try {
    const payload: CreateAffiliationInvitation = {
      fromOrgId: Number(accountStore.currentAccount.id),
      businessIdentifier: props.identifier,
      // @ts-expect-error - toOrgId has to be null, as this is a bug on the backend
      toOrgId: null
    }
    // await $authApi('/affiliationInvitations', {
    //   method: 'POST',
    //   body: payload
    // })
    emit('emailSuccess')
  } catch (error) {
    const e = error as FetchError
    emit('businessError', { error: e, type: 'email' })
  }
}

async function handleDelegationOption () {
  try {
    const payload = {
      fromOrgId: Number(accountStore.currentAccount.id),
      toOrgUuid: formState.delegation.account?.uuid,
      businessIdentifier: props.identifier,
      type: 'REQUEST',
      additionalMessage: formState.delegation.message
    }
    // await $authApi('/affiliationInvitations', {
    //   method: 'POST',
    //   body: payload
    // })

    toast.add({ title: 'Confirmation email sent, pending authorization.' }) // add success toast
    await affStore.loadAffiliations() // update table with new affilitations
    brdModal.close() // close modal
  } catch (error) {
    const e = error as FetchError
    emit('businessError', { error: e, type: 'delegation' })
  }
}

async function submitManageRequest () {
  if (!openAuthOption.value) {
    noOptionAlert.value = true
    return
  }
  loading.value = true
  // await handleRemoveExistingAffiliationInvitation() // TODO: implement ???
  if (openAuthOption.value.slot === 'email-option') { // try submitting email option
    console.log('submit email option')
    await handleEmailOption()
  } else if (openAuthOption.value.slot === 'delagation-option') { // try submitting delegation option
    console.log('submit delagation option')
    await handleDelegationOption()
  } else { // handle passcode or firm option
    console.log(' handle other options')
    // Adding business to the list
    try {
      const payload: LoginPayload = {
        businessIdentifier: props.identifier,
        certifiedByName: `${keycloak.kcUser.lastName}, ${keycloak.kcUser.firstName}`,
        passCode: openAuthOption.value.slot === 'firm-option' ? formState.partner.name : formState.passcode
      }

      console.log(payload)

      // await $authApi(`/orgs/${accountStore.currentAccount.id}/affiliations`, {
      //   method: 'POST',
      //   body: payload
      // })

      // let parent know that add was successful
      toast.add({ title: `${props.identifier} was successfully added to your table.` }) // add success toast
      await affStore.loadAffiliations() // update table with new affilitations
      brdModal.close() // close modal
    } catch (error) {
      const e = error as FetchError
      emit('businessError', { error: e, type: 'other' })
    }
  }
  loading.value = false
}

const passcodeVals = computed(() => {
  let label: string
  let help: string
  let maxlength: number

  if (props.identifier.toUpperCase().startsWith('CP')) {
    label = 'Passcode'
    help = 'Passcode must be exactly 9 digits'
    maxlength = 9
  } else {
    label = 'Password'
    help = 'Password must be 8 to 15 characters'
    maxlength = 15
  }

  return { label, help, maxlength }
})

const formSchema = computed(() => {
  const openOption = openAuthOption.value?.slot // open accordian

  if (openOption === 'passcode-option') { // return passcode schema if passcode is the open option
    return z.object({
      passcode: props.identifier.toUpperCase().startsWith('CP')
        ? z.string({ required_error: 'Passcode is required, enter the passcode you have setup in Corporate Online' })
          .length(9, 'Passcode must be exactly 9 digits')
          .refine(val => /^\d+$/.test(val), 'Passcode must be numeric')
        : z.string({ required_error: 'Password is required' })
          .min(8, 'Password must be 8 to 15 characters')
          .max(15, 'Password must be 8 to 15 characters')
    })
  }

  if (openOption === 'firm-option') {
    return z.object({
      partner: z.object({
        name: z.string({ required_error: 'Proprietor or Partner Name is required' })
          .max(150, 'Maximum 150 characters'),
        certify: z.boolean({ required_error: 'Please certify in order to continue' }).refine(val => val === true)
      })
    })
  }

  if (openOption === 'delagation-option') {
    return z.object({
      delegation: z.object({
        account: z.any().refine(
          obj => obj !== undefined,
          { message: 'Please select an account to proceed' }
        ),
        message: z.string().optional()
      })
    })
  }

  // Return an empty schema if no option is open
  return z.object({})
})

const delegationLabel = computed(() => {
  const account = formState.delegation.account as unknown as { name: string, branchName?: string, uuid: string }

  if (account?.name !== undefined) {
    if (account.branchName) {
      return `${account.name} - ${account.branchName}`
    }
    return account.name
  } else {
    return 'Select an account below'
  }
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
    <p>You must be authorized to manage this business. You can be authorized in one of the following ways:</p>

    <UAccordion
      ref="accordianRef"
      :items="authOptions"
      :ui="{
        wrapper: 'w-full flex flex-col divide-y divide-gray-300 border-y border-gray-300',
        default: {
          class: 'mb-0 py-4 w-full rounded-none'
        }
      }"
    >
      <!-- passcode option slot -->
      <template #passcode-option>
        <UFormGroup :help="passcodeVals.help" name="passcode">
          <UInput
            v-model="formState.passcode"
            :placeholder="passcodeVals.label"
            aria-label="Enter the Business Password"
            :variant="handleFormInputVariant('passcode', formRef?.errors)"
            :maxlength="passcodeVals.maxlength"
          />
        </UFormGroup>
      </template>

      <!-- firm option slot -->
      <template #firm-option>
        <div class="space-y-4 pb-4">
          <UFormGroup
            name="partner.name"
            help="Name as it appears on the Business Summary or the Statement of Registration"
          >
            <UInput
              v-model="formState.partner.name"
              placeholder="Propietor or Partner Name (e.g., Last Name, First Name Middlename)"
              aria-label="Propietor or Partner Name (e.g., Last Name, First Name Middlename)"
              :variant="handleFormInputVariant('partner.name', formRef?.errors)"
            />
          </UFormGroup>

          <UFormGroup name="partner.certify">
            <UCheckbox v-model="formState.partner.certify">
              <template #label>
                <span
                  class="text-sm"
                  :class="handleFormInputVariant('partner.certify', formRef?.errors) === 'error' ? 'text-red-500' : 'text-bcGovColor-darkGray'"
                >
                  <strong>{{ `${keycloak.kcUser.lastName}, ${keycloak.kcUser.firstName}` }}</strong> certifies that
                  they have relevant knowledge of the registered entity and is authorized to act
                  on behalf of this business.
                </span>
              </template>
            </UCheckbox>
          </UFormGroup>
        </div>
      </template>

      <!-- email option slot -->
      <template #email-option>
        <div>
          <div>
            An email will be sent to the {{ addressType }} contact email of the business:
          </div>
          <div><b>{{ contactEmail }}</b></div>
          <div class="mb-4 mr-1 mt-1">
            To confirm your access, please click on the link in the email. This will add the business to your
            Business Registry List. The link is valid for 15 minutes.
          </div>
        </div>
      </template>

      <!-- delagation option slot -->
      <template #delagation-option>
        <div class="-mt-4 space-y-4 pb-6">
          <UFormGroup
            name="delegation.account"
            label="Select an account:"
            :ui="{ label: { base: 'block pt-3 pb-1 font-normal text-gray-700 dark:text-gray-200' } }"
          >
            <USelectMenu
              v-model="formState.delegation.account"
              :options="accounts"
              :aria-label="'some aria label'"
              option-attribute="name"
              :ui="{
                trigger: 'flex items-center w-full h-[42px]'
              }"
            >
              <template #default="{ open }">
                <UButton
                  variant="select_menu_trigger"
                  class="flex-1 justify-between text-gray-700"
                  aria-label="aria label here"
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
            name="delegation.message"
            label="You can add a message that will be included as part of your authorization request."
            :ui="{ label: { base: 'block pt-3 pb-1 font-normal text-gray-700 dark:text-gray-200' } }"
          >
            <UTextarea
              v-model.trim="formState.delegation.message"
              placeholder="Request access additional message"
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

    <UAlert
      v-if="noOptionAlert"
      icon="i-mdi-alert"
      color="red"
      variant="error"
      description="Please select an option from the list above"
    />

    <div class="ml-auto flex justify-end gap-2">
      <UButton
        :label="$t('btn.cancel')"
        variant="outline"
        @click="brdModal.close()"
      />
      <UButton
        label="Manage This Business"
        type="submit"
        :loading
      />
    </div>
  </UForm>
</template>
