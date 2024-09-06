<script setup lang="ts">
import type { AccordionItem } from '#ui/types'
const brdModal = useBrdModals()
const accountStore = useConnectAccountStore()
const { $authApi } = useNuxtApp()

const props = defineProps<{
  authOptions: AccordionItem[]
  addressType: string
  contactEmail: string
  identifier: string
}>()

const emit = defineEmits<{
  businessError: [error: FetchError]
}>()

const accordianRef = ref()
const noOptionAlert = ref(false)

// function tryAgain () {
//   hasError.value = false
//   errorText.value = ''
// }

const openAuthOption = computed<AccordionItem | null>(() => {
  const buttonRefs = accordianRef.value?.buttonRefs
  if (buttonRefs && buttonRefs.length > 0) {
    const openIndex = buttonRefs.findIndex((item: { open: boolean, close: any }) => item.open === true)
    return props.authOptions[openIndex] ?? null
  } else {
    return null
  }
})

watchEffect(() => console.log('open auth option: ', openAuthOption.value))

function handleOptionClick () {
  if (noOptionAlert.value) {
    noOptionAlert.value = false
  }
}

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
    emit('businessError', e)
    // TODO: show error state matching info below
    // createAffiliationInvitationErrorTitle.value = 'Error Sending Authorization Email'
    // createAffiliationInvitationErrorText.value = 'An error occurred sending authorization email. Please try again.'
  }
}

async function submitManageRequest () {
  if (!openAuthOption.value) {
    noOptionAlert.value = true
    return
  }
  // await handleRemoveExistingAffiliationInvitation() // TODO: implement ???
  if (openAuthOption.value.slot === 'email-option') { // try submitting email option
    console.log('submit email option')
    await handleEmailOption()
  } else if (openAuthOption.value.slot === 'delagation-option') { // try submitting delegation option
    console.log('submit delagation option')
    // await handleAuthBusinessOption()
  } else { // handle passcode or firm option
    console.log(' handle other options')
    // addBusinessForm.value.validate()
    // // Adding business to the list
    // if (isFormValid.value) {
    //   isLoading.value = true
    //   try {
    //     let businessData: LoginPayload = { businessIdentifier: businessIdentifier.value }
    //     if (!orgStore.isStaffOrSbcStaff) {
    //       businessData = {
    //         ...businessData,
    //         certifiedByName: authorizationName.value,
    //         passCode: isBusinessLegalTypeFirm.value ? proprietorPartnerName.value : passcode.value
    //       }
    //     }
    //     const addResponse = await businessStore.addBusiness(businessData)
    //     // check if add didn't succeed
    //     if (addResponse?.status !== StatusCodes.CREATED) {
    //       emit('unknown-error')
    //     }
    //     // let parent know that add was successful
    //     emit('add-success', businessIdentifier.value)
    //   } catch (exception) {
    //     handleException(exception)
    //   } finally {
    //     resetForm()
    //   }
    // }
  }
}
</script>
<template>
  <div class="space-y-4">
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
      @click="handleOptionClick"
    >
      <!-- passcode option slot -->
      <template #passcode-option>
        passcode option
      </template>

      <!-- firm option slot -->
      <template #firm-option>
        firm option
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
        delegation option
      <!-- <div>
        <AccountAuthorizationRequest
          :key="accountAuthorizationKey"
          :business-identifier="initialBusinessIdentifier"
          :business-name="initialBusinessName"
          @change-request-access-message="invitationAdditionalMessage=$event"
          @select-account="selectAccount($event)"
          @unknown-error="$emit('unknown-error')"
        />
      </div> -->
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
        @click="submitManageRequest"
      />
    </div>
  </div>
</template>
