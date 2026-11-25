<script setup lang="ts">
const brdModal = useBrdModals()
const affStore = useAffiliationsStore()
const affNav = useAffiliationNavigation()
const ldStore = useConnectLaunchdarklyStore()
const { t } = useNuxtApp().$i18n

const props = defineProps<{
  businessName: string
  identifier: string
}>()

const showMigrationWarning = ref(true)
const reviewImportedDataEnabled = computed(() => {
  const enabledFeatures = ldStore.getStoredFlag(LDFlags.EnableNewFeature)
  return typeof enabledFeatures === 'string' &&
    enabledFeatures.split(',').some(feature => feature.trim() === 'review-imported-data')
})
const canReviewImportedData = computed(() =>
  reviewImportedDataEnabled.value && IsAuthorized(AuthorizedActions.REVIEW_IMPORTED_DATA_FILING)
)

// only warn while the business still has an unfiled Review Imported Data todo or draft (i.e. migration errors to fix)
type BusinessTask = { task?: { todo?: { header?: { name?: string } }, filing?: { header?: { name?: string } } } }
const hasMigrationIssues = ref(false)
const checkingMigrationIssues = ref(false)
onBeforeMount(async () => {
  if (!canReviewImportedData.value) {
    return
  }
  checkingMigrationIssues.value = true
  try {
    const { $businessApi } = useNuxtApp()
    const { tasks } = await $businessApi<{ tasks: BusinessTask[] }>(`/businesses/${props.identifier}/tasks`)
    hasMigrationIssues.value = !!tasks?.some(({ task }) =>
      (task?.todo?.header?.name || task?.filing?.header?.name) === 'reviewImportedData'
    )
  } catch (error) {
    console.error('Failed to fetch business tasks:', error)
  } finally {
    checkingMigrationIssues.value = false
  }
})

const migrationWarningAlert = computed<ModalAlertProps | undefined>(() => {
  if (!canReviewImportedData.value || !hasMigrationIssues.value || !showMigrationWarning.value) {
    return undefined
  }
  return {
    color: 'red',
    icon: 'i-mdi-alert',
    title: `${t('modal.addBusinessSuccess.important')} `,
    translationPath: 'modal.addBusinessSuccess.migrationWarning',
    variant: 'subtle',
    extraTextCtx: { name: props.businessName },
    closeButton: { icon: 'i-mdi-close', color: 'gray', variant: 'ghost' },
    ui: { title: 'inline font-bold', description: 'inline mt-0' }
  }
})

async function handleClosed () {
  // newlyAddedIdentifier makes the reload highlight and scroll to the new row.
  affStore.newlyAddedIdentifier = props.identifier
  await affStore.loadAffiliations()
}
</script>

<template>
  <ModalBase
    :alert="migrationWarningAlert"
    alert-placement="body"
    :stacked-header="reviewImportedDataEnabled"
    :title="t('modal.addBusinessSuccess.title', { name: businessName })"
    :actions="reviewImportedDataEnabled
      ? [
        { label: t('btn.close'), variant: 'outline', handler: () => brdModal.close() },
        { label: t('modal.addBusinessSuccess.reviewNow'), handler: () => affNav.goToDashboard(identifier) }
      ]
      : [{ label: t('btn.ok'), handler: () => brdModal.close() }]"
    @modal-closed="handleClosed"
    @alert-closed="showMigrationWarning = false"
  >
    <div :class="['space-y-2', reviewImportedDataEnabled ? '-mt-8' : '-my-6']">
      <p v-for="text in $tm('modal.addBusinessSuccess.description')" :key="text" class="text-bcGovColor-darkGray">
        {{ $rt(text) }}
      </p>
      <USkeleton v-if="checkingMigrationIssues" class="mt-4 h-12 w-full" data-testid="migration-check-loading" />
    </div>
  </ModalBase>
</template>

<style scoped>
:deep(.sm\:max-w-lg) {
  max-width: 42rem; /* sm:max-w-2xl */
}
</style>
