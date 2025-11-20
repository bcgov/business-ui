<script setup lang="ts">
import { UIcon } from '#components'
import { useReceiverStore } from '~/stores/receivers'

const { t } = useI18n()
const urlParams = useUrlSearchParams()
const route = useRoute()
const receiverStore = useReceiverStore()
const { formSchema, formState, initializing } = storeToRefs(receiverStore)
const businessStore = useBusinessStore()
const feeStore = useConnectFeeStore()
const accountStore = useConnectAccountStore()
const { setButtonControl } = useConnectButtonControl()
const modal = useFilingModals()
const { dashboardUrl } = useFilingNavigation(t('page.manageReceivers.h1'))
const rtc = useRuntimeConfig().public

useHead({
  title: t('page.manageReceivers.title')
})

definePageMeta({
  layout: 'connect-pay-tombstone-buttons',
  middleware: [
    // Mock auth if playwright is running
    'mock-connect-auth',
    // Check for login redirect
    'connect-auth'
  ],
  buttonControl: {
    leftGroup: { buttons: [] },
    rightGroup: { buttons: [] }
  }
})

const businessId = route.params.businessId as string

// TODO: consolidate code with officers / make common
const breadcrumbs = computed(() => [
  {
    label: t('label.bcRegistriesDashboard'),
    to: `${rtc.registryHomeUrl}dashboard`,
    external: true,
    appendAccountId: true
  },
  {
    label: t('label.myBusinessRegistry'),
    to: `${rtc.brdUrl}account/${accountStore.currentAccount.id}`,
    external: true
  },
  {
    label: businessStore.business?.legalName,
    to: dashboardUrl.value,
    external: true
  },
  {
    label: t('page.manageReceivers.h1')
  }
])

// submit final filing
async function submitFiling() {
  try {
    // pull draft id from url or mark as undefined
    const draftId = (urlParams.draft as string) ?? undefined
    await receiverStore.submit(draftId)
    // navigate to business dashboard if filing does *not* fail
    await navigateTo(dashboardUrl.value, { external: true })
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

async function saveFiling(resumeLater = false, disableActiveFormCheck = false) {
  // TODO: consolidate with officers - break out common functionality
  try {
    // pull draft id from url or mark as undefined
    const draftId = (urlParams.draft as string) ?? undefined

    await receiverStore.save(draftId)

    // if resume later, navigate back to business dashboard
    if (resumeLater) {
      await navigateTo(dashboardUrl.value, { external: true })
    }
  } catch (error) {
    await modal.openSaveFilingErrorModal(error)
  }
}

// init officers on mount and when account changes
// update breadcrumbs and bottom buttons when account changes
watch(
  () => accountStore.currentAccount.id,
  async () => {
    // load officer info
    const draftId = (urlParams.draft as string) ?? undefined
    await receiverStore.init(businessId, draftId)

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
          { label: t('page.manageReceivers.h1') }
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
          { onClick: submitFiling, label: t('label.submit'), trailingIcon: 'i-mdi-chevron-right' }
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
  <div class="py-10 space-y-8">
    <!-- TODO: dynamic header? Single catch all heading? -->
    <h1>{{ $t('page.manageReceivers.h1') }}</h1>

    <div v-if="initializing" class="space-y-10 *:h-30 *:w-full *:rounded">
      <USkeleton />
      <USkeleton />
      <USkeleton />
    </div>
    <UForm
      v-else
      ref="receiver-form"
      data-testid="receiver-form"
      :state="formState"
    >
      <!-- TODO: add schema etc. -->
    </UForm>
  </div>
</template>
