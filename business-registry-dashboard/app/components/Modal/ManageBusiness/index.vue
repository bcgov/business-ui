<script setup lang="ts">
// import { FetchError } from 'ofetch'
// const affStore = useAffiliationsStore()
// const toast = useToast()
const brdModal = useBrdModals()
// const { t } = useI18n()
const { $authApi } = useNuxtApp()

const props = defineProps<{
  business: ManageBusinessEvent
}>()

onMounted(() => {
  console.log('business: ', props.business)
  // const test = await $authApi(`/entities/${props.business.identifier}/authentication`)
  // console.log(test)
})

const hasError = ref(false)
const errorText = ref('') // TODO: add aria alert text
// const loading = ref(false)
const hasBusinessEmail = ref(false)
const hasBusinessAuthentication = ref(false)
const hasAffiliatedAccount = ref(false)
const contactInfo = ref(null)

const businessContactEmail = computed(() => {
  // @ts-expect-error
  return contactInfo.value?.email
})

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
  return (isBusinessLegalTypeCorporation.value || isBusinessLegalTypeBenefit.value || isBusinessLegalTypeCoOp.value) && hasBusinessEmail.value
})

const showEmailOption = computed(() => {
  return (isBusinessLegalTypeCorporationOrBenefitOrCoop.value || isBusinessLegalTypeFirm.value) && businessContactEmail.value &&
       hasBusinessEmail.value
})

const enableDelegationFeature = computed(() => {
  // return LaunchDarklyService.getFlag(LDFlags.EnableAffiliationDelegation) || false
  return false
})

const businessHasNoEmailAndNoAuthenticationAndNoAffiliation = computed(() => {
  const hasAuthenticationOption = isBusinessLegalTypeCorporationOrBenefitOrCoop.value && hasBusinessAuthentication.value
  return !hasAuthenticationOption && !isBusinessLegalTypeFirm.value && !showEmailOption.value && !hasAffiliatedAccount.value
})

const showPasscodeOption = computed(() => {
  // const allowableBusinessPasscodeTypes: string = LaunchDarklyService.getFlag(LDFlags.AllowableBusinessPasscodeTypes) || 'BC,SP,GP' // TODO: implememnt after adding launch darkly
  const allowableBusinessPasscodeTypes: string = 'BC,SP,GP'
  return allowableBusinessPasscodeTypes.includes(props.business.legalType) && hasBusinessAuthentication.value
})

const noAuthenticationOptions = computed(() => {
  return !((hasAffiliatedAccount.value && enableDelegationFeature.value) ||
        showEmailOption.value || isBusinessLegalTypeFirm.value || showPasscodeOption.value)
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

const items = [{
  label: `Use the business ${passwordText.value}`,
  slot: 'passcode-option'
}, {
  label: 'Use the name of a proprietor or partner',
  slot: 'firm-option'
}, {
  label: `Confirm authorization using your ${computedAddressType.value} email address`,
  slot: 'email-option'
}, {
  label: 'Request authorization from an account currently managing the business',
  slot: 'affiliated-enable-delegation'
}]

function tryAgain () {
  hasError.value = false
  errorText.value = ''
}
</script>
<template>
  <ModalBase title="Manage a B.C. Business">
    <transition name="fade" mode="out-in">
      <div
        v-if="business"
        class="flex flex-col gap-4"
      >
        <ul class="-mt-8 flex-col gap-2 font-semibold text-bcGovColor-darkGray">
          <li>
            <span>Business Name: <span class="font-normal text-bcGovColor-midGray">{{ business.name }}</span></span>
          </li>
          <li>
            <span>Incorporation Number: <span class="font-normal text-bcGovColor-midGray">{{ business.identifier }}</span></span>
          </li>
        </ul>

        <p>You must be authorized to manage this business. You can be authorized in one of the following ways:</p>

        <UAccordion
          :items
          :ui="{
            wrapper: 'w-full flex flex-col divide-y divide-gray-300 border-y border-gray-300',
            default: {
              class: 'mb-0 py-4 w-full rounded-none'
            }
          }"
        />

        <div class="ml-auto mt-6 flex gap-2">
          <UButton
            :label="$t('btn.cancel')"
            variant="outline"
            @click="brdModal.close()"
          />
          <UButton
            label="Manage This Business"
          />
        </div>
      </div>
      <div v-else-if="noAuthenticationOptions">
        <p>The business doesn't have a password / passcode or email on record. Please contact us for help:</p>
        <BCRegContactInfo />
      </div>
      <div v-else-if="hasError" class="flex flex-col items-center gap-4 text-center md:w-[700px]">
        <UIcon name="i-mdi-alert-circle-outline" class="-mt-10 size-8 text-red-500" />
        <h2 class="text-xl font-semibold">
          {{ $t('error.generic.title') }}
        </h2>
        <!-- <p>{{ errorText }}</p> -->
        <p>{{ $t('error.generic.description') }}</p>
        <BCRegContactInfo class="self-start text-left" />
        <div class="mt-4 flex gap-2">
          <UButton
            :label="$t('btn.cancel')"
            variant="outline"
            @click="brdModal.close()"
          />
          <UButton
            :label="$t('btn.tryAgain')"
            @click="tryAgain"
          />
        </div>
        <!-- TODO: add aria alert -->
        <!-- <div class="sr-only" role="status">
      {{ ariaAlertText }}
    </div> -->
      </div>
    </transition>
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
