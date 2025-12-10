<script setup lang="ts">
import { z } from 'zod'
import type { Form, FormError } from '@nuxt/ui'

const { t } = useI18n()
const urlParams = useUrlSearchParams()
const route = useRoute()
const officerStore = useOfficerStore()
const businessStore = useBusinessStore()
const { setAlertText } = useConnectButtonControl()
const modal = useFilingModals()
const businessApi = useBusinessApi()
const { breadcrumbs, dashboardUrl, dashboardOrEditUrl } = useFilingNavigation(t('page.officerChange.h1'))

useHead({
  title: t('page.officerChange.title')
})

definePageMeta({
  layout: 'connect-pay-tombstone-buttons',
  middleware: [
    // Check for login redirect
    'connect-auth'
  ],
  buttonControl: {
    leftGroup: { buttons: [] },
    rightGroup: { buttons: [] }
  }
})

const businessId = route.params.businessId as string

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
  await setAlertText()
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
      setAlertText(t('text.noChangesToSubmit'), 'right')
      return
    }

    // validate folio input
    const isFolioValid = await validateFolioNumber()
    if (!isFolioValid) {
      return
    }

    // pull draft id from url or mark as undefined
    const draftId = (urlParams.draft as string) ?? undefined

    // check if the business has a pending filing before submit
    const pendingTask = await businessApi.getPendingTask(businessId, 'filing')
    if ((pendingTask && !draftId) || (draftId && draftId !== String(pendingTask?.filing.header.filingId))) {
      // TODO: how granular do we want to be with our error messages?
      // we check pending tasks on page mount
      // this will only occur if a pending task has been created after the initial page mount
      await modal.openPendingTaskOnSaveOrSubmitModal()
      return
    }

    // format payload
    const officerData = formatOfficerPayload(JSON.parse(JSON.stringify(officerStore.officerTableState)))
    const folioNumber = officerStore.folio.number ?? businessStore.businessFolio
    const payload = businessApi.createFilingPayload<{ changeOfOfficers: OfficerPayload }>(
      businessStore.business!,
      FilingType.CHANGE_OF_OFFICERS,
      officerData,
      (folioNumber ? { folioNumber } : {})
    )

    // if draft id exists, submit final payload as a PUT request to that filing and mark as not draft
    if (draftId) {
      await businessApi.saveOrUpdateDraftFiling(
        businessStore.businessIdentifier!,
        payload,
        true,
        draftId
      )
    } else {
      // submit as normal if no draft id
      await businessApi.postFiling(
        businessStore.businessIdentifier!,
        payload
      )
    }
    // remove window beforeUnload event to prevent navigation block
    revokeBeforeUnloadEvent()
    // navigate to business dashboard if filing does *not* fail
    await navigateTo(dashboardUrl.value, { external: true })
  } catch (error) {
    await modal.openSaveFilingErrorModal(error)
  }
}

async function cancelFiling() {
  if (officerStore.checkHasChanges('save')) {
    await modal.openUnsavedChangesModal(revokeBeforeUnloadEvent)
  } else {
    await navigateTo(dashboardOrEditUrl.value, { external: true })
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
    setAlertText(t('text.noChangesToSave'), 'left')
    return
  }

  // validate folio input
  const isFolioValid = await validateFolioNumber()
  if (!isFolioValid) {
    return
  }

  try {
    // pull draft id from url or mark as undefined
    const draftId = (urlParams.draft as string) ?? undefined

    // check if the business has a pending filing before submit
    const pendingTask = await businessApi.getPendingTask(businessId, 'filing')
    if ((pendingTask && !draftId) || (draftId && draftId !== String(pendingTask?.filing.header.filingId))) {
      // TODO: how granular do we want to be with our error messages?
      // we check pending tasks on page mount
      // this will only occur if a pending task has been created after the initial page mount
      await modal.openPendingTaskOnSaveOrSubmitModal()
      return
    }

    // save table state
    const officerTableSnapshot = JSON.parse(JSON.stringify(officerStore.officerTableState))

    // create filing payload
    const payload = businessApi.createFilingPayload<{ changeOfOfficers: OfficerTableState[] }>(
      businessStore.business!,
      FilingType.CHANGE_OF_OFFICERS,
      { changeOfOfficers: officerTableSnapshot },
      { folioNumber: officerStore.folio.number }
    )

    // save filing as draft
    const res = await businessApi.saveOrUpdateDraftFiling(
      businessStore.businessIdentifier!,
      payload,
      false,
      draftId
    )

    // update saved draft state to track changes
    officerStore.filingDraftState = res

    // update url with filing id
    // required if it's the first time 'save draft' was clicked
    // if page refreshes, the correct data will be reloaded
    urlParams.draft = String(res.filing.header.filingId)

    // if resume later, navigate back to business dashboard
    if (resumeLater) {
      revokeBeforeUnloadEvent()
      await navigateTo(dashboardUrl.value, { external: true })
    }
  } catch (error) {
    await modal.openSaveFilingErrorModal(error)
  }
}

// folio number stuff
const folioSchema = z.object({
  number: z.string().max(50, t('connect.validation.maxChars', { count: 50 })).optional()
})
type FolioSchema = z.output<typeof folioSchema>
const folioFormRef = useTemplateRef<Form<FolioSchema>>('folio-form')
const folioErrors = computed<FormError[] | undefined>(() => {
  const errors = folioFormRef.value?.getErrors()
  return errors
})
async function validateFolioNumber() {
  const errors = folioFormRef.value?.getErrors()
  if (errors && errors[0]) {
    await folioFormRef.value?.validate({ silent: true })
    const el = document.getElementById('folio-number')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.focus({ preventScroll: true })
    }
    return false
  }
  return true
}

// Watcher to handle filing save, cancel, and navigation
useFilingPageWatcher({
  store: officerStore,
  businessId,
  draftId: urlParams.draft as string | undefined,
  feeCode: 'NOCOI',
  feeLabel: t('label.officerChange'),
  pageLabel: t('page.officerChange.h1'),
  formId: 'officer-filing',
  saveFiling: { clickEvent: () => saveFiling(true), label: t('label.saveResumeLater') },
  cancelFiling: { clickEvent: cancelFiling, label: t('label.cancel') },
  submitFiling: { clickEvent: submitFiling, label: t('label.submit') },
  breadcrumbs
})
</script>

<template>
  <div class="py-10 space-y-8">
    <div class="space-y-1">
      <h1>{{ $t('page.officerChange.h1') }}</h1>
      <p>{{ $t('page.officerChange.desc') }}</p>
    </div>

    <section class="space-y-4">
      <h2 class="text-lg">
        1. {{ $t('label.officerInfo') }}
      </h2>
      <p class="-mt-2">
        {{ $t('text.officerInfoDescription') }}
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

      <TableOfficerChange @table-action="setAlertText()" />
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-lg">
        2. {{ $t('label.folioOrRefNumber') }}
      </h2>
      <p class="-mt-2">
        {{ $t('text.trackFolio') }}
      </p>

      <UForm
        ref="folio-form"
        data-testid="folio-form"
        :state="officerStore.folio"
        :schema="folioSchema"
        class="bg-white p-6 rounded-sm shadow-sm"
        :class="{
          'border-l-3 border-red-600': folioErrors && folioErrors[0]
        }"
      >
        <ConnectFormFieldWrapper
          :label="$t('label.folioOrRefNumber')"
          orientation="horizontal"
          :error="folioErrors && folioErrors[0] ? folioErrors[0] : undefined"
        >
          <ConnectFormInput
            v-model="officerStore.folio.number"
            data-testid="form-field-folio-number"
            name="number"
            :label="$t('label.folioOrRefNumberOpt')"
            input-id="folio-number"
            @focusin="setAlertText()"
          />
        </ConnectFormFieldWrapper>
      </UForm>
    </section>
  </div>
</template>
