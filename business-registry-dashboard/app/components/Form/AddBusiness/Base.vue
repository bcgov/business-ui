<script setup lang="ts">
import type { AccordionItem, FormSubmitEvent } from '#ui/types'
import { z } from 'zod'
const brdModal = useBrdModals()
const accountStore = useConnectAccountStore()
const { $authApi } = useNuxtApp()
const keycloak = reactive(useKeycloak())

const props = defineProps<{
  authOptions: AccordionItem[]
  addressType: string
  contactEmail: string
  business: ManageBusinessEvent
  identifier: string
  accounts: Array<{branchName: string, name: string, uuid: string }>
}>()

const emit = defineEmits<{
  businessError: [{error: FetchError, type: string}]
  addSuccess: [identifier: string]
}>()

const formRef = ref()
const accordianRef = ref()
const noOptionAlert = ref<boolean>(false)
const selectedAccount = ref<{ branchName: string; name: string; uuid: string } | null>(null)

const formState = reactive({
  selectedAccount: undefined,
  requestAccessMessage: undefined,
  proprietorPartnerName: undefined,
  passcode: undefined
})

watchEffect(() => console.log('selected account: ', selectedAccount.value))

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
  formState.selectedAccount = undefined
  formState.requestAccessMessage = undefined
  formState.proprietorPartnerName = undefined
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
    throw new Error('test error')
    await $authApi('/affiliationInvitations', {
      method: 'POST',
      body: payload
    })
    // TODO: show success state matching dialog below
    // authorizationRequestSentDialog.value?.open()
  } catch (error) {
    const e = error as FetchError
    emit('businessError', { error: e, type: 'email' })
  }
}

const handleDelegationOption = async () => {
  try {
    const payload = {
      fromOrgId: Number(accountStore.currentAccount.id),
      toOrgUuid: selectedAccount.value?.uuid,
      businessIdentifier: props.identifier,
      type: 'REQUEST',
      additionalMessage: formState.requestAccessMessage
    }
    throw new Error('test error')
    await $authApi('/affiliationInvitations', {
      method: 'POST',
      body: payload
    })
    // TODO: show success state matching dialog below
    // invitationRequestSentDialog.value?.open()
  } catch (error) {
    const e = error as FetchError
    emit('businessError', { error: e, type: 'delegation' })
  }
}

async function submitManageRequest (event: FormSubmitEvent<FormSchema>) {
  if (!openAuthOption.value) {
    noOptionAlert.value = true
    return
  }

  console.log(event.data)

  // await handleRemoveExistingAffiliationInvitation() // TODO: implement ???
  if (openAuthOption.value.slot === 'email-option') { // try submitting email option
    console.log('submit email option')
    await handleEmailOption()
  } else if (openAuthOption.value.slot === 'delagation-option') { // try submitting delegation option
    console.log('submit delagation option')
    await handleDelegationOption()
  } else { // handle passcode or firm option
    console.log(' handle other options')
    // addBusinessForm.value.validate()
    // // Adding business to the list
    // try {
    //   const payload: LoginPayload = {
    //     businessIdentifier: props.identifier,
    //     certifiedByName: `${keycloak.kcUser.lastName}, ${keycloak.kcUser.firstName}`,
    //     passCode: openAuthOption.value.slot === 'firm-option' ? proprietorPartnerName.value : passcode.value
    //   }

    //   await $authApi(`/orgs/${accountStore.currentAccount.id}/affiliations`, {
    //     method: 'POST',
    //     body: payload
    //   })

    //   // let parent know that add was successful
    //   emit('addSuccess', props.identifier)
    // } catch (error) {
    //   const e = error as FetchError
    //   emit('businessError', { error: e, type: 'other' })
    // }
  }
}

onMounted(() => {
  if (props.accounts.length === 1) { // preset selected account if only 1 available
    selectedAccount.value = props.accounts[0] || null
  } else {
    selectedAccount.value = null
  }
  console.log('accounts from base modal: ', props.accounts)
})

const isBusinessLegalTypeFirm = computed(() => {
  return props.business.legalType === CorpTypes.SOLE_PROP || props.business.legalType === CorpTypes.PARTNERSHIP
})

const passcodeVals = computed(() => {
  let label: string
  let help: string
  let maxlength: number

  if (isBusinessLegalTypeFirm.value) {
    label = 'Proprietor or Partner Name (e.g., Last Name, First Name Middlename)'
    help = 'Name as it appears on the Business Summary or the Statement of Registration'
    maxlength = 150
  } else if (props.identifier.toUpperCase().startsWith('CP')) {
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
      passcode: isBusinessLegalTypeFirm.value
        ? z.string({ required_error: 'Proprietor or Partner Name is required' })
          .max(150, 'Maximum 150 characters')
        : props.identifier.toUpperCase().startsWith('CP')
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
      proprietorPartnerName: z.string({ required_error: 'Proprietor or Partner Name is required' })
        .max(150, 'Maximum 150 characters')
    })
  }

  if (openOption === 'delagation-option') {
    return z.object({
      selectedAccount: z.object({
        branchName: z.string(),
        name: z.string(),
        uuid: z.string()
      })
    })
  }

  // Return an empty schema if no option is open (or not yet selected)
  return z.object({})
})

type FormSchema = z.infer<typeof formSchema.value>

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
        <div class="-mt-4 space-y-4 pb-6">
          <UFormGroup
            help="Name as it appears on the Business Summary or the Statement of Registration"
          >
            <UInput
              v-model="formState.proprietorPartnerName"
              placeholder="Propietor or Partner Name (e.g., Last Name, First Name Middlename)"
              aria-label="Propietor or Partner Name (e.g., Last Name, First Name Middlename)"
            />
          </UFormGroup>

          <UFormGroup name="checkbox">
            <UCheckbox>
              <template #label>
                <span>
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
            label="Select an account:"
            :ui="{ label: { base: 'block pt-3 pb-1 font-normal text-gray-700 dark:text-gray-200' } }"
          >
            <USelectMenu
              v-model="selectedAccount"
              :options="accounts"
              :ui="{ trigger: 'flex items-center w-full h-[42px]' }"
            >
              <template #default="{ open }">
                <UButton
                  variant="select_menu_trigger"
                  class="flex-1 justify-between text-gray-700"
                  :disabled="accounts.length <= 1"
                >
                  {{ selectedAccount ? selectedAccount.name : 'Select an option' }}
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
            label="You can add a message that will be included as part of your authorization request."
            :ui="{ label: { base: 'block pt-3 pb-1 font-normal text-gray-700 dark:text-gray-200' } }"
          >
            <UTextarea
              v-model.trim="formState.requestAccessMessage"
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
      />
    </div>
  </UForm>
</template>
