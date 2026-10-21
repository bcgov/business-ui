<script setup lang="ts">
const brdModal = useBrdModals()
const affStore = useAffiliationsStore()
const affNav = useAffiliationNavigation()
const ldStore = useConnectLaunchdarklyStore()
const { t, tm, rt } = useI18n()

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

async function handleClosed () {
  // newlyAddedIdentifier makes the reload highlight and scroll to the new row.
  affStore.newlyAddedIdentifier = props.identifier
  await affStore.loadAffiliations()
}
</script>

<template>
  <ModalBase
    :title="t('modal.addBusinessSuccess.title', { name: businessName })"
    :actions="reviewImportedDataEnabled
      ? [
        { label: t('btn.close'), variant: 'outline', handler: () => brdModal.close() },
        { label: t('modal.addBusinessSuccess.reviewNow'), handler: () => affNav.goToDashboard(identifier) }
      ]
      : [{ label: t('btn.ok'), handler: () => brdModal.close() }]"
    @modal-closed="handleClosed"
  >
    <div class="-my-6 space-y-2">
      <p v-for="text in tm('modal.addBusinessSuccess.description')" :key="text" class="text-bcGovColor-darkGray">
        {{ rt(text) }}
      </p>
      <div
        v-if="reviewImportedDataEnabled && showMigrationWarning"
        class="flex items-start gap-3 rounded border border-red-400 bg-red-50 p-3 text-sm text-bcGovColor-darkGray"
        role="alert"
      >
        <UIcon name="i-mdi-alert" class="mt-0.5 size-5 shrink-0 text-red-600" />
        <p class="flex-1">
          <strong>{{ t('modal.addBusinessSuccess.important') }}</strong>
          {{ t('modal.addBusinessSuccess.migrationWarning', { name: businessName }) }}
        </p>
        <UButton
          :aria-label="t('btn.close')"
          color="gray"
          variant="ghost"
          icon="i-mdi-close"
          size="xs"
          class="-mr-1 -mt-1"
          @click="showMigrationWarning = false"
        />
      </div>
    </div>
  </ModalBase>
</template>

<style scoped>
:deep(.sm\:max-w-lg) {
  max-width: 42rem; /* sm:max-w-2xl */
}
</style>
