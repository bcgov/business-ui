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
const isLearBusiness = ref(false)
const includedCorpTypes: string[] = [
  CorpTypes.BC_CCC,
  CorpTypes.BC_COMPANY,
  CorpTypes.BC_ULC_COMPANY,
  CorpTypes.CONTINUE_IN,
  CorpTypes.CCC_CONTINUE_IN,
  CorpTypes.ULC_CONTINUE_IN
]
const includedFirmTypes: string [] = [CorpTypes.SOLE_PROP, CorpTypes.PARTNERSHIP]
const includedBenTypes: string [] = [CorpTypes.BENEFIT_COMPANY, CorpTypes.BEN_CONTINUE_IN]

const businessDetails = computed(() => ({
  isFirm: includedFirmTypes.includes(props.business.legalType),
  isCorporation: includedCorpTypes.includes(props.business.legalType),
  isBenefit: includedBenTypes.includes(props.business.legalType),
  isCoop: props.business.legalType === CorpTypes.COOP,
  name: props.business.name,
  identifier: props.business.identifier
}))

const isCorpOrBenOrCoop = computed(() => {
  return (businessDetails.value.isCorporation ||
    businessDetails.value.isBenefit ||
    businessDetails.value.isCoop) &&
    contactEmail.value !== ''
})

const showEmailOption = computed(() => {
  return isCorpOrBenOrCoop.value || (businessDetails.value.isFirm && contactEmail.value !== '')
})

const showPasscodeOption = computed(() => {
  const allowableBusinessPasscodeTypes: string = ldStore.getStoredFlag(LDFlags.AllowableBusinessPasscodeTypes)
  return allowableBusinessPasscodeTypes.includes(props.business.legalType) && hasBusinessAuthentication.value && !businessDetails.value.isFirm
})

const authOptions = computed<AccordionItem[]>(() => {
  const options: AccordionItem[] = []
  if (showPasscodeOption.value) {
    options.push({
      label: (businessDetails.value.isCoop || businessDetails.value.isBenefit)
        ? t('form.manageBusiness.authOption.passcode.radioLabel.coopOrBen')
        : t('form.manageBusiness.authOption.passcode.radioLabel.default'),
      slot: 'passcode-option'
    })
  }

  if (businessDetails.value.isFirm) {
    options.push({
      label: t('form.manageBusiness.authOption.firm.radioLabel.default'),
      slot: 'firm-option'
    })
  }

  if (showEmailOption.value) {
    options.push({
      label: businessDetails.value.isCoop
        ? t('form.manageBusiness.authOption.email.radioLabel.coop')
        : isCorpOrBenOrCoop.value
          ? t('form.manageBusiness.authOption.email.radioLabel.corpOrBenOrCoop')
          : businessDetails.value.isFirm && contactEmail.value !== ''
            ? t('form.manageBusiness.authOption.email.radioLabel.firm')
            : t('form.manageBusiness.authOption.email.radioLabel.default'),
      slot: 'email-option'
    })
  }

  if (affiliatedAccounts.value.length > 0 && (ldStore.getStoredFlag(LDFlags.EnableAffiliationDelegation) || false)) {
    options.push({
      label: t('form.manageBusiness.authOption.delegation.radioLabel.default'),
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

  isLearBusiness.value = await checkBusinessExistsInLear(props.business.identifier)

  setTimeout(() => { // give enough time for computed options to update before removing loading state
    loading.value = false
  }, 300)
})
</script>
<template>
  <ModalBase
    :title="$t('form.manageBusiness.heading')"
    @modal-closed="handleEmailAuthSentStateClosed"
  >
    <div class="flex flex-col gap-4 md:w-[700px]">
      <ul class="-mt-8 flex-col gap-2">
        <li>
          <ConnectI18nBold class="text-bcGovColor-darkGray" translation-path="form.manageBusiness.businessName" :name="business.name" />
        </li>
        <li>
          <ConnectI18nBold class="text-bcGovColor-darkGray" translation-path="form.manageBusiness.businessNumber" :number="business.identifier" />
        </li>
      </ul>

      <div v-if="loading" class="relative h-48">
        <SbcLoadingSpinner :overlay="false" />
      </div>

      <div
        v-else-if="authOptions.length === 0"
        class="flex flex-col gap-4"
      >
        <!-- company is in LEAR but doesn't have an email on file -->
        <template v-if="isLearBusiness">
          <p>The business doesn't have an email on file. Please contact B.C. Registries by choosing one of the options in the help section below.</p>
          <!-- temporarily disabled per #29292, will be enablewhen form process is ready
          <p>{{ $t('form.manageBusiness.missingInfo.p1') }}</p> -->

          <!-- On hold for email form
          <p class="border-b border-gray-300 pb-3">
            {{ $t('form.manageBusiness.missingInfo.fragmentPrt1') }}
            <a
              href=" "
              target="_blank"
              class="text-blue-500 underline"
            >{{ $t('form.manageBusiness.missingInfo.fragmentPrt2') }}
            </a>
            <UIcon
              name="i-mdi-open-in-new"
              class="mr-2 size-5 text-bcGovColor-activeBlue"
            />
            {{ $t('form.manageBusiness.missingInfo.fragmentPrt3') }}
          </p> -->
        </template>
        <!-- company is still managed in COLIN -->
        <template v-else>
          <p>
            Your company is still managed through
            <a href="https://www.corporateonline.gov.bc.ca" target="_blank" class="text-blue-500 underline">Corporate Online</a>
            <UIcon name="i-mdi-open-in-new" class="size-5 text-bcGovColor-activeBlue" /> and will be moved to the BC Business Registry soon.
          </p>
          <p class="mt-4">
            To stay informed about when companies can be managed directly through the BC Business Registry, subscribe to
            <a href="https://www2.gov.bc.ca/gov/content/employment-business/business/managing-a-business/permits-licences/news-updates/modernization" target="_blank" class="text-blue-500 underline">
              BC Registries Modernization Updates<UIcon name="i-mdi-open-in-new" class="size-5 text-bcGovColor-activeBlue" />
            </a>.
          </p>
        </template>

        <div class="grid auto-cols-auto">
          <div class="grid-flow-col place-content-start justify-start">
            <HelpBusinessContact />
          </div>
        </div>
        <div class="grid grid-rows-subgrid">
          <div class="col-span-full max-w-xl place-content-end justify-end place-self-end">
            <UButton
              :label="$t('btn.close')"
              class="mx-auto px-3 py-2"
              @click="brdModal.close()"
            />
          </div>
        </div>
      </div>

      <FormAddBusiness
        v-else
        ref="formAddBusinessRef"
        :auth-options="authOptions"
        :contact-email="contactEmail"
        :identifier="business.identifier"
        :accounts="affiliatedAccounts"
        :business-details="businessDetails"
        :is-corp-or-ben-or-coop="isCorpOrBenOrCoop"
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
