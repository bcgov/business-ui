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
const migrationWarningAlert = computed<ModalAlertProps | undefined>(() => {
  if (!reviewImportedDataEnabled.value || !showMigrationWarning.value) {
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
    </div>
  </ModalBase>
</template>

<style scoped>
:deep(.sm\:max-w-lg) {
  max-width: 42rem; /* sm:max-w-2xl */
}
</style>
