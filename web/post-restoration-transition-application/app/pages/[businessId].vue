<script setup lang="ts">
const { t } = useI18n()

const accountStore = useConnectAccountStore()

useHead({
  title: t('transitionApplication.title')
})

const route = useRoute()

definePageMeta({
  layout: 'form',
  middleware: () => {
    // redirect to reg home with return url if user unauthenticated
    const { $keycloak, $config } = useNuxtApp()
    if (!$keycloak.authenticated) {
      const returnUrl = encodeURIComponent(window.location.href)
      return navigateTo(
        `${$config.public.registryHomeUrl}login?return=${returnUrl}`,
        { external: true }
      )
    }
  }
})

const businessId = route.params.businessId as string

const filingStore = usePostRestorationTransitionApplicationStore()
filingStore.init(businessId)
const {
  compPartyEmail,
  courtOrderNumber,
  folio,
  planOfArrangement,
  regOfficeEmail
} = storeToRefs(filingStore)

const feeStore = useConnectFeeStore()
feeStore.feeOptions.showServiceFees = true
feeStore.fees = {
  OFFICER_CHANGE: {
    filingFees: 10,
    filingType: 'Officer change fee',
    filingTypeCode: 'OFFICER_CHANGE',
    futureEffectiveFees: 0,
    priorityFees: 0,
    processingFees: 0,
    serviceFees: 0,
    tax: {
      gst: 0,
      pst: 0
    },
    total: 0,
    waived: true
  }
}
</script>

<template>
  <div class="py-10 space-y-5">
    <div>
      <h2>{{ $t("transitionApplication.subtitle.documentDelivery") }}</h2>
      <p>{{ $t("text.documentDelivery") }}</p>
      <div class="bg-white py-5 mt-5 space-y-4 rounded">
        <ConnectFormSection :title="$t('label.registeredOffice')">
          {{ regOfficeEmail }}
        </ConnectFormSection>
        <ConnectFormSection :title="$t('label.completingParty')">
          <ConnectFormInput
            v-model="compPartyEmail"
            :name="'documentDelivery.completingPartyEmail'"
            :label="$t('label.emailAddressOptional')"
            :help="$t('text.completingPartyEmail')"
          />
        </ConnectFormSection>
      </div>
    </div>
    <div>
      <h2>{{ $t("transitionApplication.subtitle.courtOrder") }}</h2>
      <p>{{ $t("text.courtOrder") }}</p>
      <div class="bg-white py-5 mt-5 space-y-4 rounded">
        <ConnectFormSection :title="$t('label.courtOrderNumber')">
          <ConnectFormInput
            v-model="courtOrderNumber"
            :name="'courtOrder.number'"
            :label="$t('label.courtOrderNumber')"
          />
        </ConnectFormSection>
        <ConnectFormSection :title="$t('label.planOfArrangement')">
          <UCheckbox
            v-model="planOfArrangement"
            :label="$t('label.planOfArrangement')"
            :ui="{ base: 'cursor-pointer mt-1', label: 'cursor-pointer', wrapper: 'w-fit' }"
          />
        </ConnectFormSection>
      </div>
    </div>
    <div>
      <h2>{{ $t("transitionApplication.subtitle.folio") }}</h2>
      <p>{{ $t("text.folioOrReferenceNumber") }}</p>
      <div class="bg-white py-5 mt-5 space-y-4 rounded">
        <ConnectFormSection :title="$t('label.folioOrReferenceNumber')">
          <ConnectFormInput
            v-model="folio"
            :name="'business.folio'"
            :label="$t('label.folioOrReferenceNumberOptional')"
          />
        </ConnectFormSection>
      </div>
    </div>
    <!-- NB: needed so that the tw classes are loaded -->
    <!-- <main class="app-inner-container app-body">
      <div class="flex flex-col lg:flex-row lg:gap-6 grow">
        <div class="grow max-w-full overflow-hidden">
          <slot />
        </div>

        <div class="shrink-0 lg:w-[300px] lg:static sticky lg:mt-10">
          <ConnectFeeWidget class="sticky lg:top-10" />
        </div>
      </div>
    </main> -->
  </div>
</template>
