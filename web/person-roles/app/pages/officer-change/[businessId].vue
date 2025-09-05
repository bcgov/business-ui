<script setup lang="ts">
import { z } from 'zod'
import type { Form, FormError } from '@nuxt/ui'

const { t } = useI18n()
const rtc = useRuntimeConfig().public
const urlParams = useUrlSearchParams()
const route = useRoute()
const officerStore = useOfficerStore()
const feeStore = useConnectFeeStore()
const accountStore = useConnectAccountStore()
const { setButtonControl, handleButtonLoading, setAlertText } = useButtonControl()
const { baseModal, errorModal } = useModal()
const businessApi = useBusinessApi()

useHead({
  title: t('page.officerChange.title')
})

definePageMeta({
  layout: 'filing',
  middleware: () => {
    // redirect to reg home with return url if user unauthenticated
    const { $connectAuth, $config } = useNuxtApp()
    if (!$connectAuth.authenticated && !$config.public.ci) {
      const returnUrl = encodeURIComponent(window.location.href)
      return navigateTo(
        `${$config.public.registryHomeUrl}login?return=${returnUrl}`,
        { external: true }
      )
    }
  },
  buttonControl: {
    leftGroup: { buttons: [] },
    rightGroup: { buttons: [] }
  }
})

const businessId = route.params.businessId as string
const businessDashboardUrlWithBusinessAndAccount = computed(() =>
  `${rtc.businessDashboardUrl + businessId}?accountid=${accountStore.currentAccount.id}`
)

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
      setAlertText(false, 'right', undefined, t('text.noChangesToSubmit'))
      return
    }

    // validate folio input
    const isFolioValid = await validateFolioNumber()
    if (!isFolioValid) {
      return
    }

    // set submit button as loading, disable all other bottom buttons
    handleButtonLoading(false, 'right', 1)

    // pull draft id from url or mark as undefined
    const draftId = (urlParams.draft as string) ?? undefined

    // check if the business has a pending filing before submit
    const pendingTask = await businessApi.getPendingTask(businessId, 'filing')
    if ((pendingTask && !draftId) || (draftId && draftId !== String(pendingTask?.filing.header.filingId))) {
      // TODO: how granular do we want to be with our error messages?
      // we check pending tasks on page mount
      // this will only occur if a pending task has been created after the initial page mount
      await errorModal.open({
        error: undefined,
        i18nPrefix: 'modal.error.pendingTaskOnSaveOrSubmit'
      })
      return
    }

    // format payload
    const officerData = formatOfficerPayload(JSON.parse(JSON.stringify(officerStore.officerTableState)))
    const payload = businessApi.createFilingPayload<{ changeOfOfficers: OfficerPayload }>(
      officerStore.activeBusiness,
      'changeOfOfficers',
      officerData
    )
    // add folio number if it exists
    if (officerStore.folio.number) {
      payload.filing.header.folioNumber = officerStore.folio.number
    } else if (officerStore.activeBusinessAuthInfo.folioNumber) { // if not, use entity folio number if available
      payload.filing.header.folioNumber = officerStore.activeBusinessAuthInfo.folioNumber
    }
    // set as non legal filing
    payload.filing.header.type = FilingHeaderType.NON_LEGAL

    // if draft id exists, submit final payload as a PUT request to that filing and mark as not draft
    if (draftId) {
      await businessApi.saveOrUpdateDraftFiling(
        officerStore.activeBusiness.identifier,
        payload,
        true,
        draftId
      )
    } else {
      // submit as normal if no draft id
      await businessApi.postFiling(
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
    await errorModal.open({
      error,
      i18nPrefix: 'modal.error.submitFiling'
    })
  } finally {
    handleButtonLoading(true)
  }
}

async function cancelFiling() {
  if (officerStore.checkHasChanges('save')) {
    await baseModal.open({
      title: t('modal.unsavedChanges.title'),
      description: t('modal.unsavedChanges.description'),
      dismissible: false,
      buttons: [
        { label: t('label.keepEditing'), variant: 'outline', size: 'xl', shouldClose: true },
        {
          label: t('label.exitWithoutSaving'),
          size: 'xl',
          onClick: async () => {
            revokeBeforeUnloadEvent()
            await navigateTo(businessDashboardUrlWithBusinessAndAccount.value, {
              external: true
            })
          }
        }
      ]
    })
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
    setAlertText(false, 'left', undefined, t('text.noChangesToSave'))
    return
  }

  // validate folio input
  const isFolioValid = await validateFolioNumber()
  if (!isFolioValid) {
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
    const pendingTask = await businessApi.getPendingTask(businessId, 'filing')
    if ((pendingTask && !draftId) || (draftId && draftId !== String(pendingTask?.filing.header.filingId))) {
      // TODO: how granular do we want to be with our error messages?
      // we check pending tasks on page mount
      // this will only occur if a pending task has been created after the initial page mount
      errorModal.open({
        error: undefined,
        i18nPrefix: 'modal.error.pendingTaskOnSaveOrSubmit'
      })
      return
    }

    // save table state
    const officerTableSnapshot = JSON.parse(JSON.stringify(officerStore.officerTableState))

    // create filing payload
    const payload = businessApi.createFilingPayload<{ changeOfOfficers: OfficerTableState[] }>(
      officerStore.activeBusiness,
      'changeOfOfficers',
      { changeOfOfficers: officerTableSnapshot }
    )

    // add folio number & set as non legal filing
    payload.filing.header.folioNumber = officerStore.folio.number
    payload.filing.header.type = FilingHeaderType.NON_LEGAL

    // save filing as draft
    const res = await businessApi.saveOrUpdateDraftFiling(
      officerStore.activeBusiness.identifier,
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
      await navigateTo(
        businessDashboardUrlWithBusinessAndAccount.value,
        { external: true }
      )
    }
  } catch (error) {
    errorModal.open({
      error,
      i18nPrefix: 'modal.error.submitFiling'
    })
  } finally {
    handleButtonLoading(true)
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

// init officers on mount and when account changes
// update breadcrumbs and bottom buttons when account changes
watch(
  () => accountStore.currentAccount.id,
  async (id) => {
    // load officer info
    const draftId = (urlParams.draft as string) ?? undefined
    await officerStore.initOfficerStore(businessId, draftId)

    // load fees
    if (officerStore.activeBusiness.legalType !== undefined) {
      try {
        const officerFeeCode = 'NOCOI'
        await feeStore.initFees(
          [
            { code: officerFeeCode, entityType: officerStore.activeBusiness.legalType, label: t('label.officerChange') }
          ],
          { label: t('label.officerChange'), matchServiceFeeToCode: officerFeeCode }
        )
        feeStore.addReplaceFee(officerFeeCode)
      } catch {
      // do nothing if fee failed
      }
    }

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
      leftGroup: {
        buttons: [
          { onClick: () => saveFiling(), label: t('label.save'), variant: 'outline' },
          { onClick: () => saveFiling(true), label: t('label.saveResumeLater'), variant: 'outline' }
        ]
      },
      rightGroup: {
        buttons: [
          { onClick: cancelFiling, label: t('label.cancel'), variant: 'outline' },
          { onClick: submitFiling, label: t('label.submit'), trailingIcon: 'i-mdi-chevron-right' }
        ]
      }
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
      <h2 class="text-lg">
        1. {{ $t('label.officerInfo') }}
      </h2>
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
            @focusin="setAlertText(true)"
          />
        </ConnectFormFieldWrapper>
      </UForm>
    </section>
  </div>
</template>
