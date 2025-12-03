<script setup lang="ts">
import type { FormSubmitEvent, FormErrorEvent } from '@nuxt/ui'
import { z } from 'zod'

const { t } = useI18n()
const urlParams = useUrlSearchParams()
const route = useRoute()
const { setButtonControl } = useConnectButtonControl()
const modal = useFilingModals()
const liquidatorSchema = getLiquidatorsSchema()
const liquidatorStore = useLiquidatorStore()
const businessStore = useBusinessStore()
const feeStore = useConnectFeeStore()
const accountStore = useConnectAccountStore()

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

// TODO: consolidate with officers
watch(
  () => accountStore.currentAccount.id,
  async () => {
    const draftId = (urlParams.draft as string) ?? undefined
    await liquidatorStore.init(businessId, draftId)

    // load fees
    if (businessStore.business?.legalType !== undefined) {
      try {
        // TODO: update init with actual fee codes -> potentially move this into common code
        const officerFeeCode = 'NOCOI'
        await feeStore.initFees(
          [
            { code: officerFeeCode, entityType: businessStore.business.legalType, label: t('label.officerChange') }
          ],
          // TODO: need design input
          { label: i18nKeys.value.h1 }
        )
      } catch {
        // do nothing if fee failed
      }
    }

    setBreadcrumbs(breadcrumbs.value)

    setButtonControl({
      leftGroup: {
        buttons: [
          { onClick: () => saveFiling(true), label: t('label.saveResumeLater'), variant: 'outline' }
        ]
      },
      rightGroup: {
        buttons: [
          { onClick: cancelFiling, label: t('label.cancel'), variant: 'outline' },
          {
            label: t('label.submit'),
            type: 'submit',
            trailingIcon: 'i-mdi-chevron-right',
            // @ts-expect-error - form attr will be typed once this change has been published
            // https://github.com/nuxt/ui/pull/5348
            form: 'liquidator-filing'
          }
        ]
      }
    })

    // save filing before user logged out when session expires
    setOnBeforeSessionExpired(async () => {
      await saveFiling(false, true)
    })
  },
  { immediate: true }
)
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
      <FormAddress
        id="records-address"
        v-model="liquidatorStore.formState.recordsAddress"
        name="recordsAddress"
        nested
        :form-ref="'records-address-ref'"
      />
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
