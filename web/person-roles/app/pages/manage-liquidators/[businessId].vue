<script setup lang="ts">
import type { FormSubmitEvent, FormErrorEvent } from '@nuxt/ui'
import { z } from 'zod'

const { t } = useI18n()
const urlParams = useUrlSearchParams()
const route = useRoute()
const modal = useFilingModals()
const liquidatorSchema = getLiquidatorsSchema()
const liquidatorStore = useLiquidatorStore()

// Dynamic i18n keys and breadcrumb based on intent to liquidate or manage liquidators
// ToDo: include Liquidation report configuration when applicable
const hasIntentToLiquidate = computed(() => route.path.includes('intent-to-liquidate'))
const i18nKeys = computed(() => {
  return hasIntentToLiquidate.value
    ? {
      h1: t('page.intentToLiquidate.h1'),
      title: t('page.intentToLiquidate.title')
    }
    : {
      h1: t('page.manageLiquidators.h1'),
      title: t('page.manageLiquidators.title')
    }
})

const { dashboardUrl, breadcrumbs } = useFilingNavigation(i18nKeys.value.h1)

useHead({
  title: i18nKeys.value.title
})

definePageMeta({
  layout: 'connect-pay-tombstone-buttons',
  middleware: [
    // Check for login redirect
    'connect-auth'
  ],
  alias: ['/manage-liquidators/:businessId/intent-to-liquidate'] // aliased path for intent to liquidate
})

const businessId = route.params.businessId as string
const staffPayFormRef = useTemplateRef<StaffPaymentFormRef>('staff-pay-ref')

// submit final filing
async function submitFiling(e: FormSubmitEvent<unknown>) {
  // Todo: Exclude non-edited existing parties from the submission payload
  try {
    console.info('LIQUIDATOR FILING DATA: ', e.data) // This does not include the table data
    // pull draft id from url or mark as undefined
    // const draftId = (urlParams.draft as string) ?? undefined
    // await liquidatorStore.submit(draftId)
    // navigate to business dashboard if filing does *not* fail
    // await navigateTo(dashboardUrl.value, { external: true })
  } catch (error) {
    await modal.openSaveFilingErrorModal(error)
  }
}

async function cancelFiling() {
  // TODO: should checkHasChanges to common parties code? Effects quite a few things across the code
  // if (officerStore.checkHasChanges('save')) {
  //   await modal.openUnsavedChangesModal(revokeBeforeUnloadEvent)
  // } else {
  //   await navigateTo(dashboardOrEditUrl.value, { external: true })
  // }
}

async function saveFiling(resumeLater = false, _disableActiveFormCheck = false) {
  // TODO: consolidate with officers - break out common functionality
  try {
    // pull draft id from url or mark as undefined
    const result = liquidatorSchema.safeParse(liquidatorStore.formState)
    if (result.error) {
      // TODO: do not save if there are validation errors
      return
    }
    const draftId = (urlParams.draft as string) ?? undefined

    await liquidatorStore.save(draftId)

    // if resume later, navigate back to business dashboard
    if (resumeLater) {
      await navigateTo(dashboardUrl.value, { external: true })
    }
  } catch (error) {
    await modal.openSaveFilingErrorModal(error)
  }
}

function onError(event: FormErrorEvent) {
  const firstError = event?.errors?.[0]

  if (firstError?.name === 'staffPayment.option') {
    staffPayFormRef.value?.setFocusOnError()
  } else {
    onFormSubmitError(event)
  }
}

// Watcher to handle filing save, cancel, and navigation
// Update later once sub types are defined etc. (should happen after schema ticket is done)
useFilingPageWatcher({
  store: liquidatorStore,
  businessId,
  draftId: urlParams.draft as string | undefined,
  filingType: FilingType.CHANGE_OF_LIQUIDATORS,
  filingSubType: 'intentToLiquidate',
  saveFiling: { onClick: () => saveFiling(true) },
  cancelFiling: { onClick: cancelFiling },
  submitFiling: { form: 'liquidator-filing' },
  breadcrumbs,
  setOnBeforeSessionExpired: () => saveFiling(false, true)
})
</script>

<template>
  <UForm
    id="liquidator-filing"
    ref="liquidator-filing"
    :state="liquidatorStore.formState"
    :schema="z.any()"
    novalidate
    class="py-10 space-y-10"
    :aria-label="t('page.manageLiquidators.h1')"
    @submit="submitFiling"
    @error="onError"
  >
    <div class="space-y-1">
      <h1>{{ i18nKeys.h1 }}</h1>
      <!-- TODO: add text/translation -->
      <p>Some liquidator descriptive text</p>
    </div>

    <section class="space-y-4">
      <h2 class="text-base">
        1. {{ $t('label.liquidatorInfo') }}
      </h2>

      <ManageParties
        v-model:active-party="liquidatorStore.formState.activeParty"
        :loading="liquidatorStore.initializing"
        :empty-text="liquidatorStore.initializing ? `${$t('label.loading')}...` : $t('text.noLiquidators')"
        :add-label="$t('label.addLiquidator')"
        :edit-label="$t('label.editLiquidator')"
      />
    </section>

    <FormCourtOrderPoa
      ref="court-order-poa-ref"
      v-model="liquidatorStore.formState.courtOrder"
      name="courtOrder"
      order="2"
      :state="liquidatorStore.formState.courtOrder"
    />

    <FormDocumentId
      ref="document-id-ref"
      v-model="liquidatorStore.formState.documentId"
      name="documentId"
      order="3"
      :state="liquidatorStore.formState.documentId"
    />

    <ConnectFieldset
      v-if="hasIntentToLiquidate"
      :label="'4. ' + $t('label.liquidationRecordsOfficeAddress')"
      :description="$t('text.liquidationRecordsOfficeAddressDesc')"
      body-variant="card"
    >
      <ConnectFormFieldWrapper
        :label="$t('label.liquidationRecordsOfficeAddress')"
        orientation="horizontal"
      >
        <FormAddress
          id="records-office"
          v-model="liquidatorStore.formState.recordsOffice"
          name="recordsOffice"
          nested
          :form-ref="'records-office-ref'"
        />
      </ConnectFormFieldWrapper>
    </ConnectFieldset>

    <!-- TODO: add text/translation -->
    <ConnectFieldset
      :label="(hasIntentToLiquidate ? '5. ' : '4.') + 'Staff Payment'"
      body-variant="card"
    >
      <ConnectFormFieldWrapper label="Payment" orientation="horizontal">
        <StaffPayment
          ref="staff-pay-ref"
          v-model="liquidatorStore.formState.staffPayment"
          :show-priority="true"
          name="staffPayment"
        />
      </ConnectFormFieldWrapper>
    </ConnectFieldset>
  </UForm>
</template>
