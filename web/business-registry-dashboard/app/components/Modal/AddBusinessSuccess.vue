<script setup lang="ts">
const brdModal = useBrdModals()
const affStore = useAffiliationsStore()
const { t } = useNuxtApp().$i18n

defineProps<{
  businessName: string
  identifier: string
}>()

async function handleClose () {
  await affStore.loadAffiliations()
  brdModal.close()
}
</script>

<template>
  <ModalBase
    :title="t('modal.addBusinessSuccess.title', { name: businessName })"
    :actions="[
      { label: t('btn.ok'), handler: handleClose }
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
