<script setup lang="ts">
const brdModal = useBrdModals()
const affNav = useAffiliationNavigation()
const affStore = useAffiliationsStore()
const { t } = useNuxtApp().$i18n

const props = defineProps<{
  businessName: string
  identifier: string
}>()

async function handleManageBusiness () {
  brdModal.close()
  await affNav.goToDashboard(props.identifier)
}

async function handleClose () {
  await affStore.loadAffiliations()
  brdModal.close()
}
</script>

<template>
  <ModalBase
    :title="t('modal.addBusinessSuccess.title', { name: businessName })"
    :actions="[
      { label: t('btn.close'), variant: 'outline', handler: handleClose },
      { label: t('modal.addBusinessSuccess.manageBusiness'), handler: handleManageBusiness }
    ]"
    @modal-closed="handleClose"
  >
    <div class="-my-6 space-y-2">
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
