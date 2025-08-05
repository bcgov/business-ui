<script setup lang="ts">
const { t } = useI18n()
const rtc = useRuntimeConfig().public
const urlParams = useUrlSearchParams()
const route = useRoute()
const officerStore = useOfficerStore()
const feeStore = useConnectFeeStore()
const accountStore = useConnectAccountStore()
const { setButtonControl, handleButtonLoading, setAlertText } = useButtonControl()
const modal = useModal()
const legalApi = useLegalApi()

useHead({
  title: t('page.officerChange.title')
})

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
const businessDashboardUrlWithBusinessAndAccount = computed(() =>
  `${rtc.businessDashboardUrl + businessId}?accountid=${accountStore.currentAccount.id}`
)

// TODO: get fee from pay api?
// set empty fee
feeStore.feeOptions.showServiceFees = false
feeStore.fees = {
  OFFICER_CHANGE: {
    filingFees: 0,
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

// TODO: how to not run this if the users sessions was expired, save draft automatically? ignore changes and logout?
// show browser error if unsaved changes
function onBeforeUnload(event: BeforeUnloadEvent) {
  if (officerStore.checkHasChanges('save')) {
    event.preventDefault()
    // legacy browsers
    event.returnValue = true
  }
}

const revokeBeforeUnloadEvent = useEventListener(window, 'beforeunload', onBeforeUnload)

// add new officer to table state
async function onFormSubmit(data: Officer) {
  officerStore.addNewOfficer(data)
  officerStore.addingOfficer = false
}

async function onAddOfficerClick() {
  const hasActiveForm = await officerStore.checkHasActiveForm('change')
  if (hasActiveForm) {
    return
  }
  officerStore.addingOfficer = true
  // reset any alert text in button control component
  await setAlertText(true)
}

// submit final filing
async function submitFiling() {
  try {
    // prevent submit if there is a form currently open
    const hasActiveForm = await officerStore.checkHasActiveForm('submit')
    if (hasActiveForm) {
      return
    }

    // prevent submit if there are no changes
    if (!officerStore.checkHasChanges('submit')) {
      setAlertText(false, 'right', t('text.noChangesToSubmit'))
      return
    }

    // set submit button as loading, disable all other bottom buttons
    handleButtonLoading(false, 'right', 1)

    // pull draft id from url or mark as undefined
    const draftId = (urlParams.draft as string) ?? undefined

    // check if the business has a pending filing before submit
    const pendingTask = await legalApi.getPendingTask(businessId, 'filing')
    if ((pendingTask && !draftId) || (draftId && draftId !== String(pendingTask?.filing.header.filingId))) {
      // TODO: how granular do we want to be with our error messages?
      // we check pending tasks on page mount
      // this will only occur if a pending task has been created after the initial page mount
      modal.openBaseErrorModal(
        undefined,
        'modal.error.pendingTaskOnSaveOrSubmit'
      )
      return
    }

    // format payload
    const officerData = formatOfficerPayload(JSON.parse(JSON.stringify(officerStore.officerTableState)))
    const payload = legalApi.createFilingPayload<{ changeOfOfficers: OfficerPayload }>(
      officerStore.activeBusiness,
      'changeOfOfficers',
      officerData
    )
    // add folio number // TODO: validation?
    payload.filing.header.folioNumber = officerStore.folioNumber
    payload.filing.header.type = FilingHeaderType.NON_LEGAL

    // if draft id exists, submit final payload as a PUT request to that filing and mark as not draft
    if (draftId) {
      await legalApi.saveOrUpdateDraftFiling(
        officerStore.activeBusiness.identifier,
        payload,
        true,
        draftId
      )
    } else {
      // submit as normal if no draft id
      await legalApi.postFiling(
        officerStore.activeBusiness.identifier,
        payload
      )
    }
    // remove window beforeUnload event to prevent navigation block
    revokeBeforeUnloadEvent()
    // navigate to business dashboard if filing does *not* fail
    await navigateTo(
      businessDashboardUrlWithBusinessAndAccount.value,
      { external: true }
    )
  } catch (error) {
    modal.openBaseErrorModal(
      error,
      'modal.error.submitFiling'
    )
  } finally {
    handleButtonLoading(true)
  }
}

async function cancelFiling() {
  if (officerStore.checkHasChanges('save')) {
    await modal.openBaseModal(
      t('modal.unsavedChanges.title'),
      t('modal.unsavedChanges.description'),
      false,
      [
        { label: t('btn.keepEditing'), variant: 'outline', size: 'xl', shouldClose: true },
        {
          label: t('btn.exitWithoutSaving'),
          size: 'xl',
          onClick: async () => {
            revokeBeforeUnloadEvent()
            await navigateTo(businessDashboardUrlWithBusinessAndAccount.value, {
              external: true
            })
          }
        }
      ]
    )
  } else {
    await navigateTo(
      businessDashboardUrlWithBusinessAndAccount.value,
      { external: true }
    )
  }
}

async function saveFiling(resumeLater = false, disableActiveFormCheck = false) {
  // disable active task check for saving filing on session timeout
  if (!disableActiveFormCheck) {
    // prevent save if there is a form currently open
    const hasActiveForm = await officerStore.checkHasActiveForm('save')
    if (hasActiveForm) {
      return
    }
  }

  // prevent save if there are no changes
  if (!officerStore.checkHasChanges('save')) {
    setAlertText(false, 'left', t('text.noChangesToSave'))
    return
  }

  try {
    // set appropriate button loading state
    if (resumeLater) {
      handleButtonLoading(false, 'left', 1)
    } else {
      handleButtonLoading(false, 'left', 0)
    }

    // pull draft id from url or mark as undefined
    const draftId = (urlParams.draft as string) ?? undefined

    // check if the business has a pending filing before submit
    const pendingTask = await legalApi.getPendingTask(businessId, 'filing')
    if ((pendingTask && !draftId) || (draftId && draftId !== String(pendingTask?.filing.header.filingId))) {
      // TODO: how granular do we want to be with our error messages?
      // we check pending tasks on page mount
      // this will only occur if a pending task has been created after the initial page mount
      modal.openBaseErrorModal(
        undefined,
        'modal.error.pendingTaskOnSaveOrSubmit'
      )
      return
    }

    // save table state
    const officerTableSnapshot = JSON.parse(JSON.stringify(officerStore.officerTableState))

    // create filing payload
    const payload = legalApi.createFilingPayload<{ changeOfOfficers: OfficerTableState[] }>(
      officerStore.activeBusiness,
      'changeOfOfficers',
      { changeOfOfficers: officerTableSnapshot }
    )

    // add folio number // TODO: validation?
    payload.filing.header.folioNumber = officerStore.folioNumber
    payload.filing.header.type = FilingHeaderType.NON_LEGAL

    // save filing as draft
    const res = await legalApi.saveOrUpdateDraftFiling(
      officerStore.activeBusiness.identifier,
      payload,
      false,
      draftId
    )

    // update saved draft state to track changes
    officerStore.officerDraftTableState = officerTableSnapshot

    // update url with filing id
    // required if it's the first time 'save draft' was clicked
    // if page refreshes, the correct data will be reloaded
    urlParams.draft = String(res.filing.header.filingId)

    // if resume later, navigate back to business dashboard
    if (resumeLater) {
      revokeBeforeUnloadEvent()
      await navigateTo(
        businessDashboardUrlWithBusinessAndAccount.value,
        { external: true }
      )
    }
  } catch (error) {
    modal.openBaseErrorModal(
      error,
      'modal.error.submitFiling'
    )
  } finally {
    handleButtonLoading(true)
  }
}

// init officers on mount and when account changes
// update breadcrumbs and bottom buttons when account changes
watch(
  () => accountStore.currentAccount.id,
  async (id) => {
    const draftId = (urlParams.draft as string) ?? undefined
    await officerStore.initOfficerStore(businessId, draftId)

    setBreadcrumbs([
      {
        label: t('label.bcRegistriesDashboard'),
        to: `${rtc.registryHomeUrl}dashboard`,
        external: true,
        appendAccountId: true
      },
      {
        label: t('label.myBusinessRegistry'),
        to: `${rtc.brdUrl}account/${id}`,
        external: true
      },
      {
        label: officerStore.activeBusiness.legalName,
        to: `${rtc.businessDashboardUrl + businessId}`,
        appendAccountId: true,
        external: true
      },
      {
        label: t('page.officerChange.h1')
      }
    ])

    setButtonControl({
      leftButtons: [
        { onClick: () => saveFiling(), label: t('btn.save'), variant: 'outline' },
        { onClick: () => saveFiling(true), label: t('btn.saveExit'), variant: 'outline' }
      ],
      rightButtons: [
        { onClick: cancelFiling, label: t('btn.cancel'), variant: 'outline' },
        { onClick: submitFiling, label: t('btn.submit'), trailingIcon: 'i-mdi-chevron-right' }
      ]
    })

    // save filing before user logged out when session expires
    setOnBeforeSessionExpired(async () => {
      revokeBeforeUnloadEvent()
      await saveFiling(false, true)
    })
  },
  { immediate: true }
)
</script>

<template>
  <div class="py-10 space-y-8">
    <h1>{{ $t('page.officerChange.h1') }}</h1>

    <section class="space-y-4">
      <h3 class="text-lg">
        1. Officer Information
      </h3>
      <p class="-mt-2">
        {{ $t('text.trackOfficers') }}
      </p>
      <UButton
        :label="$t('label.addOfficer')"
        class="px-5 py-3"
        color="primary"
        icon="i-mdi-account-plus"
        variant="outline"
        :disabled="officerStore.initializing"
        @click="onAddOfficerClick"
      />

      <FormOfficerChange
        v-if="officerStore.addingOfficer"
        :title="$t('label.addOfficer')"
        @officer-change="onFormSubmit"
        @cancel="officerStore.addingOfficer = false"
      />

      <TableOfficerChange @table-action="setAlertText(true)" />
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-lg">
        2. {{ $t('label.folioNumberOpt') }}
      </h2>
      <p class="-mt-2">
        {{ $t('text.trackFolio') }}
      </p>

      <UForm
        :state="{}"
        class="bg-white p-6 rounded-sm shadow-sm"
        :class="{
          'border-l-3 border-red-600': false
        }"
      >
        <FormSection
          :label="$t('label.folioNumber')"
          orientation="horizontal"
        >
          <FormFieldInput
            v-model="officerStore.folioNumber"
            name="folionumber"
            :label="$t('label.folioNumberOpt')"
            input-id="folio-number"
          />
        </FormSection>
      </UForm>
    </section>
  </div>
</template>
