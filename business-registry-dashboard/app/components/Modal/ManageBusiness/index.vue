<script setup lang="ts">
import type { AccordionItem } from '#ui/types'
import { FetchError } from 'ofetch'
import { StatusCodes } from 'http-status-codes'
const affStore = useAffiliationsStore()
const brdModal = useBrdModals()
// const { t } = useI18n()
const { $authApi } = useNuxtApp()

const props = defineProps<{
  business: ManageBusinessEvent
}>()

const loading = ref(true)
const hasBusinessAuthentication = ref(false)
const contactEmail = ref('')
const affiliatedAccounts = ref<Array<{branchName?: string, name: string, uuid: string }>>([])

const isBusinessLegalTypeFirm = computed(() => {
  return props.business.legalType === CorpTypes.SOLE_PROP || props.business.legalType === CorpTypes.PARTNERSHIP
})

const isBusinessLegalTypeCorporation = computed(() => {
  return props.business.legalType === CorpTypes.BC_COMPANY
})

const isBusinessLegalTypeBenefit = computed(() => {
  return props.business.legalType === CorpTypes.BENEFIT_COMPANY
})

const isBusinessLegalTypeCoOp = computed(() => {
  return props.business.legalType === CorpTypes.COOP
})

const isBusinessLegalTypeCorporationOrBenefitOrCoop = computed(() => {
  return (isBusinessLegalTypeCorporation.value || isBusinessLegalTypeBenefit.value || isBusinessLegalTypeCoOp.value) && contactEmail.value !== ''
})

const showEmailOption = computed(() => {
  return (isBusinessLegalTypeCorporationOrBenefitOrCoop.value || isBusinessLegalTypeFirm.value) && contactEmail.value !== ''
})

const enableDelegationFeature = computed(() => {
  // return LaunchDarklyService.getFlag(LDFlags.EnableAffiliationDelegation) || false // TODO: fix after adding launch darkly
  return true
})

const showPasscodeOption = computed(() => {
  // const allowableBusinessPasscodeTypes: string = LaunchDarklyService.getFlag(LDFlags.AllowableBusinessPasscodeTypes) || 'BC,SP,GP' // TODO: implememnt after adding launch darkly
  const allowableBusinessPasscodeTypes: string = 'BC,SP,GP'
  return allowableBusinessPasscodeTypes.includes(props.business.legalType) && hasBusinessAuthentication.value && !isBusinessLegalTypeFirm.value
})

const isCooperative = computed(() => {
  return props.business.identifier.toUpperCase().startsWith('CP')
})

const passwordText = computed(() => {
  return (isCooperative.value || isBusinessLegalTypeBenefit.value ? 'passcode' : 'password')
})

const computedAddressType = computed(() => {
  if (isBusinessLegalTypeCorporationOrBenefitOrCoop.value) {
    return 'registered office'
  } else if (isBusinessLegalTypeFirm.value) {
    return 'business'
  } else {
    return ''
  }
})

const authOptions = computed<AccordionItem[]>(() => {
  const options: AccordionItem[] = []

  if (showPasscodeOption.value) {
    options.push({
      label: `Use the business ${passwordText.value}`,
      slot: 'passcode-option'
    })
  }

  if (isBusinessLegalTypeFirm.value) {
    options.push({
      label: 'Use the name of a proprietor or partner',
      slot: 'firm-option'
    })
  }

  if (showEmailOption.value) {
    options.push({
      label: `Confirm authorization using your ${computedAddressType.value} email address`,
      slot: 'email-option'
    })
  }

  if (affiliatedAccounts.value.length > 0 && enableDelegationFeature.value) {
    options.push({
      label: 'Request authorization from an account currently managing the business',
      slot: 'delagation-option'
    })
  }

  return options
})

onMounted(async () => {
  if (!affStore.isStaffOrSbcStaff) { // only try accessing if not staff - this might not be necessary but will need to look into it
    // try loading contact info
    try {
      const response = await $authApi<{ email: string }>(`/entities/${props.business.identifier}/contacts`)
      contactEmail.value = response.email
    } catch (error) {
      const e = error as FetchError
      if (e.response?.status !== StatusCodes.NOT_FOUND) {
        console.error(e.response)
      }
    }

    // try loading affiliated accounts
    try {
      const response = await $authApi<AffiliatedAccounts>(`/orgs/affiliation/${props.business.identifier}`)
      affiliatedAccounts.value = response.orgsDetails
    } catch (error) {
      const e = error as FetchError
      console.error(e.response)
    }

    // try loading business passcode
    try {
      const response = await $authApi<{ contactEmail: string, hasValidPassCode: boolean }>(`/entities/${props.business.identifier}/authentication`)
      hasBusinessAuthentication.value = response.hasValidPassCode
    } catch (error) {
      const e = error as FetchError
      hasBusinessAuthentication.value = false
      if (e.response?.status !== StatusCodes.NOT_FOUND) {
        console.error(e.response)
      }
    }
    setTimeout(() => {
      loading.value = false
    }, 300)
  }
})
</script>
<template>
  <ModalBase title="Manage a B.C. Business">
    <div class="flex flex-col gap-4 md:w-[700px]">
      <ul class="-mt-8 flex-col gap-2 font-semibold text-bcGovColor-darkGray">
        <li>
          <span>Business Name: <span class="font-normal text-bcGovColor-midGray">{{ business.name }}</span></span>
        </li>
        <li>
          <span>Incorporation Number: <span class="font-normal text-bcGovColor-midGray">{{ business.identifier }}</span></span>
        </li>
      </ul>

      <div v-if="loading" class="relative h-48">
        <SbcLoadingSpinner :overlay="false" />
      </div>

      <div
        v-else-if="authOptions.length === 0"
        class="flex flex-col gap-4"
      >
        <p>Some required information for this business is missing.</p>
        <p>The business doesn't have a password / passcode or email on record. Please contact us for help:</p>
        <BCRegContactInfo />
        <UButton
          :label="$t('btn.close')"
          class="ml-auto"
          @click="brdModal.close()"
        />
      </div>

      <FormAddBusiness
        v-else
        :auth-options="authOptions"
        :address-type="computedAddressType"
        :contact-email="contactEmail"
        :identifier="business.identifier"
        :accounts="affiliatedAccounts"
      />
    </div>
  </ModalBase>
</template>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
