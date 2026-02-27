<script setup lang="ts">
import { z } from 'zod'

definePageMeta({
  layout: 'connect-pay-tombstone-buttons',
  middleware: [
    // Check for login redirect
    'connect-auth'
  ]
})

const { t } = useI18n()
const urlParams = useUrlSearchParams()
const route = useRoute()
const modal = useFilingModals()
const officerStore = useOfficerStore()
const { initializing } = storeToRefs(officerStore)
const { handleButtonLoading, setAlertText: setBtnCtrlAlert } = useConnectButtonControl()
const { setAlert: setSubFormAlert } = useFilingAlerts('manage-parties')

const FILING_TYPE = FilingType.CHANGE_OF_OFFICERS

const businessId = route.params.businessId as string

const filingText = {
  desc: $t(`page.${FILING_TYPE}.desc`),
  h1: t(`page.${FILING_TYPE}.h1`),
  title: t(`page.${FILING_TYPE}.title`)
}

useHead({ title: filingText.title })

const { dashboardUrl, breadcrumbs } = useFilingNavigation(filingText.h1)

const {
  canSubmit,
  canSave,
  canCancel,
  initBeforeUnload,
  revokeBeforeUnload
} = useFilingTaskGuards(
  [
    [() => officerStore.initialFormState, () => officerStore.formState],
    [() => officerStore.initialOfficers, () => officerStore.officers]
  ],
  () => !!officerStore.officers.find(r => r.new.actions.length > 0)
)

const officerRoles = [
  RoleTypeUi.CEO,
  RoleTypeUi.CFO,
  RoleTypeUi.PRESIDENT,
  RoleTypeUi.VICE_PRESIDENT,
  RoleTypeUi.CHAIR,
  RoleTypeUi.TREASURER,
  RoleTypeUi.SECRETARY,
  RoleTypeUi.ASSISTANT_SECRETARY,
  RoleTypeUi.OTHER
]

// submit final filing
async function submitFiling() {
  try {
    setBtnCtrlAlert(undefined)
    if (officerStore.formState.activeParty !== undefined) {
      return setSubFormAlert('party-details-form', t('text.finishTaskBeforeSubmit'))
    }
    if (!canSubmit()) {
      return setBtnCtrlAlert(t('text.noChangesToSubmit'), 'right')
    }
    handleButtonLoading(true, 'right', 1)
    await officerStore.submit(true)
    revokeBeforeUnload()
    await navigateTo(dashboardUrl.value, { external: true })
  } catch (error) {
    await modal.openSaveFilingErrorModal(error)
    handleButtonLoading(false)
    initBeforeUnload()
  }
}

async function cancelFiling() {
  if (!canCancel()) {
    return
  }
  await navigateTo(dashboardUrl.value, { external: true })
}

async function saveFiling(enableUnsavedChangesBlock = true) {
  try {
    if (enableUnsavedChangesBlock) {
      if (officerStore.formState.activeParty !== undefined) {
        return setSubFormAlert('party-details-form', t('text.finishTaskBeforeSave'))
      }
      if (!canSave()) {
        return setBtnCtrlAlert(t('text.noChangesToSave'), 'left')
      }
    }
    await officerStore.submit(false)
    revokeBeforeUnload()
    await navigateTo(dashboardUrl.value, { external: true })
  } catch (error) {
    if (enableUnsavedChangesBlock) {
      await modal.openSaveFilingErrorModal(error)
      initBeforeUnload()
    }
  }
}

// Watcher to handle filing save, cancel, and navigation
useFilingPageWatcher({
  store: officerStore,
  businessId,
  filingType: FILING_TYPE,
  draftId: urlParams.draft as string | undefined,
  saveFiling: { onClick: () => saveFiling() },
  cancelFiling: { onClick: cancelFiling },
  submitFiling: { form: 'officer-filing' },
  breadcrumbs,
  setOnBeforeSessionExpired: async () => {
    if (canSave()) {
      // FUTURE: currently even if a draft is saved it doesnt include the
      // draft url param to reload the draft once the user logs back in
      // ticket 32173
      await saveFiling(false)
    }
  }
})
</script>

<template>
  <ConnectSpinner v-if="initializing" fullscreen />
  <UForm
    id="officer-filing"
    ref="officer-filing"
    data-testid="officer-form"
    :state="officerStore.formState"
    :schema="z.any()"
    novalidate
    class="py-6 space-y-6 sm:py-10 sm:space-y-10"
    :aria-label="filingText.h1"
    @error="onFormSubmitError"
    @submit="submitFiling"
  >
    <div class="space-y-1">
      <h1>{{ filingText.h1 }}</h1>
      <p>{{ filingText.desc }}</p>
    </div>

    <section class="space-y-4">
      <h2 class="text-lg">
        1. {{ $t('label.officerInfo') }}
      </h2>
      <p class="-mt-2">
        {{ $t('text.officerInfoDescription') }}
      </p>

      <ManageParties
        v-model:active-party="officerStore.formState.activeParty"
        :loading="officerStore.initializing"
        :empty-text="officerStore.initializing ? `${$t('label.loading')}...` : $t('text.noOfficers')"
        :add-label="$t('label.addOfficer')"
        :edit-label="$t('label.editOfficer')"
        :columns-to-display="['name', 'roles', 'delivery', 'mailing', 'actions']"
        :party-form-props="{
          partyNameProps: { allowBusinessName: false, allowPreferredName: true },
          partyRoleProps: { allowedRoles: officerRoles, roleClass: RoleClass.OFFICER }
        }"
      />
    </section>
    <FormFolio
      v-model="officerStore.formState.folio"
      data-testid="form-section-folio-number"
      :disabled="initializing"
      name="folio"
      order="2"
    />
  </UForm>
</template>
