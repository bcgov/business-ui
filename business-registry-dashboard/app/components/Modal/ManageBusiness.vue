<script setup lang="ts">
import type { AccordionItem } from '#ui/types'
import { FormAddBusiness } from '#components'
const brdModal = useBrdModals()
const toast = useToast()
const affStore = useAffiliationsStore()
const { t } = useI18n()
const { $authApi } = useNuxtApp()
const ldStore = useConnectLaunchdarklyStore()

const props = defineProps<{
  business: ManageBusinessEvent
}>()

const loading = ref(true)
const hasBusinessAuthentication = ref(false)
const contactEmail = ref('')
const affiliatedAccounts = ref<Array<{branchName?: string, name: string, uuid: string }>>([])
const formAddBusinessRef = ref<InstanceType<typeof FormAddBusiness> | null>(null)

const businessDetails = computed(() => ({
  isFirm: props.business.legalType === CorpTypes.SOLE_PROP || props.business.legalType === CorpTypes.PARTNERSHIP,
  isCorporation: props.business.legalType === CorpTypes.BC_COMPANY,
  isBenefit: props.business.legalType === CorpTypes.BENEFIT_COMPANY,
  isCorpOrBenOrCoop: (props.business.legalType === CorpTypes.BC_COMPANY || props.business.legalType === CorpTypes.BENEFIT_COMPANY || props.business.legalType === CorpTypes.COOP) && contactEmail.value !== '',
  isCoop: props.business.identifier.toUpperCase().startsWith('CP'),
  name: props.business.name,
  identifier: props.business.identifier
}))

const showEmailOption = computed(() => {
  return (businessDetails.value.isCorpOrBenOrCoop || businessDetails.value.isFirm) && contactEmail.value !== ''
})

const showPasscodeOption = computed(() => {
  const allowableBusinessPasscodeTypes: string = ldStore.getStoredFlag(LDFlags.AllowableBusinessPasscodeTypes) || 'BC,SP,GP'
  return allowableBusinessPasscodeTypes.includes(props.business.legalType) && hasBusinessAuthentication.value && !businessDetails.value.isFirm
})

const authOptions = computed<AccordionItem[]>(() => {
  const options: AccordionItem[] = []

  if (showPasscodeOption.value) {
    options.push({
      label: (businessDetails.value.isCoop || businessDetails.value.isBenefit)
        ? t('form.manageBusiness.authOption.passcode.accordianLabel.coopOrBen')
        : t('form.manageBusiness.authOption.passcode.accordianLabel.default'),
      slot: 'passcode-option'
    })
  }

  if (businessDetails.value.isFirm) {
    options.push({
      label: t('form.manageBusiness.authOption.firm.accordianLabel.default'),
      slot: 'firm-option'
    })
  }

  if (showEmailOption.value) {
    options.push({
      label: businessDetails.value.isCorpOrBenOrCoop
        ? t('form.manageBusiness.authOption.email.accordianLabel.corpOrBenOrCoop')
        : businessDetails.value.isFirm
          ? t('form.manageBusiness.authOption.email.accordianLabel.firm')
          : t('form.manageBusiness.authOption.email.accordianLabel.default'),
      slot: 'email-option'
    })
  }

  if (affiliatedAccounts.value.length > 0 && (ldStore.getStoredFlag(LDFlags.EnableAffiliationDelegation) || false)) {
    options.push({
      label: t('form.manageBusiness.authOption.delegation.accordianLabel.default'),
      slot: 'delegation-option'
    })
  }

  return options
})

async function handleEmailAuthSentStateClosed () {
  if (formAddBusinessRef.value?.currentState === 'FormAddBusinessEmailAuthSent') {
    toast.add({ title: t('form.manageBusiness.toast.emailSent') }) // add success toast
    await affStore.loadAffiliations() // update table with new affilitations
    brdModal.close()
  }
}

onMounted(async () => {
  // try loading contact info
  try {
    const response = await $authApi<{ email: string }>(`/entities/${props.business.identifier}/contacts`)
    contactEmail.value = response.email
  } catch (error) {
    logFetchError(error, 'Error retrieving business contacts')
  }

  // try loading affiliated accounts
  try {
    const response = await $authApi<AffiliatedAccounts>(`/orgs/affiliation/${props.business.identifier}`)
    affiliatedAccounts.value = response.orgsDetails
  } catch (error) {
    logFetchError(error, 'Error retrieving affiliated accounts')
  }

  // try loading business passcode
  try {
    const response = await $authApi<{ contactEmail: string, hasValidPassCode: boolean }>(`/entities/${props.business.identifier}/authentication`)
    hasBusinessAuthentication.value = response.hasValidPassCode
  } catch (error) {
    hasBusinessAuthentication.value = false
    logFetchError(error, 'Error retrieving business passcode')
  }
  setTimeout(() => { // give enough time for computed options to update before removing loading state
    loading.value = false
  }, 300)
})
</script>
<template>
  <ModalBase
    :title="$t('form.manageBusiness.heading')"
    @modal-closed="handleEmailAuthSentStateClosed "
  >
    <div class="flex flex-col gap-4 md:w-[700px]">
      <ul class="-mt-8 flex-col gap-2">
        <li>
          <SbcI18nBold translation-path="form.manageBusiness.businessName" :name="business.name" />
        </li>
        <li>
          <SbcI18nBold translation-path="form.manageBusiness.businessNumber" :number="business.identifier" />
        </li>
      </ul>

      <div v-if="loading" class="relative h-48">
        <SbcLoadingSpinner :overlay="false" />
      </div>

      <div
        v-else-if="authOptions.length === 0"
        class="flex flex-col gap-4"
      >
        <p>{{ $t('form.manageBusiness.missingInfo.p1') }}</p>
        <p>{{ $t('form.manageBusiness.missingInfo.p2') }}</p>

        <BCRegContactInfo />

        <UButton
          :label="$t('btn.close')"
          class="ml-auto"
          @click="brdModal.close()"
        />
      </div>

      <FormAddBusiness
        v-else
        ref="formAddBusinessRef"
        :auth-options="authOptions"
        :contact-email="contactEmail"
        :identifier="business.identifier"
        :accounts="affiliatedAccounts"
        :business-details="businessDetails"
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
