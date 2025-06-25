<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { Office } from '~/interfaces/addresses'

const { t } = useI18n()

// const accountStore = useConnectAccountStore()

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

const ConnectAddressDisplay = resolveComponent('ConnectAddressDisplay')

const businessId = route.params.businessId as string

const filingStore = usePostRestorationTransitionApplicationStore()
filingStore.init(businessId)
const {
  compPartyEmail,
  courtOrderNumber,
  directors,
  folio,
  offices,
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

const sectionErrors = ref({
  reviewAndConfirm: false
})

// Define table columns
const officesColumns = ref([
  {
    accessorKey: 'officeType',
    header: t('page.subSections.officeAddresses.dataList.headers.officeType'),
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'text-left font-bold text-bgGovColor-midGray' },
        t(`page.subSections.officeAddresses.dataList.officeTypes.${row.original.officeType}`)
      )
    }
  },
  {
    accessorKey: 'mailingAddress',
    header: t('page.subSections.officeAddresses.dataList.headers.mailingAddress'),
    cell: ({ row }) => { return h(ConnectAddressDisplay, { address: row.original.mailingAddress }) }
  },
  {
    accessorKey: 'deliveryAddress',
    header: t('page.subSections.officeAddresses.dataList.headers.deliveryAddress'),
    cell: ({ row }) => { return h(ConnectAddressDisplay, { address: row.original.deliveryAddress }) }
  }
])
const directorsColumns = ref([])
</script>

<template>
  <div class="py-10 space-y-5">
    <div>
      <h1 class="mb-2">
        {{ $t('page.postRestorationTransitionApplication.h1') }}
      </h1>
      <p class="text-2xl">
        {{ $t('page.postRestorationTransitionApplication.titleDescription') }}
      </p>
    </div>
    <FormSection
      :title="$t('page.sections.reviewAndConfirm.title')"
      :description="$t('page.sections.reviewAndConfirm.description')"
      icon="df"
      :has-errors="sectionErrors.reviewAndConfirm"
    >
      <FormSubSection
        icon="i-mdi-domain"
        :title="$t('page.subSections.officeAddresses.title')"
      >
        <FormDataList
          :data="offices"
          :columns="officesColumns"
        />
        <InfoBox
          icon="icon"
          title="title 123"
          text="text 123"
        />
      </FormSubSection>

      <FormSubSection
        icon="i-mdi-account-multiple-plus"
        :title="$t('page.subSections.currentDirectors.title')"
      >
        <FormDataList
          :data="directors"
          :columns="directorsColumns"
        />
        <InfoBox
          icon="icon"
          title="title 123"
          text="text 123"
        />
      </FormSubSection>
    </FormSection>
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
